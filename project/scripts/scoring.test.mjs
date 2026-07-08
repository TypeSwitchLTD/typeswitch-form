// scripts/scoring.test.mjs
// Tests for src/lib/scoring.ts (SCORING v2).
// Run with: npm run test:scoring
// Bundles the TS source with esbuild, then asserts the score curve and
// that the breakdown always reconciles with the final score.

import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = mkdtempSync(join(tmpdir(), 'scoring-test-'));
const outFile = join(outDir, 'scoring.mjs');

await build({
  entryPoints: [join(projectRoot, 'src/lib/scoring.ts')],
  bundle: true,
  format: 'esm',
  outfile: outFile,
  logLevel: 'silent',
});

const { calculateOverallScore, getScoreBreakdown, calculateWastedTime, SCORING_VERSION, SCORE_FLOOR, SCORE_CEILING } =
  await import(pathToFileURL(outFile).href);

let pass = 0, fail = 0;
const assert = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  OK   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

const m = (over = {}) => ({
  totalErrors: 0, languageErrors: 0, punctuationErrors: 0, deletions: 0,
  averageDelay: 200, frustrationScore: 0, languageSwitches: 10, corrections: 0,
  totalMistakesMade: 0, finalErrors: 0, accuracy: 100, wpm: 50, ...over,
});

console.log(`\nSCORING_VERSION = ${SCORING_VERSION}`);
assert('version is 2', SCORING_VERSION === 2);

console.log('\n[curve] the strict-top score curve');
assert('perfect @50wpm = 100', calculateOverallScore(m()) === 100, `got ${calculateOverallScore(m())}`);
assert('perfect @75wpm = 100', calculateOverallScore(m({ wpm: 75 })) === 100);

let s = calculateOverallScore(m({ languageErrors: 1, wpm: 75 }));
assert(`1 lang error + fast = 92 (gate, no bonus)`, s === 92, `got ${s}`);

s = calculateOverallScore(m({ languageErrors: 2, wpm: 50 }));
assert(`2 lang errors = 88`, s === 88, `got ${s}`);

s = calculateOverallScore(m({ languageErrors: 3, wpm: 50 }));
assert(`3 lang errors = 84 (gate)`, s === 84, `got ${s}`);

s = calculateOverallScore(m({ languageErrors: 10, wpm: 50 }));
assert(`10 lang errors = 68, NOT floor`, s === 68 && s > SCORE_FLOOR, `got ${s}`);

s = calculateOverallScore(m({ languageErrors: 10, punctuationErrors: 5, deletions: 25, frustrationScore: 5, wpm: 35 }), 80);
assert(`bad run lands in 45-55 band`, s >= SCORE_FLOOR && s <= 55, `got ${s}`);

s = calculateOverallScore(m({ languageErrors: 20, punctuationErrors: 20, deletions: 60, frustrationScore: 10, wpm: 10 }), 60);
assert(`worst case = floor ${SCORE_FLOOR}`, s === SCORE_FLOOR, `got ${s}`);

console.log('\n[gates] quality gates');
s = calculateOverallScore(m({ accuracy: 85 }));
assert('accuracy < 90% caps at 75', s === 75, `got ${s}`);
s = calculateOverallScore(m({ languageErrors: 6, wpm: 75 }));
assert('6 lang errors cap at 72', s <= 72, `got ${s}`);

console.log('\n[bonus] speed bonus only for clean typing');
s = calculateOverallScore(m({ wpm: 75, punctuationErrors: 2 }));
assert('clean-of-lang-errors @75wpm gets +3 (100-3+3=100)', s === 100, `got ${s}`);
const withErr = calculateOverallScore(m({ wpm: 75, languageErrors: 2 }));
const withErrSlow = calculateOverallScore(m({ wpm: 50, languageErrors: 2 }));
assert('speed does NOT buy back language errors', withErr === withErrSlow, `fast=${withErr} slow=${withErrSlow}`);

console.log('\n[slow] no 100 for slow typing');
s = calculateOverallScore(m({ wpm: 40 }));
assert('perfect but 40wpm = 97', s === 97, `got ${s}`);

console.log('\n[reconcile] breakdown always reconciles with the score (fuzz x2000)');
let reconcileFails = 0;
for (let i = 0; i < 2000; i++) {
  const mm = m({
    languageErrors: Math.floor(Math.random() * 15),
    punctuationErrors: Math.floor(Math.random() * 12),
    deletions: Math.floor(Math.random() * 50),
    frustrationScore: Math.floor(Math.random() * 11),
    wpm: Math.floor(Math.random() * 120),
    accuracy: 60 + Math.floor(Math.random() * 41),
  });
  const completion = 60 + Math.floor(Math.random() * 41);
  const score = calculateOverallScore(mm, completion);
  const bd = getScoreBreakdown(mm, completion);
  const raw = 100 - bd.totalPenalty + bd.totalBonus;
  const reconciled = Math.max(SCORE_FLOOR, Math.min(SCORE_CEILING, Math.round(raw)));
  if (Math.abs(reconciled - score) > 1) {
    reconcileFails++;
    if (reconcileFails <= 3) console.log(`  mismatch: score=${score} breakdown=${reconciled}`, JSON.stringify(mm));
  }
  if (score < SCORE_FLOOR || score > SCORE_CEILING) reconcileFails++;
}
assert('0 mismatches in 2000 random cases', reconcileFails === 0, `${reconcileFails} mismatches`);

console.log('\n[safety] garbage input');
s = calculateOverallScore({ languageErrors: NaN, wpm: Infinity, frustrationScore: -5 }, undefined);
assert('garbage -> valid score', s >= SCORE_FLOOR && s <= SCORE_CEILING, `got ${s}`);
assert('wasted time garbage-safe', calculateWastedTime({}) === 0);

rmSync(outDir, { recursive: true, force: true });
console.log(`\n========= ${pass} passed, ${fail} failed =========`);
process.exit(fail > 0 ? 1 : 0);
