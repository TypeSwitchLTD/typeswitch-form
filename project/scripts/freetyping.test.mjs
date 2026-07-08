// scripts/freetyping.test.mjs
// Tests for src/lib/freeTypingAnalysis.ts + the free-typing scoring branch.
// Run with: npm run test:free

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = mkdtempSync(join(tmpdir(), 'free-test-'));

const bundle = async (entry, name) => {
  const out = join(outDir, name);
  await build({ entryPoints: [join(projectRoot, entry)], bundle: true, format: 'esm', outfile: out, logLevel: 'silent' });
  return import(pathToFileURL(out).href);
};

const analysis = await bundle('src/lib/freeTypingAnalysis.ts', 'analysis.mjs');
const scoring = await bundle('src/lib/scoring.ts', 'scoring.mjs');

let pass = 0, fail = 0;
const assert = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  OK   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

// ---------------------------------------------------------------------------
console.log('\n[layout] keyboard-layout mapping');
assert("hebrew 'akuo' maps to 'שלום'", analysis.mapLayout('akuo', 'english', 'hebrew') === 'שלום',
  `got ${analysis.mapLayout('akuo', 'english', 'hebrew')}`);
assert("reverse: 'שלום' maps to 'akuo'", analysis.mapLayout('שלום', 'hebrew', 'english') === 'akuo',
  `got ${analysis.mapLayout('שלום', 'hebrew', 'english')}`);
assert("russian 'ghbdtn' maps to 'привет'", analysis.mapLayout('ghbdtn', 'english', 'russian') === 'привет',
  `got ${analysis.mapLayout('ghbdtn', 'english', 'russian')}`);
assert('isLayoutTwin: akuo vs שלום', analysis.isLayoutTwin('akuo', 'שלום') === true);
assert('isLayoutTwin: hello vs שלום is NOT a twin', analysis.isLayoutTwin('hello', 'שלום') === false);

// ---------------------------------------------------------------------------
console.log('\n[text] live text statistics');
const text = 'אני עובד עם Slack וגם עם Notion כל יום, זה ממש נוח!';
const st = analysis.analyzeFreeText(text);
assert('total words', st.totalWords === 12, `got ${st.totalWords}`);
assert('secondary words = 2 (Slack, Notion)', st.secondaryWords === 2, `got ${st.secondaryWords}`);
assert('switches = 4', st.switches === 4, `got ${st.switches}`);
assert('punctuation = 2 (comma, !)', st.punctuationUses === 2, `got ${st.punctuationUses}`);
const mixed = analysis.analyzeFreeText('שלוm עולם');
assert('mixed-script word detected', mixed.mixedWords === 1, `got ${mixed.mixedWords}`);
const spam = analysis.analyzeFreeText('ok ok ok ok שלום שלום שלום');
assert('repetition share high for spam', spam.repeatedWordShare > 0.5, `got ${spam.repeatedWordShare}`);

// ---------------------------------------------------------------------------
console.log('\n[events] behavioral signatures');
const t0 = 1000000;
const ins = (text, time, delay = 150) => ({ type: 'ins', text, time, delay });
const del = (text, time) => ({ type: 'del', text, time, delay: 100 });

// wrong-language: typed "akuo" (meant שלום), deleted, retyped "שלום"
let ev = [];
let tm = t0;
for (const c of 'akuo') { ev.push(ins(c, tm)); tm += 150; }
for (const c of ['o','u','k','a']) { ev.push(del(c, tm)); tm += 100; } // backspaces from end
for (const c of 'שלום ') { ev.push(ins(c, tm)); tm += 150; }
let b = analysis.analyzeEditEvents(ev);
assert('wrong-language incident detected', b.wrongLanguageIncidents === 1, `got ${b.wrongLanguageIncidents}`);
assert('confirmed by layout mapping', b.layoutConfirmed === 1, `got ${b.layoutConfirmed}`);

// punctuation fumble: typed '!' deleted, typed '?'
ev = [ins('א', t0), ins('!', t0+200), del('!', t0+500), ins('?', t0+800)];
b = analysis.analyzeEditEvents(ev);
assert('punctuation fumble detected', b.punctuationFumbles === 1, `got ${b.punctuationFumbles}`);

