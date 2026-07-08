// src/components/TypingExercise.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ErrorDetail, KeystrokeEvent, TypingMetrics } from '../types';

interface Props {
  chosenExercise: string;
  onComplete: (data: any) => void;
  onBack: () => void;
  selectedLanguage: string;
  t: any; // Translation object
}

const exercises: Record<string, { title: string; text: string }[]> = {
  'Arabic-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `لفريق المشتريات،
بناءً على الـ RFQ الذي نشرناه، تلقينا عروضاً من 12 مورداً، معظمهم من APAC وأوروبا.
حالياً Top 3 موردين:
1. Ycon DevOps & ALM: استشارات مهنية
2. Kabri: مورد فرعي
3. CocoLemon: موزع
أطلب فحص شروط الدفع بشكل عاجل (NET 30/60/90) وأوقات التسليم.
آخر موعد للتنفيذ 15/07/2025.
مدير المشتريات - Purchasing Manager`
    }
  ],
  'Hebrew-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `לצוות הרכש,
בהמשך ל-RFQ שפרסמנו, קיבלנו הצעות מ-12 ספקים, רובם מ-APAC ואירופה.
כרגע Top 3 ספקים:
1. Ycon DevOps & ALM: יעוץ מקצועי
2. Kabri: ספק משנה
3. CocoLemon: מפיץ
מבקש לבדוק בדחיפות תנאי תשלום (NET 30/60/90) וזמני אספקה.
תאריך אחרון לביצוע 15/07/2025.
מנהל רכש - Purchasing Manager`
    },
    {
      title: "Exercise 2 - Student Article",
      text: `מחקרי הדמיה הראו כי אזורים במוח מופעלים באופן שונה בקרב בעלי ADHD, לרוב באקטיבציה נמוכה יותר.
נמצא כי אזורים שונים הינם בעלי נפח קטן יותר בהשוואה לקבוצות ביקורת (Bush, 2011).
המבנים המעורבים ב-ADHD מצויים באזורים כמו ה-Dorsolateral Prefrontal Cortex (DLPFC) וה-dorsal Anterior Cingulate Cortex (dACC).
אזורים אלה מיוחסים גם לתפקודים ניהוליים (Executive Functions) כמו תכנון וגילוי טעויות.
הראיות המצטברות מספקות תמיכה נרחבת לכך ש-ADHD הנה הפרעה נוירולוגית המערבת תפקודים מוחיים מורכבים.`
    }
  ],
  'Russian-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `Команде закупок,
В продолжение опубликованного RFQ мы получили предложения от 12 поставщиков, в основном из APAC и Европы.
Сейчас Top 3 поставщика:
1. Ycon DevOps & ALM: профессиональный консалтинг
2. Kabri: субподрядчик
3. CocoLemon: дистрибьютор
Прошу срочно проверить условия оплаты (NET 30/60/90) и сроки поставки.
Крайний срок выполнения 15/07/2025.
Заместитель начальника отдела снабжения - CSCO`
    }
  ]
};

const punctuationRegex = /[.,!?;:\-(){}[\]"'•%/\\–_=+`~@#$^*<>|]/;

// Two characters count as equal if identical, or if both are whitespace
// (space vs newline vs tab) — layout differences are not typing errors.
const charsEqual = (a: string, b: string): boolean => {
  if (a === b) return true;
  return /\s/.test(a) && /\s/.test(b);
};

const detectLanguage = (char: string): 'hebrew' | 'arabic' | 'english' | 'russian' | null => {
  if (/[א-ת]/.test(char)) return 'hebrew';
  if (/[؀-ۿ]/.test(char)) return 'arabic';
  if (/[а-яА-Я]/.test(char)) return 'russian';
  if (/[a-zA-Z]/.test(char)) return 'english';
  return null;
};

// How many language switches the exercise text itself requires.
// Used so the frustration score only penalizes switches BEYOND what the task demands.
const countLanguageSwitches = (text: string): number => {
  let prev: string | null = null;
  let count = 0;
  for (const ch of text) {
    const lang = detectLanguage(ch);
    if (lang && prev && lang !== prev) count++;
    if (lang) prev = lang;
  }
  return count;
};

interface AlignmentOp {
  type: 'match' | 'sub' | 'ins' | 'del';
  i: number; // index in expected text
  j: number; // index in actual text
}

interface AlignmentResult {
  errors: ErrorDetail[];
  matches: number;
  completionRate: number; // 0-100, based on how much of the expected text was covered
}

// Levenshtein alignment between expected and actual text.
// A single missing/extra character no longer cascades into marking
// every subsequent character as wrong (the old positional compare did).
const alignTexts = (expected: string, actual: string): AlignmentResult => {
  const n = expected.length;
  // Guard against pathological input sizes (e.g. injected text)
  const cappedActual = actual.length > n * 2 ? actual.slice(0, n * 2) : actual;
  const m = cappedActual.length;

  const dp: Int32Array[] = [];
  for (let i = 0; i <= n; i++) {
    dp.push(new Int32Array(m + 1));
    dp[i][0] = i;
  }
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = charsEqual(expected[i - 1], cappedActual[j - 1]) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion (expected char missed)
        dp[i][j - 1] + 1,      // insertion (extra typed char)
        dp[i - 1][j - 1] + cost // match / substitution
      );
    }
  }

  // Backtrace. At the right edge (j === m, i.e. past the end of what the
  // user typed) prefer deletions, so unfinished text becomes a run of
  // trailing deletions (incompleteness) instead of scattered substitutions.
  // Elsewhere prefer the diagonal (match/substitution).
  const ops: AlignmentOp[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j === m && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: 'del', i: i - 1, j });
      i--;
    } else if (
      i > 0 && j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] + (charsEqual(expected[i - 1], cappedActual[j - 1]) ? 0 : 1)
    ) {
      ops.push({ type: charsEqual(expected[i - 1], cappedActual[j - 1]) ? 'match' : 'sub', i: i - 1, j: j - 1 });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      ops.push({ type: 'ins', i, j: j - 1 });
      j--;
    } else {
      ops.push({ type: 'del', i: i - 1, j });
      i--;
    }
  }
  ops.reverse();

  // Trailing deletions = the user simply didn't finish the text.
  // That is incompleteness (handled by completionRate), not typing errors.
  let end = ops.length;
  while (end > 0 && ops[end - 1].type === 'del') end--;
  const effectiveOps = ops.slice(0, end);

  const errors: ErrorDetail[] = [];
  let matches = 0;
  let expectedConsumed = 0;

  for (const op of effectiveOps) {
    if (op.type !== 'ins') expectedConsumed++;
    if (op.type === 'match') {
      matches++;
      continue;
    }
    const expectedChar = op.type === 'ins' ? '' : expected[op.i];
    const actualChar = op.type === 'del' ? '' : cappedActual[op.j];
    let errorType: 'language' | 'punctuation' | 'typo' = 'typo';
    const expectedLang = expectedChar ? detectLanguage(expectedChar) : null;
    const actualLang = actualChar ? detectLanguage(actualChar) : null;
    if (expectedLang && actualLang && expectedLang !== actualLang) {
      errorType = 'language';
    } else if (
      (expectedChar && punctuationRegex.test(expectedChar)) ||
      (actualChar && punctuationRegex.test(actualChar))
    ) {
      errorType = 'punctuation';
    }
    errors.push({ position: op.i, expected: expectedChar, actual: actualChar, type: errorType, timestamp: Date.now() });
  }

  const completionRate = n > 0 ? Math.min(100, (expectedConsumed / n) * 100) : 100;
  return { errors, matches, completionRate };
};

