// src/lib/scoring.ts
// SINGLE SOURCE OF TRUTH for the overall score.
// Used by the UI (ResultsReport, ShareCard via App re-export) AND by
// supabase.ts when saving — so the score in the database always matches
// the score the user saw on screen.
//
// SCORING v2 — "strict at the top" curve:
//   * First mistakes are expensive, later ones cheap (graduated penalties).
//     One language error already drops you from 100; ten errors won't crash
//     you to the floor.
//   * Quality gates hard-cap the score by error count, so 90+ is reserved
//     for near-perfect typing regardless of speed.
//   * Speed bonus applies ONLY to clean typing (zero language errors) —
//     speed can no longer buy back accuracy.
// Bump SCORING_VERSION whenever the formula changes, so DB rows stay comparable.

import { TypingMetrics } from '../types';

export const SCORING_VERSION = 2;

// Coerce any metric to a safe non-negative finite number
const safeNum = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return isFinite(n) && n > 0 ? n : 0;
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

export const SCORE_FLOOR = 45;
export const SCORE_CEILING = 100;

// Graduated language-error penalty: first 2 errors cost 6 points each,
// each additional error costs 2.5, capped at 32.
const getLanguagePenalty = (errors: number): number => {
  if (errors <= 0) return 0;
  const expensive = Math.min(2, errors) * 6;
  const cheap = Math.max(0, errors - 2) * 2.5;
  return Math.min(32, expensive + cheap);
};

// Speed adjustment. Penalties always apply; the bonus applies only to
// clean typing (zero language errors).
const getSpeedAdjustment = (wpm: number, languageErrors: number): number => {
  if (wpm >= 70) return languageErrors === 0 ? 3 : 0;
  if (wpm >= 60) return languageErrors === 0 ? 1 : 0;
  if (wpm >= 45) return 0;
  if (wpm >= 30) return -3;
  if (wpm >= 20) return -5;
  return -8;
};

// Quality gates: hard caps on the final score based on error quality.
// Returns the lowest applicable cap (or the ceiling when clean).
const getQualityCap = (languageErrors: number, accuracy: number): { cap: number; reason: string } => {
  const caps: { cap: number; reason: string }[] = [];
  if (languageErrors >= 6) caps.push({ cap: 72, reason: `${languageErrors} language errors cap the score at 72` });
  else if (languageErrors >= 3) caps.push({ cap: 84, reason: `${languageErrors} language errors cap the score at 84` });
  else if (languageErrors >= 1) caps.push({ cap: 92, reason: `A language error caps the score at 92` });
  if (accuracy > 0 && accuracy < 90) caps.push({ cap: 75, reason: `${accuracy}% accuracy caps the score at 75` });
  if (caps.length === 0) return { cap: SCORE_CEILING, reason: '' };
  return caps.reduce((a, b) => (a.cap <= b.cap ? a : b));
};

interface ScoreParts {
  penalties: { category: string; penalty: number; reason: string }[];
  speedAdjustment: number;
  wpm: number;
  cap: { cap: number; reason: string };
}

// Shared computation so the score and the breakdown can never disagree.
const computeScoreParts = (metrics: TypingMetrics, completionRate: number): ScoreParts => {
  const languageErrors = safeNum(metrics?.languageErrors);
  const punctuationErrors = safeNum(metrics?.punctuationErrors);
  const deletions = safeNum(metrics?.deletions);
  const wpm = safeNum(metrics?.wpm);
  const frustration = safeNum(metrics?.frustrationScore);
  const accuracy = safeNum(metrics?.accuracy);
  const completion = Math.max(0, Math.min(100, safeNum(completionRate) || 100));

  const penalties: ScoreParts['penalties'] = [];

  if (languageErrors > 0) {
    penalties.push({
      category: 'Language Errors',
      penalty: round1(getLanguagePenalty(languageErrors)),
      reason: `${languageErrors} wrong language characters`
    });
  }

  if (punctuationErrors > 0) {
    penalties.push({
      category: 'Punctuation Errors',
      penalty: round1(Math.min(12, punctuationErrors * 1.5)),
      reason: `${punctuationErrors} punctuation mistakes`
    });
  }

  if (deletions > 10) {
    penalties.push({
      category: 'Excessive Deletions',
      penalty: round1(Math.min(10, (deletions - 10) * 0.5)),
      reason: `${deletions} deletions made`
    });
  }

  if (completion < 100) {
    penalties.push({
      category: 'Incomplete Text',
      penalty: round1(Math.min(15, (100 - completion) * 0.2)),
      reason: `Only ${completion.toFixed(0)}% completed`
    });
  }

  const speedAdjustment = getSpeedAdjustment(wpm, languageErrors);

  if (frustration > 0) {
    penalties.push({
      category: 'Flow Disruption',
      penalty: round1(Math.min(7, frustration * 0.7)),
      reason: `${frustration}/10 flow score`
    });
  }

  const cap = getQualityCap(languageErrors, accuracy);
  return { penalties, speedAdjustment, wpm, cap };
};

