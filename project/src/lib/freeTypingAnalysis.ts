// src/lib/freeTypingAnalysis.ts
// Behavioral analysis engine for the FREE TYPING test.
// There is no reference text, so errors are detected from typing-behavior
// signatures in the edit-event stream:
//   * Wrong-language word: chars typed, burst-deleted, retyped in the other
//     language. Confirmed by KEYBOARD-LAYOUT MAPPING - the deleted chars,
//     mapped through the physical layout (a=ש, k=ל...), match the retype.
//   * Punctuation fumble: punctuation typed -> deleted -> different
//     punctuation typed within a short window (the Shift-miss signature).
//   * Mixed-script word: a single word containing two scripts.
//   * Switch hesitation: inter-key delay at language boundaries vs the
//     user's own baseline (median), so it's fair at any typing speed.

export type Lang = 'hebrew' | 'arabic' | 'english' | 'russian';

export const punctuationRegex = /[.,!?;:\-(){}[\]"'•%/\\–_=+`~@#$^*<>|]/;

export const detectLanguage = (char: string): Lang | null => {
  if (/[א-ת]/.test(char)) return 'hebrew';
  if (/[؀-ۿ]/.test(char)) return 'arabic';
  if (/[а-яА-Я]/.test(char)) return 'russian';
  if (/[a-zA-Z]/.test(char)) return 'english';
  return null;
};

// ---------------------------------------------------------------------------
// Keyboard layout maps (QWERTY key -> character on the same physical key)
// ---------------------------------------------------------------------------

const QWERTY_TO_HEBREW: Record<string, string> = {
  q: '/', w: "'", e: 'ק', r: 'ר', t: 'א', y: 'ט', u: 'ו', i: 'ן', o: 'ם', p: 'פ',
  a: 'ש', s: 'ד', d: 'ג', f: 'כ', g: 'ע', h: 'י', j: 'ח', k: 'ל', l: 'ך', ';': 'ף',
  z: 'ז', x: 'ס', c: 'ב', v: 'ה', b: 'נ', n: 'מ', m: 'צ', ',': 'ת', '.': 'ץ',
};

const QWERTY_TO_RUSSIAN: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  '[': 'х', ']': 'ъ',
  a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э',
  z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю',
};

const QWERTY_TO_ARABIC: Record<string, string> = {
  q: 'ض', w: 'ص', e: 'ث', r: 'ق', t: 'ف', y: 'غ', u: 'ع', i: 'ه', o: 'خ', p: 'ح',
  '[': 'ج', ']': 'د',
  a: 'ش', s: 'س', d: 'ي', f: 'ب', g: 'ل', h: 'ا', j: 'ت', k: 'ن', l: 'م', ';': 'ك', "'": 'ط',
  z: 'ئ', x: 'ء', c: 'ؤ', v: 'ر', b: 'لا', n: 'ى', m: 'ة', ',': 'و', '.': 'ز',
};

const invert = (map: Record<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    // multi-char values (Arabic lam-alef) can't be inverted per-char; skip
    if (v.length === 1) out[v] = k;
  }
  return out;
};

const HEBREW_TO_QWERTY = invert(QWERTY_TO_HEBREW);
const RUSSIAN_TO_QWERTY = invert(QWERTY_TO_RUSSIAN);
const ARABIC_TO_QWERTY = invert(QWERTY_TO_ARABIC);

const toQwertyMaps: Partial<Record<Lang, Record<string, string>>> = {
  hebrew: HEBREW_TO_QWERTY,
  russian: RUSSIAN_TO_QWERTY,
  arabic: ARABIC_TO_QWERTY,
};

const fromQwertyMaps: Partial<Record<Lang, Record<string, string>>> = {
  hebrew: QWERTY_TO_HEBREW,
  russian: QWERTY_TO_RUSSIAN,
  arabic: QWERTY_TO_ARABIC,
};

// Convert text typed in `from` layout to what the same PHYSICAL KEYS would
// have produced in the `to` layout.
export const mapLayout = (text: string, from: Lang, to: Lang): string => {
  let result = '';
  for (const ch of text.toLowerCase()) {
    let qwertyKey = ch;
    if (from !== 'english') {
      const m = toQwertyMaps[from];
      qwertyKey = (m && m[ch]) || ch;
    }
    if (to === 'english') {
      result += qwertyKey;
    } else {
      const m = fromQwertyMaps[to];
      result += (m && m[qwertyKey]) || qwertyKey;
    }
  }
  return result;
};