const TypingExercise: React.FC<Props> = ({ chosenExercise, onComplete, onBack, selectedLanguage, t }) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [deletions, setDeletions] = useState(0);
  const [languageSwitches, setLanguageSwitches] = useState(0);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0);
  const [lastLanguage, setLastLanguage] = useState<'hebrew' | 'arabic' | 'english' | 'russian' | null>(null);
  const [allMistakes, setAllMistakes] = useState<Set<number>>(new Set());
  const [correctedMistakes, setCorrectedMistakes] = useState<Set<number>>(new Set());

  const [realTimeLanguageErrors, setRealTimeLanguageErrors] = useState(0);
  const [realTimePunctuationErrors, setRealTimePunctuationErrors] = useState(0);

  const [warningShown, setWarningShown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer starts on the FIRST keystroke, not on screen mount,
  // so reading the instructions doesn't deflate the WPM.
  const firstKeystrokeTime = useRef<number | null>(null);
  const cheatingAttempts = useRef(0);
  // Anti-cheat: count how many times the user left the tab mid-exercise
  const tabSwitches = useRef(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const exerciseSet = exercises[selectedLanguage] || exercises['Hebrew-English'];
  const exerciseIndex = chosenExercise === 'student_article' ? 1 : 0;
  const exercise = exerciseSet[exerciseIndex] || exerciseSet[0];

  const isRTL = selectedLanguage === 'Hebrew-English' || selectedLanguage === 'Arabic-English';

  const normalizeText = (text: string) => {
    return text.trim();
  };

  const normalizedExerciseText = normalizeText(exercise.text);
  const expectedLanguageSwitches = countLanguageSwitches(normalizedExerciseText);

  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetExerciseState = () => {
    setUserInput('');
    setStartTime(Date.now());
    setLastKeystrokeTime(Date.now());
    setDeletions(0);
    setLanguageSwitches(0);
    setKeystrokes([]);
    setAllMistakes(new Set());
    setCorrectedMistakes(new Set());
    setLastLanguage(null);
    setRealTimeLanguageErrors(0);
    setRealTimePunctuationErrors(0);
    setWarningShown(false);
    firstKeystrokeTime.current = null;
    tabSwitches.current = 0;
    textareaRef.current?.focus();
  };

  const handleCheatingDetected = (message: string) => {
    if (!warningShown) {
      setWarningShown(true);
      cheatingAttempts.current += 1;
      alert(message);
      resetExerciseState();
    }
  };

  const detectSuspiciousPattern = (currentInput: string): boolean => {
    const last5Chars = currentInput.slice(-5);
    if (last5Chars.length === 5 && new Set(last5Chars).size === 1) {
      handleCheatingDetected('⚠️ Please type the actual text, not the same character repeatedly!');
      return true;
    }

    const last20Chars = currentInput.slice(-20).toLowerCase();
    const mashingPatterns = [
      /[שדגכעיחלך]{8,}/,
      /[שגדךלכחףךלדשגחכ]{8,}/,
      /[асдфжклэ]{8,}/,
      /[asdfghjkl]{8,}/,
      /[qwertyuiop]{8,}/,
      /[zxcvbnm]{8,}/,
      /[;lkjdfsa]{8,}/,
      /([שדגכ])\1{3,}/,
      /([асдф])\1{3,}/,
    ];

    for (const pattern of mashingPatterns) {
      if (pattern.test(last20Chars)) {
        handleCheatingDetected('⚠️ Invalid typing detected! Please type the actual text. The exercise will restart.');
        return true;
      }
    }

    if (last20Chars.length >= 6) {
      const last6 = last20Chars.slice(-6);
      if (last6[0] === last6[2] && last6[2] === last6[4] &&
          last6[1] === last6[3] && last6[3] === last6[5] &&
          last6[0] !== last6[1]) {
        handleCheatingDetected('⚠️ Please type the actual text, not random patterns!');
        return true;
      }
    }

    const last30 = currentInput.slice(-30);
    const hasVowels = /[aeiouאהוי]/i.test(last30);
    const hasConsonants = /[bcdfghjklmnpqrstvwxyzבגדזחטכלמנספצקרשת]/i.test(last30);

    if (last30.length >= 20 && (!hasVowels || !hasConsonants)) {
      handleCheatingDetected('⚠️ Please type real words from the text!');
      return true;
    }

    return false;
  };

  const checkLanguageConsistency = (newValue: string) => {
    const chars = newValue.slice(-5).split('');
    let wrongLangChars = 0;
    const expectedLangs = selectedLanguage.split('-').map(l => l.toLowerCase());
    for (const char of chars) {
      const charLang = detectLanguage(char);
      if (charLang) {
        if (!expectedLangs.includes(charLang)) wrongLangChars++;
      }
    }
    if (wrongLangChars >= 5) {
      handleCheatingDetected('⚠️ Wrong language detected! Please type in the correct languages. The exercise will restart.');
    }
  };

  useEffect(() => {
    resetExerciseState();
    return cleanup;
  }, [chosenExercise, selectedLanguage]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && firstKeystrokeTime.current !== null) {
        tabSwitches.current += 1;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleCheatingDetected('⚠️ Copy/Paste is not allowed! Please type the text manually.');
    };
    document.addEventListener('paste', preventPaste);
    return () => {
      document.removeEventListener('paste', preventPaste);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (warningShown) return;
    const newValue = e.target.value;
    const oldValue = userInput;
    const currentTime = Date.now();
    const delay = currentTime - lastKeystrokeTime;

    // Locate the edited region via common prefix/suffix.
    // This makes detection correct for typing anywhere in the text
    // (including mid-text corrections and selection replacements),
    // and fixes the old bug where the trimmed length misaligned positions
    // so every space/Enter was counted as a false error.
    const minLen = Math.min(oldValue.length, newValue.length);
    let prefix = 0;
    while (prefix < minLen && oldValue[prefix] === newValue[prefix]) prefix++;
    let suffix = 0;
    while (
      suffix < minLen - prefix &&
      oldValue[oldValue.length - 1 - suffix] === newValue[newValue.length - 1 - suffix]
    ) suffix++;

    const deletedCount = oldValue.length - prefix - suffix;
    const insertedCount = newValue.length - prefix - suffix;
    const insertedText = newValue.slice(prefix, prefix + insertedCount);

    if (insertedCount > 0 && firstKeystrokeTime.current === null) {
      firstKeystrokeTime.current = currentTime;
      (window as any).exerciseStartTime = currentTime;
    }

    if (deletedCount > 0) {
      setDeletions(prev => prev + deletedCount);
    }

    if (insertedCount > 0) {
      if (detectSuspiciousPattern(newValue)) return;

      // Anti-cheat: a single input event inserting a large block of text
      // (drag-and-drop, IME abuse, scripted injection) is not human typing.
      if (insertedCount > 25) {
        handleCheatingDetected('⚠️ Bulk text insertion detected! Please type the text manually. The exercise will restart.');
        return;
      }

      const updatedMistakes = new Set(allMistakes);
      let newLanguageErrors = 0;
      let newPunctuationErrors = 0;
      let newSwitches = 0;
      let runningLang = lastLanguage;

      for (let k = 0; k < insertedCount; k++) {
        const index = prefix + k;
        const typedChar = insertedText[k];
        const typedLang = detectLanguage(typedChar);
        if (typedLang && runningLang && typedLang !== runningLang) newSwitches++;
        if (typedLang) runningLang = typedLang;

        const expectedChar = normalizedExerciseText[index];
        if (expectedChar !== undefined && !charsEqual(typedChar, expectedChar)) {
          updatedMistakes.add(index);
          const expectedLang = detectLanguage(expectedChar);
          if (expectedLang && typedLang && expectedLang !== typedLang) {
            newLanguageErrors++;
          } else if (punctuationRegex.test(expectedChar) || punctuationRegex.test(typedChar)) {
            newPunctuationErrors++;
          }
        }
      }

      if (newSwitches > 0) setLanguageSwitches(prev => prev + newSwitches);
      setLastLanguage(runningLang);
      if (newLanguageErrors > 0) setRealTimeLanguageErrors(prev => prev + newLanguageErrors);
      if (newPunctuationErrors > 0) setRealTimePunctuationErrors(prev => prev + newPunctuationErrors);
      setAllMistakes(updatedMistakes);
      checkLanguageConsistency(newValue);
    }

    // Corrections: a position that was previously mistaken and now holds
    // the correct character counts as a correction (once per position).
    if (allMistakes.size > 0) {
      const newlyCorrected: number[] = [];
      allMistakes.forEach(pos => {
        if (!correctedMistakes.has(pos) && pos < newValue.length) {
          const expectedChar = normalizedExerciseText[pos];
          if (expectedChar !== undefined && charsEqual(newValue[pos], expectedChar)) {
            newlyCorrected.push(pos);
          }
        }
      });
      if (newlyCorrected.length > 0) {
        setCorrectedMistakes(prev => {
          const next = new Set(prev);
          newlyCorrected.forEach(p => next.add(p));
          return next;
        });
      }
    }

    setKeystrokes(prev => [...prev, {
      key: insertedCount > 0 ? insertedText.slice(-1) : 'backspace',
      timestamp: currentTime,
      position: prefix + insertedCount,
      isBackspace: deletedCount > 0 && insertedCount === 0,
      delay
    }]);
    setLastKeystrokeTime(currentTime);
    setUserInput(newValue);
  };

  const calculateMetrics = (): { metrics: TypingMetrics; completionRate: number; finalErrorsList: ErrorDetail[] } => {
    const normalizedInput = normalizeText(userInput);
    const alignment = alignTexts(normalizedExerciseText, normalizedInput);
    const finalErrorsList = alignment.errors;

    const effectiveStart = firstKeystrokeTime.current ?? startTime;
    const timeInMinutes = Math.max(0.1, (Date.now() - effectiveStart) / 60000);

    // Standard WPM: characters typed / 5 per minute (language-neutral,
    // unlike word counting which under-measures Hebrew's short words).
    const rawWpm = (normalizedInput.length / 5) / timeInMinutes;
    const wpm = Math.max(0, Math.min(150, Math.round(isFinite(rawWpm) ? rawWpm : 0)));

    // Accuracy over the attempted region: matches / (matches + errors)
    const attempted = alignment.matches + finalErrorsList.length;
    let accuracy = attempted > 0 ? Math.round((alignment.matches / attempted) * 100) : 100;
    accuracy = Math.max(0, Math.min(100, accuracy));

    const validDelays = keystrokes.map(k => k.delay).filter(d => d < 5000 && d > 0);
    const averageDelay = validDelays.length > 0 ? Math.round(validDelays.reduce((a, b) => a + b, 0) / validDelays.length) : 0;

    // Language switches beyond what the exercise text itself requires —
    // the required switches are the task, not a sign of frustration.
    const excessSwitches = Math.max(0, languageSwitches - expectedLanguageSwitches);

    const frustrationFactors = [
      Math.min(2, finalErrorsList.length * 0.15),
      Math.min(2, allMistakes.size * 0.1),
      Math.min(1.5, deletions * 0.1),
      Math.min(1, correctedMistakes.size * 0.03),
      Math.min(1.5, excessSwitches * 0.15),
      Math.min(1, realTimePunctuationErrors * 0.15),
      averageDelay > 3000 ? 1.5 : (averageDelay > 2000 ? 0.75 : 0),
    ];
    const frustrationScore = Math.round(Math.min(10, frustrationFactors.reduce((a, b) => a + b, 0)));

    const metrics: TypingMetrics = {
      totalErrors: finalErrorsList.length,
      languageErrors: realTimeLanguageErrors,
      punctuationErrors: realTimePunctuationErrors,
      deletions,
      corrections: correctedMistakes.size,
      languageSwitches,
      averageDelay,
      frustrationScore,
      totalMistakesMade: allMistakes.size,
      finalErrors: finalErrorsList.length,
      accuracy,
      wpm,
    };

    return { metrics, completionRate: alignment.completionRate, finalErrorsList };
  };

  const handleComplete = () => {
    const { metrics, completionRate, finalErrorsList } = calculateMetrics();
    if (completionRate < 60) {
      alert('Please type at least 60% of the text to continue.');
      return;
    }

    const effectiveStart = firstKeystrokeTime.current ?? startTime;
    const endTime = Date.now();
    (window as any).exerciseEndTime = endTime;
    const testDurationSeconds = Math.max(1, Math.round((endTime - effectiveStart) / 1000));

    // Sanity checks for automation:
    // (a) physically impossible completion speed (~240 WPM ceiling)
    const minPlausibleSeconds = normalizedExerciseText.length / 20;
    // (b) robotic cadence - humans have natural variance between keystrokes;
    //     scripts type at a near-uniform rate (very low standard deviation)
    const delays = keystrokes.map(k => k.delay).filter(d => d > 0 && d < 2000);
    let roboticCadence = false;
    if (delays.length >= 50) {
      const mean = delays.reduce((a, b) => a + b, 0) / delays.length;
      const variance = delays.reduce((a, b) => a + (b - mean) ** 2, 0) / delays.length;
      roboticCadence = Math.sqrt(variance) < 15;
    }
    const cheatingDetected =
      cheatingAttempts.current > 0 ||
      testDurationSeconds < minPlausibleSeconds ||
      roboticCadence;

    cleanup();
    const enrichedMetrics = {
      ...metrics,
      completionRate: Math.round(completionRate),
      testDurationSeconds,
      tabSwitches: tabSwitches.current
    };
    onComplete({
      exercises: [{
        text: exercise.text,
        userInput,
        timeSpent: endTime - effectiveStart,
        errors: finalErrorsList,
        deletions,
        corrections: metrics.corrections,
        languageSwitches,
        metrics: enrichedMetrics,
        cheatingDetected
      }],
      metrics: enrichedMetrics
    });
  };

  const renderTextComparison = () => {
    const expectedChars = normalizedExerciseText.split('');
    return expectedChars.map((char, index) => {
      let className = 'text-gray-400';
      if (index < userInput.length) {
        if (charsEqual(userInput[index], char)) {
          className = 'text-green-600 font-bold';
        } else {
          className = 'text-red-600 bg-red-100';
        }
      }
      if (char === '\n') return <br key={index} />;
      return <span key={index} className={className}>{char}</span>;
    });
  };

  const progress = Math.min(100, (normalizeText(userInput).length / normalizedExerciseText.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-6xl w-full flex flex-col" style={{ height: 'calc(100vh - 2rem)', maxHeight: '900px' }}>

        {/* Header */}
        <div className="flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t.title}</h2>
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-1">{t.progress} {Math.round(progress)}%</p>
          </div>
        </div>

        {/* Content Area (flexible and scrollable) */}
        <div className="flex-grow flex flex-col min-h-0 space-y-3">
          {/* Top text display area */}
          <div className="p-3 bg-gray-50 rounded-lg font-mono text-base leading-relaxed whitespace-pre-wrap overflow-y-auto" style={{ direction: isRTL ? 'rtl' : 'ltr', flexBasis: '40%' }}>
            {renderTextComparison()}
          </div>

          {/* Bottom typing area */}
          <div className="flex flex-col" style={{ flexBasis: '60%' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">{t.instruction}</label>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={handleInputChange}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
              className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-lg resize-none focus:border-blue-500 focus:outline-none bg-white flex-grow"
              placeholder={t.subtitle}
              dir={isRTL ? 'rtl' : 'ltr'}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center mt-4 flex-shrink-0 ${isRTL ? 'justify-end flex-row-reverse' : 'justify-between'}`}>
          {isRTL ? (
            <>
              <button onClick={handleComplete} disabled={progress < 60} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50">
                {t.completeButton}
              </button>
              <button onClick={onBack} className="bg-gray-500 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:bg-gray-600 transition ml-3">
                {t.backButton || 'Back'}
              </button>
            </>
          ) : (
            <>
              <button onClick={onBack} className="bg-gray-500 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:bg-gray-600 transition">
                {t.backButton || 'Back'}
              </button>
              <button onClick={handleComplete} disabled={progress < 60} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition">
                {t.completeButton}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypingExercise;