// FREE TYPING test: no reference text, so the components differ -
// deletion RATE replaces absolute deletions, switch HESITATION replaces
// completion. Language errors here are behaviorally-detected incidents
// (wrong-language word deleted & retyped), priced identically to v2.
const computeFreeScoreParts = (metrics: TypingMetrics): ScoreParts => {
  const languageErrors = safeNum(metrics?.languageErrors);
  const punctuationErrors = safeNum(metrics?.punctuationErrors);
  const wpm = safeNum(metrics?.wpm);
  const frustration = safeNum(metrics?.frustrationScore);
  const accuracy = safeNum(metrics?.accuracy);
  const deletionRate = safeNum((metrics as any)?.deletionRate);
  const recoveryRatio = Math.max(1, safeNum((metrics as any)?.switchRecoveryRatio) || 1);

  const penalties: ScoreParts['penalties'] = [];

  if (languageErrors > 0) {
    penalties.push({
      category: 'Language Errors',
      penalty: round1(getLanguagePenalty(languageErrors)),
      reason: `${languageErrors} wrong-language words (deleted & retyped)`
    });
  }

  if (punctuationErrors > 0) {
    penalties.push({
      category: 'Punctuation Fumbles',
      penalty: round1(Math.min(12, punctuationErrors * 1.5)),
      reason: `${punctuationErrors} punctuation corrections`
    });
  }

  if (deletionRate > 8) {
    penalties.push({
      category: 'Excessive Deletions',
      penalty: round1(Math.min(10, (deletionRate - 8) * 1.25)),
      reason: `${deletionRate.toFixed(0)} deleted chars per 100 typed`
    });
  }

  if (recoveryRatio > 1.5) {
    penalties.push({
      category: 'Switch Hesitation',
      penalty: round1(Math.min(10, (recoveryRatio - 1.5) * 4)),
      reason: `${recoveryRatio.toFixed(1)}x slower at language switches`
    });
  }

  const speedAdjustment = getSpeedAdjustment(wpm, languageErrors);

  if (frustration > 0) {
    penalties.push({
      category: 'Flow Disruption',
      penalty: round1(Math.min(7, frustration * 0.7)),
      reason: `${frustration}/10 flow score`
    });
  }

  const cap = getQualityCap(languageErrors, accuracy);
  return { penalties, speedAdjustment, wpm, cap };
};

const isFreeTest = (metrics: TypingMetrics): boolean => !!(metrics as any)?.freeTest;

// SCORING ALGORITHM v2 - Range 45-100
export const calculateOverallScore = (metrics: TypingMetrics, completionRate: number = 100): number => {
  const { penalties, speedAdjustment, cap } = isFreeTest(metrics)
    ? computeFreeScoreParts(metrics)
    : computeScoreParts(metrics, completionRate);
  const totalPenalty = penalties.reduce((sum, p) => sum + p.penalty, 0);
  let score = 100 - totalPenalty + speedAdjustment;
  score = Math.min(score, cap.cap); // quality gate
  return Math.max(SCORE_FLOOR, Math.min(SCORE_CEILING, Math.round(score)));
};

// Calculate wasted time in seconds
export const calculateWastedTime = (metrics: TypingMetrics): number => {
  const deletionTime = safeNum(metrics?.deletions) * 0.3;
  const correctionTime = safeNum(metrics?.corrections) * 2;
  const languageErrorTime = safeNum(metrics?.languageErrors) * 3;

  return Math.round(deletionTime + correctionTime + languageErrorTime);
};

export interface ScoreBreakdownItem {
  category: string;
  penalty: number; // > 0 = deduction, < 0 = bonus
  reason: string;
}

// Score breakdown — derived from the exact same parts as the score,
// including a visible "quality gate" line when the cap trims the score,
// so "100 - deductions + bonus" always reconciles with the final score.
export const getScoreBreakdown = (metrics: TypingMetrics, completionRate: number = 100) => {
  const { penalties, speedAdjustment, wpm, cap } = isFreeTest(metrics)
    ? computeFreeScoreParts(metrics)
    : computeScoreParts(metrics, completionRate);

  const breakdown: ScoreBreakdownItem[] = [...penalties];

  if (speedAdjustment < 0) {
    breakdown.push({
      category: 'Typing Speed',
      penalty: -speedAdjustment,
      reason: `${wpm} WPM (below average)`
    });
  } else if (speedAdjustment > 0) {
    breakdown.push({
      category: 'Clean Speed Bonus',
      penalty: -speedAdjustment, // negative penalty = bonus
      reason: `${wpm} WPM with zero language errors`
    });
  }

  // Quality gate: show the trimmed points as an explicit line
  const rawScore = 100 - penalties.reduce((s, p) => s + p.penalty, 0) + speedAdjustment;
  const gateTrim = round1(Math.max(0, rawScore - cap.cap));
  if (gateTrim > 0) {
    breakdown.push({
      category: 'Quality Gate',
      penalty: gateTrim,
      reason: cap.reason
    });
  }

  const totalPenalty = round1(breakdown.filter(i => i.penalty > 0).reduce((sum, i) => sum + i.penalty, 0));
  const totalBonus = round1(breakdown.filter(i => i.penalty < 0).reduce((sum, i) => sum - i.penalty, 0));
  return { breakdown, totalPenalty, totalBonus };
};