// normal correction (same language) is NOT an incident
ev = [];
tm = t0;
for (const c of 'שלוט') { ev.push(ins(c, tm)); tm += 150; }
ev.push(del('ט', tm)); tm += 100;
for (const c of 'ם ') { ev.push(ins(c, tm)); tm += 150; }
b = analysis.analyzeEditEvents(ev);
assert('same-language typo fix is NOT an incident', b.wrongLanguageIncidents === 0, `got ${b.wrongLanguageIncidents}`);

// hesitation: boundary delays 4x baseline
ev = [];
tm = t0;
for (let i = 0; i < 30; i++) { ev.push(ins('א', tm, 150)); tm += 150; }
for (let i = 0; i < 5; i++) {
  ev.push(ins('a', tm, 600)); tm += 600;  // boundary he->en
  ev.push(ins('א', tm, 600)); tm += 600;  // boundary en->he
}
b = analysis.analyzeEditEvents(ev);
assert('switch hesitation ratio ~4x', b.switchRecoveryRatio >= 3 && b.switchRecoveryRatio <= 5, `got ${b.switchRecoveryRatio}`);

// ---------------------------------------------------------------------------
console.log('\n[score] free-typing scoring branch');
const fm = (over = {}) => ({
  totalErrors: 0, languageErrors: 0, punctuationErrors: 0, deletions: 0,
  averageDelay: 200, frustrationScore: 0, languageSwitches: 12, corrections: 0,
  totalMistakesMade: 0, finalErrors: 0, accuracy: 100, wpm: 50,
  freeTest: true, deletionRate: 3, switchRecoveryRatio: 1.2, ...over,
});
let sc = scoring.calculateOverallScore(fm());
assert('clean free writing = 100', sc === 100, `got ${sc}`);
sc = scoring.calculateOverallScore(fm({ languageErrors: 1 }));
assert('1 incident = 92 (gate)', sc === 92, `got ${sc}`);
sc = scoring.calculateOverallScore(fm({ switchRecoveryRatio: 4 }));
assert('heavy hesitation (4x) = 90', sc === 90, `got ${sc}`);
sc = scoring.calculateOverallScore(fm({ deletionRate: 16 }));
assert('heavy deletion rate (16/100) = 90', sc === 90, `got ${sc}`);
sc = scoring.calculateOverallScore(fm({ wpm: 75 }));
assert('clean + fast = 100', sc === 100, `got ${sc}`);
const fastErr = scoring.calculateOverallScore(fm({ wpm: 75, languageErrors: 2 }));
const slowErr = scoring.calculateOverallScore(fm({ wpm: 50, languageErrors: 2 }));
assert('speed does not buy back incidents', fastErr === slowErr, `fast=${fastErr} slow=${slowErr}`);

console.log('\n[reconcile] free breakdown reconciles (fuzz x1000)');
let bad = 0;
for (let i = 0; i < 1000; i++) {
  const mm = fm({
    languageErrors: Math.floor(Math.random() * 10),
    punctuationErrors: Math.floor(Math.random() * 8),
    frustrationScore: Math.floor(Math.random() * 11),
    wpm: Math.floor(Math.random() * 120),
    accuracy: 60 + Math.floor(Math.random() * 41),
    deletionRate: Math.random() * 25,
    switchRecoveryRatio: 1 + Math.random() * 5,
  });
  const score = scoring.calculateOverallScore(mm);
  const bd = scoring.getScoreBreakdown(mm);
  const raw = 100 - bd.totalPenalty + bd.totalBonus;
  const rec = Math.max(scoring.SCORE_FLOOR, Math.min(scoring.SCORE_CEILING, Math.round(raw)));
  if (Math.abs(rec - score) > 1) bad++;
}
assert('0 mismatches in 1000 random free cases', bad === 0, `${bad} mismatches`);

rmSync(outDir, { recursive: true, force: true });
console.log(`\n========= ${pass} passed, ${fail} failed =========`);
process.exit(fail > 0 ? 1 : 0);