const dominantLang = (text: string): Lang | null => {
  const counts: Partial<Record<Lang, number>> = {};
  for (const ch of text) {
    const l = detectLanguage(ch);
    if (l) counts[l] = (counts[l] || 0) + 1;
  }
  let best: Lang | null = null;
  let bestCount = 0;
  for (const [l, c] of Object.entries(counts)) {
    if ((c as number) > bestCount) { best = l as Lang; bestCount = c as number; }
  }
  return best;
};

const letterOnly = (text: string): string => [...text].filter(c => detectLanguage(c) !== null).join('');

// Similarity of two same-ish-length strings (position-wise match ratio)
const matchRatio = (a: string, b: string): number => {
  if (!a.length || !b.length) return 0;
  const len = Math.min(a.length, b.length);
  let matches = 0;
  for (let i = 0; i < len; i++) if (a[i] === b[i]) matches++;
  return matches / Math.max(a.length, b.length);
};

// Do `deleted` and `retyped` represent the SAME word on the same physical
// keys, typed in two different layouts?
export const isLayoutTwin = (deleted: string, retyped: string): boolean => {
  const d = letterOnly(deleted.toLowerCase());
  const r = letterOnly(retyped.toLowerCase());
  if (d.length < 2 || r.length < 2) return false;
  const dLang = dominantLang(d);
  const rLang = dominantLang(r);
  if (!dLang || !rLang || dLang === rLang) return false;
  return matchRatio(mapLayout(d, dLang, rLang), r) >= 0.6 ||
         matchRatio(mapLayout(r, rLang, dLang), d) >= 0.6;
};

// ---------------------------------------------------------------------------
// Live text statistics (drives the on-screen requirements checklist)
// ---------------------------------------------------------------------------

export interface FreeTextStats {
  totalWords: number;
  wordsByLang: Partial<Record<Lang, number>>;
  primaryWords: number;     // words in the majority language
  secondaryWords: number;   // words in the minority language
  distinctSecondaryWords: number;
  switches: number;         // adjacent words in different languages
  punctuationUses: number;
  mixedWords: number;       // words containing two scripts
  repeatedWordShare: number; // 0-1, share of duplicated words (anti-gaming)
}

export const analyzeFreeText = (text: string): FreeTextStats => {
  const rawWords = text.split(/\s+/).filter(w => letterOnly(w).length > 0);
  const wordsByLang: Partial<Record<Lang, number>> = {};
  const langSeq: Lang[] = [];
  let mixedWords = 0;
  const secondarySets: Partial<Record<Lang, Set<string>>> = {};
  const seen = new Map<string, number>();

  for (const w of rawWords) {
    const letters = letterOnly(w).toLowerCase();
    const langsInWord = new Set([...letters].map(c => detectLanguage(c)).filter(Boolean));
    if (langsInWord.size > 1) mixedWords++;
    const lang = dominantLang(letters);
    if (lang) {
      wordsByLang[lang] = (wordsByLang[lang] || 0) + 1;
      langSeq.push(lang);
      if (!secondarySets[lang]) secondarySets[lang] = new Set();
      secondarySets[lang]!.add(letters);
    }
    seen.set(letters, (seen.get(letters) || 0) + 1);
  }

  let switches = 0;
  for (let i = 1; i < langSeq.length; i++) {
    if (langSeq[i] !== langSeq[i - 1]) switches++;
  }

  const langEntries = Object.entries(wordsByLang) as [Lang, number][];
  langEntries.sort((a, b) => b[1] - a[1]);
  const primaryWords = langEntries[0]?.[1] || 0;
  const secondaryLang = langEntries[1]?.[0];
  const secondaryWords = langEntries[1]?.[1] || 0;
  const distinctSecondaryWords = secondaryLang ? (secondarySets[secondaryLang]?.size || 0) : 0;

  const punctuationUses = [...text].filter(c => punctuationRegex.test(c)).length;

  let repeated = 0;
  for (const count of seen.values()) if (count > 1) repeated += count - 1;
  const repeatedWordShare = rawWords.length > 0 ? repeated / rawWords.length : 0;

  return {
    totalWords: rawWords.length,
    wordsByLang,
    primaryWords,
    secondaryWords,
    distinctSecondaryWords,
    switches,
    punctuationUses,
    mixedWords,
    repeatedWordShare,
  };
};

// ---------------------------------------------------------------------------
// Edit-event stream analysis (runs on completion)
// ---------------------------------------------------------------------------

export interface EditEvent {
  type: 'ins' | 'del';
  text: string;    // inserted text, or the exact text that was removed
  time: number;    // Date.now()
  delay: number;   // ms since previous event
}

