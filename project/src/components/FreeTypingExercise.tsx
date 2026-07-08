// src/components/FreeTypingExercise.tsx
// The FREE TYPING challenge: the user writes their own text on a chosen
// topic. No reference text - errors are detected behaviorally from the
// edit-event stream (see lib/freeTypingAnalysis.ts).

import React, { useState, useRef } from 'react';
import { TypingMetrics } from '../types';
import {
  EditEvent,
  analyzeFreeText,
  analyzeEditEvents,
  looksLikeMashing,
} from '../lib/freeTypingAnalysis';

interface Props {
  onComplete: (data: any) => void;
  onBack: () => void;
  selectedLanguage: string;
  t: any; // Translation object (translations.freeExercise)
}

export const FREE_TYPING_REQUIREMENTS = {
  minTotalWords: 40,
  minSecondaryWords: 10,
  minSwitches: 10,
  minPunctuation: 5,
  minDistinctSecondaryWords: 6, // hidden anti-gaming requirement
};

const FreeTypingExercise: React.FC<Props> = ({ onComplete, onBack, selectedLanguage, t }) => {
  const [topic, setTopic] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [warningShown, setWarningShown] = useState(false);

  const events = useRef<EditEvent[]>([]);
  const firstKeystrokeTime = useRef<number | null>(null);
  const lastKeystrokeTime = useRef<number>(0);
  const tabSwitches = useRef(0);
  const cheatingAttempts = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTL = selectedLanguage === 'Hebrew-English' || selectedLanguage === 'Arabic-English';
  const req = FREE_TYPING_REQUIREMENTS;

  const stats = analyzeFreeText(userInput);
  const requirements = [
    { label: t.reqWords, current: stats.totalWords, target: req.minTotalWords },
    { label: t.reqSecondLang, current: stats.secondaryWords, target: req.minSecondaryWords },
    { label: t.reqSwitches, current: stats.switches, target: req.minSwitches },
    { label: t.reqPunct, current: stats.punctuationUses, target: req.minPunctuation },
  ];
  const allMet = requirements.every(r => r.current >= r.target);

  React.useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && firstKeystrokeTime.current !== null) {
        tabSwitches.current += 1;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const resetExercise = () => {
    setUserInput('');
    events.current = [];
    firstKeystrokeTime.current = null;
    setWarningShown(false);
    textareaRef.current?.focus();
  };

  const handleCheating = (message: string) => {
    if (!warningShown) {
      setWarningShown(true);
      cheatingAttempts.current += 1;
      alert(message);
      resetExercise();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (warningShown) return;
    const newValue = e.target.value;
    const oldValue = userInput;
    const now = Date.now();
    const delay = lastKeystrokeTime.current > 0 ? now - lastKeystrokeTime.current : 0;

    // locate the edited region (same prefix/suffix technique as the copy test)
    const minLen = Math.min(oldValue.length, newValue.length);
    let prefix = 0;
    while (prefix < minLen && oldValue[prefix] === newValue[prefix]) prefix++;
    let suffix = 0;
    while (
      suffix < minLen - prefix &&
      oldValue[oldValue.length - 1 - suffix] === newValue[newValue.length - 1 - suffix]
    ) suffix++;

    const deletedText = oldValue.slice(prefix, oldValue.length - suffix);
    const insertedText = newValue.slice(prefix, newValue.length - suffix);

    if (insertedText.length > 0 && firstKeystrokeTime.current === null) {
      firstKeystrokeTime.current = now;
      (window as any).exerciseStartTime = now;
    }

    if (insertedText.length > 25) {
      handleCheating('⚠️ Bulk text insertion detected! Please type your text manually.');
      return;
    }
    if (insertedText.length > 0 && looksLikeMashing(newValue)) {
      handleCheating('⚠️ Please write real words, not random characters! The exercise will restart.');
      return;
    }

    if (deletedText.length > 0) {
      events.current.push({ type: 'del', text: deletedText, time: now, delay });
    }
    if (insertedText.length > 0) {
      // record inserted chars individually so per-char delays feed the
      // hesitation analysis (first char carries the real delay)
      for (let i = 0; i < insertedText.length; i++) {
        events.current.push({ type: 'ins', text: insertedText[i], time: now, delay: i === 0 ? delay : 0 });
      }
    }

    lastKeystrokeTime.current = now;
    setUserInput(newValue);
  };

  const handleComplete = () => {
    const finalStats = analyzeFreeText(userInput);

    // hidden anti-gaming requirements
    if (finalStats.distinctSecondaryWords < req.minDistinctSecondaryWords) {
      alert(t.variedWordsAlert);
      return;
    }
    if (finalStats.repeatedWordShare > 0.35) {
      alert(t.repetitionAlert);
      return;
    }

    const behavior = analyzeEditEvents(events.current);
    const endTime = Date.now();
    (window as any).exerciseEndTime = endTime;
    const effectiveStart = firstKeystrokeTime.current ?? endTime;
    const testDurationSeconds = Math.max(1, Math.round((endTime - effectiveStart) / 1000));

    const timeInMinutes = Math.max(0.1, (endTime - effectiveStart) / 60000);
    const rawWpm = (userInput.trim().length / 5) / timeInMinutes;
    const wpm = Math.max(0, Math.min(150, Math.round(isFinite(rawWpm) ? rawWpm : 0)));

    // "accuracy" for free typing = share of words typed without an incident
    const incidents = behavior.wrongLanguageIncidents + finalStats.mixedWords;
    const accuracy = finalStats.totalWords > 0
      ? Math.max(0, Math.min(100, Math.round(((finalStats.totalWords - incidents) / finalStats.totalWords) * 100)))
      : 100;

    const insDelays = events.current.filter(ev => ev.type === 'ins' && ev.delay > 0 && ev.delay < 5000).map(ev => ev.delay);
    const averageDelay = insDelays.length > 0 ? Math.round(insDelays.reduce((a, b) => a + b, 0) / insDelays.length) : 0;

    const frustrationFactors = [
      Math.min(2, behavior.wrongLanguageIncidents * 0.5),
      Math.min(1.5, behavior.punctuationFumbles * 0.3),
      behavior.deletionRate > 10 ? 1.5 : (behavior.deletionRate > 6 ? 0.75 : 0),
      behavior.switchRecoveryRatio > 3 ? 2 : (behavior.switchRecoveryRatio > 2 ? 1 : 0),
      Math.min(1, finalStats.mixedWords * 0.3),
    ];
    const frustrationScore = Math.round(Math.min(10, frustrationFactors.reduce((a, b) => a + b, 0)));

    // robotic cadence: near-uniform keystroke timing = automation
    let roboticCadence = false;
    if (insDelays.length >= 50) {
      const mean = insDelays.reduce((a, b) => a + b, 0) / insDelays.length;
      const variance = insDelays.reduce((a, b) => a + (b - mean) ** 2, 0) / insDelays.length;
      roboticCadence = Math.sqrt(variance) < 15;
    }
    const cheatingDetected =
      cheatingAttempts.current > 0 ||
      roboticCadence ||
      testDurationSeconds < 25;

    const metrics: TypingMetrics = {
      totalErrors: incidents,
      languageErrors: behavior.wrongLanguageIncidents,
      punctuationErrors: behavior.punctuationFumbles,
      deletions: behavior.totalDeletedChars,
      corrections: behavior.wrongLanguageIncidents, // incidents were, by definition, corrected
      languageSwitches: finalStats.switches,
      averageDelay,
      frustrationScore,
      totalMistakesMade: incidents + behavior.punctuationFumbles,
      finalErrors: finalStats.mixedWords,
      accuracy,
      wpm,
    };

    const enrichedMetrics = {
      ...metrics,
      freeTest: true,
      completionRate: 100, // requirements gate completion by definition
      testDurationSeconds,
      tabSwitches: tabSwitches.current,
      wordCount: finalStats.totalWords,
      secondaryWords: finalStats.secondaryWords,
      punctuationUses: finalStats.punctuationUses,
      mixedWords: finalStats.mixedWords,
      deletionRate: Math.round(behavior.deletionRate * 10) / 10,
      switchRecoveryRatio: Math.round(behavior.switchRecoveryRatio * 10) / 10,
      layoutConfirmedIncidents: behavior.layoutConfirmed,
      topic,
    };

    onComplete({
      exercises: [{
        text: `FREE_TYPING:${topic}`,
        userInput: '', // free text is NOT stored (privacy decision)
        timeSpent: endTime - effectiveStart,
        errors: [],
        deletions: behavior.totalDeletedChars,
        corrections: metrics.corrections,
        languageSwitches: finalStats.switches,
        metrics: enrichedMetrics,
        cheatingDetected
      }],
      metrics: enrichedMetrics
    });
  };

  const topics: string[] = t.topics || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-6xl w-full flex flex-col" style={{ height: 'calc(100vh - 2rem)', maxHeight: '900px' }}>

        {/* Header */}
        <div className="flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t.title}</h2>
          <p className="text-sm text-gray-600 mb-3">{t.subtitle}</p>
        </div>

        {topic === null ? (
          /* Topic selection */
          <div className="flex-grow flex flex-col justify-center">
            <h3 className="text-base font-semibold text-gray-800 mb-4 text-center">{t.chooseTopic}</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {topics.map((tp, i) => (
                <button
                  key={i}
                  onClick={() => { setTopic(tp); setTimeout(() => textareaRef.current?.focus(), 50); }}
                  className="border-2 border-blue-200 hover:border-blue-400 bg-blue-50 rounded-lg p-5 text-center transition"
                >
                  <span className="font-semibold text-blue-800">{tp}</span>
                </button>
              ))}
            </div>
            <button onClick={onBack} className="mx-auto bg-gray-500 text-white py-2 px-6 rounded-lg font-semibold text-sm hover:bg-gray-600 transition">
              {t.backButton}
            </button>
          </div>
        ) : (
          <>
            {/* Live requirements checklist */}
            <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3 mb-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 justify-center">
                <span className="text-sm font-semibold text-blue-800">📝 {topic}</span>
                {requirements.map((r, i) => {
                  const met = r.current >= r.target;
                  return (
                    <span key={i} className={`text-xs font-medium ${met ? 'text-green-700' : 'text-gray-600'}`}>
                      {met ? '✅' : '⬜'} {r.label}: {Math.min(r.current, r.target)}/{r.target}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Writing area */}
            <div className="flex-grow flex flex-col min-h-0">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onPaste={(e) => { e.preventDefault(); handleCheating('⚠️ Copy/Paste is not allowed! Please type your text manually.'); }}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg resize-none focus:border-blue-500 focus:outline-none bg-white flex-grow"
                placeholder={t.placeholder}
                dir={isRTL ? 'rtl' : 'ltr'}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <p className="text-xs text-gray-500 mt-1 flex-shrink-0">{t.tip}</p>
            </div>

            {/* Footer */}
            <div className={`flex items-center mt-3 flex-shrink-0 ${isRTL ? 'justify-end flex-row-reverse' : 'justify-between'}`}>
              {isRTL ? (
                <>
                  <button onClick={handleComplete} disabled={!allMet} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50">
                    {t.completeButton}
                  </button>
                  <button onClick={() => setTopic(null)} className="bg-gray-500 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:bg-gray-600 transition ml-3">
                    {t.changeTopic}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setTopic(null)} className="bg-gray-500 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:bg-gray-600 transition">
                    {t.changeTopic}
                  </button>
                  <button onClick={handleComplete} disabled={!allMet} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50">
                    {t.completeButton}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreeTypingExercise;