export interface FreeBehaviorStats {
  wrongLanguageIncidents: number;  // deleted in lang A, retyped in lang B
  layoutConfirmed: number;         // subset confirmed by keyboard-layout mapping
  punctuationFumbles: number;      // punct -> delete -> different punct
  deletionBursts: number;          // 3+ chars deleted consecutively
  totalDeletedChars: number;
  grossTypedChars: number;
  deletionRate: number;            // deleted chars per 100 typed chars
  switchRecoveryRatio: number;     // boundary delay / baseline delay (1 = none)
}

const median = (arr: number[]): number => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export const analyzeEditEvents = (events: EditEvent[]): FreeBehaviorStats => {
  let wrongLanguageIncidents = 0;
  let layoutConfirmed = 0;
  let punctuationFumbles = 0;
  let deletionBursts = 0;
  let totalDeletedChars = 0;
  let grossTypedChars = 0;

  // --- wrong-language + fumble detection over the event stream ---
  let i = 0;
  while (i < events.length) {
    const ev = events[i];

    if (ev.type === 'del') {
      // accumulate a deletion burst (backspaces remove from the end,
      // so earlier events hold later chars - prepend to reconstruct)
      let deleted = '';
      let j = i;
      while (j < events.length && events[j].type === 'del') {
        deleted = events[j].text + deleted;
        totalDeletedChars += events[j].text.length;
        j++;
      }
      if (deleted.length >= 3) deletionBursts++;

      // what got typed right after the deletion?
      let retyped = '';
      let k = j;
      while (k < events.length && events[k].type === 'ins' && retyped.length < deleted.length + 4) {
        retyped += events[k].text;
        if (/\s/.test(events[k].text) && letterOnly(retyped).length >= 2) break;
        k++;
      }

      const dLetters = letterOnly(deleted);
      const rLetters = letterOnly(retyped);
      if (dLetters.length >= 2 && rLetters.length >= 2) {
        const dLang = dominantLang(dLetters);
        const rLang = dominantLang(rLetters);
        if (dLang && rLang && dLang !== rLang) {
          if (isLayoutTwin(deleted, retyped)) {
            wrongLanguageIncidents++;
            layoutConfirmed++;
          } else if (Math.abs(dLetters.length - rLetters.length) <= 2) {
            // full-script replacement of similar length - very likely a
            // wrong-language word even without an exact layout match
            wrongLanguageIncidents++;
          }
        }
      }

      // punctuation fumble: single punct deleted, different punct typed
      if (deleted.length === 1 && punctuationRegex.test(deleted)) {
        const next = events[j];
        if (next && next.type === 'ins' && next.text.length === 1 &&
            punctuationRegex.test(next.text) && next.text !== deleted &&
            next.time - ev.time <= 2500) {
          punctuationFumbles++;
        }
      }

      i = j;
      continue;
    }

    grossTypedChars += ev.text.length;
    i++;
  }

  // --- switch hesitation: delay at language boundaries vs baseline ---
  const baselineDelays: number[] = [];
  const boundaryDelays: number[] = [];
  let prevLang: Lang | null = null;
  for (const ev of events) {
    if (ev.type !== 'ins' || ev.text.length !== 1) { continue; }
    const lang = detectLanguage(ev.text);
    if (!lang) continue;
    if (ev.delay > 0 && ev.delay < 10000) {
      if (prevLang && lang !== prevLang) boundaryDelays.push(ev.delay);
      else if (ev.delay < 3000) baselineDelays.push(ev.delay);
    }
    prevLang = lang;
  }
  const base = median(baselineDelays);
  const boundary = median(boundaryDelays);
  const switchRecoveryRatio = base > 0 && boundaryDelays.length >= 3
    ? Math.max(1, boundary / base)
    : 1;

  const deletionRate = grossTypedChars > 0 ? (totalDeletedChars / grossTypedChars) * 100 : 0;

  return {
    wrongLanguageIncidents,
    layoutConfirmed,
    punctuationFumbles,
    deletionBursts,
    totalDeletedChars,
    grossTypedChars,
    deletionRate,
    switchRecoveryRatio,
  };
};

// Simple mashing guard for free text (no reference to compare against)
export const looksLikeMashing = (text: string): boolean => {
  const last20 = text.slice(-20).toLowerCase();
  const patterns = [
    /(.)\1{4,}/,
    /[asdfghjkl]{8,}/,
    /[qwertyuiop]{8,}/,
    /[zxcvbnm]{8,}/,
    /[שדגכעיחלך]{8,}/,
    /[асдфжкл]{8,}/,
  ];
  return patterns.some(p => p.test(last20));
};
