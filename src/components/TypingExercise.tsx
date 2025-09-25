import React, { useState, useEffect, useRef } from 'react';
import { ErrorDetail, KeystrokeEvent, TypingMetrics } from '../types';

interface Props {
  exerciseNumber: number;
  onComplete: (data: any) => void;
  selectedLanguage: string;
}

const exercises = {
  'Arabic-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `لفريق المشتريات،
في متابعة للـ RFQ الذي نشرناه، تلقينا عروضاً من 12 مورداً، معظمهم من APAC وأوروبا.
حالياً أفضل 3 موردين:
1. Abra: مُصنِّع
2. Kabri: مورد فرعي
3. CocoLemon: موزع
أطلب فحص شروط الدفع بشكل عاجل (NET 30/60/90) وأوقات التسليم.
آخر موعد للتنفيذ 15/07/2025.
نائب مدير المشتريات - COO`
    }
  ],
  'French-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `À l'équipe des achats,
Suite au RFQ que nous avons publié, nous avons reçu des propositions de 12 fournisseurs, principalement d'APAC et d'Europe.
Actuellement, Top 3 fournisseurs:
1. Abra: fabricant
2. Kabri: sous-traitant
3. CocoLemon: distributeur
Je demande de vérifier en urgence les conditions de paiement (NET 30/60/90) et les délais de livraison.
Date limite d'exécution 15/07/2025.
Directeur adjoint des achats - COO`
    }
  ],
  'Hebrew-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `לצוות הרכש,
בהמשך ל-RFQ שפרסמנו, קיבלנו הצעות מ-12 ספקים, רובם מ-APAC ואירופה.
כרגע Top 3 ספקים:
1. Abra: יצרן
2. Kabri: ספק משנה
3. CocoLemon: מפיץ
מבקש לבדוק בדחיפות תנאי תשלום (NET 30/60/90) וזמני אספקה.
תאריך אחרון לביצוע 15/07/2025.
סמנכ"ל רכש - COO`
    }
  ],
  'Hindi-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `procurement team के लिए,
हमारे द्वारा प्रकाशित RFQ के बाद, हमें 12 suppliers से proposals मिले हैं, जिनमें से अधिकतर APAC और यूरोप से हैं।
अभी Top 3 suppliers:
1. Abra: manufacturer
2. Kabri: sub-contractor
3. CocoLemon: distributor
कृपया payment terms (NET 30/60/90) और delivery times को तुरंत check करें।
अंतिम तारीख 15/07/2025 है।
Deputy Director Procurement - COO`
    }
  ],
  'Japanese-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `調達チームへ、
公開したRFQに続いて、12のsuppliersから提案を受け取りました。そのほとんどがAPACとヨーロッパからです。
現在のTop 3 suppliers:
1. Abra: メーカー
2. Kabri: サブコントラクター
3. CocoLemon: ディストリビューター
支払い条件（NET 30/60/90）と配送時間を緊急に確認してください。
実行期限は15/07/2025です。
調達副部長 - COO`
    }
  ],
  'Russian-English': [
    {
      title: "Exercise 1 - Purchasing Email",
      text: `Команде закупок,
В продолжение опубликованного RFQ мы получили предложения от 12 поставщиков, в основном из APAC и Европы.
Сейчас Top 3 поставщика:
1. Abra: производитель
2. Kabri: субподрядчик
3. CocoLemon: дистрибьютор
Прошу срочно проверить условия оплаты (NET 30/60/90) и сроки поставки.
Крайний срок выполнения 15/07/2025.
Зам. директора по закупкам - COO`
    }
  ]
};

const TypingExercise: React.FC<Props> = ({ exerciseNumber, onComplete, selectedLanguage }) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [keystrokes, setKeystrokes] = useState<KeystrokeEvent[]>([]);
  const [deletions, setDeletions] = useState(0);
  const [languageSwitches, setLanguageSwitches] = useState(0);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0);
  const [lastLanguage, setLastLanguage] = useState<'hebrew' | 'arabic' | 'english' | 'russian' | 'hindi' | 'french' | 'japanese' | 'korean' | null>(null);
  const [allMistakes, setAllMistakes] = useState<Set<number>>(new Set());
  const [correctedMistakes, setCorrectedMistakes] = useState<Set<number>>(new Set());
  const [punctuationMistakes, setPunctuationMistakes] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [charFrequency, setCharFrequency] = useState<{[key: string]: number}>({});
  const [warningShown, setWarningShown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Refs for cleanup - FIXED MEMORY LEAKS
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pasteHandler = useRef<((e: ClipboardEvent) => void) | null>(null);
  const copyHandler = useRef<((e: ClipboardEvent) => void) | null>(null);
  const cutHandler = useRef<((e: ClipboardEvent) => void) | null>(null);

  // Get exercises based on selected language
  const exerciseSet = exercises[selectedLanguage] || exercises['Arabic-English'];
  const exercise = exerciseSet[exerciseNumber - 1];
  
  // Determine if RTL based on language
  const isRTL = selectedLanguage === 'Hebrew-English' || selectedLanguage === 'Arabic-English';

  // Common punctuation confusion patterns
  const punctuationConfusions = [
    ['.', ','], [',', '.'],
    ['(', ')'], [')', '('],
    ['-', '_'], ['_', '-'],
    ['/', '\\'], ['\\', '/'],
    [';', ':'], [':', ';'],
    ['!', '?'], ['?', '!']
  ];

  const normalizeText = (text: string) => {
    return text.trim();
  };

  const normalizedExerciseText = normalizeText(exercise.text);

  // Cleanup function - PROPERLY CLEAN ALL RESOURCES
  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Remove event listeners
    if (pasteHandler.current) {
      document.removeEventListener('paste', pasteHandler.current);
      pasteHandler.current = null;
    }
    if (copyHandler.current) {
      document.removeEventListener('copy', copyHandler.current);
      copyHandler.current = null;
    }
    if (cutHandler.current) {
      document.removeEventListener('cut', cutHandler.current);
      cutHandler.current = null;
    }
  };

  useEffect(() => {
    setStartTime(Date.now());
    setLastKeystrokeTime(Date.now());
    textareaRef.current?.focus();
    
    // Reset all state
    setUserInput('');
    setDeletions(0);
    setLanguageSwitches(0);
    setKeystrokes([]);
    setAllMistakes(new Set());
    setCorrectedMistakes(new Set());
    setLastLanguage(null);
    setPunctuationMistakes(0);
    setCheatingDetected(false);
    setCharFrequency({});
    setWarningShown(false);

    // Cleanup on unmount or exercise change
    return cleanup;
  }, [exerciseNumber]);

  useEffect(() => {
    // Create handlers
    pasteHandler.current = (e: ClipboardEvent) => {
      e.preventDefault();
      setCheatingDetected(true);
      if (!warningShown) {
        alert('⚠️ Copy/Paste is not allowed! Please type the text manually.');
        setWarningShown(true);
      }
      return false;
    };
    
    copyHandler.current = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    
    cutHandler.current = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('paste', pasteHandler.current);
    document.addEventListener('copy', copyHandler.current);
    document.addEventListener('cut', cutHandler.current);

    // Cleanup on unmount
    return cleanup;
  }, [warningShown]);

  const detectLanguage = (char: string): 'hebrew' | 'arabic' | 'english' | 'russian' | 'hindi' | 'french' | 'japanese' | 'korean' | null => {
    if (/[א-ת]/.test(char)) return 'hebrew';
    if (/[\u0600-\u06FF]/.test(char)) return 'arabic';
    if (/[а-яА-Я]/.test(char)) return 'russian';
    if (/[\u0900-\u097F]/.test(char)) return 'hindi';
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(char)) return 'japanese';
    if (/[\uAC00-\uD7AF]/.test(char)) return 'korean';
    if (/[àâäçèéêëîïôùûü]/.test(char.toLowerCase())) return 'french';
    if (/[a-zA-Z]/.test(char)) return 'english';
    return null;
  };

  const detectCheating = (newChar: string, currentInput: string) => {
    // Track character frequency
    const updatedFrequency = {...charFrequency};
    updatedFrequency[newChar] = (updatedFrequency[newChar] || 0) + 1;
    setCharFrequency(updatedFrequency);
    
    // Check for patterns that indicate cheating
    const totalChars = Object.values(updatedFrequency).reduce((a, b) => a + b, 0);
    const maxFrequency = Math.max(...Object.values(updatedFrequency));
    
    // If one character appears more than 30% of the time, it's suspicious
    if (totalChars > 20 && maxFrequency / totalChars > 0.3) {
      setCheatingDetected(true);
      if (!warningShown) {
        alert('⚠️ Suspicious typing pattern detected! Please type the actual text, not random characters.');
        setWarningShown(true);
      }
    }
    
    // Check if typing speed is unrealistic (over 200 WPM)
    const timeInMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
    const words = currentInput.split(/\s+/).filter(w => w.length > 0).length;
    const wpm = words / timeInMinutes;
    if (wpm > 200 && words > 10) {
      setCheatingDetected(true);
    }
    
    // Check for repetitive patterns (same key pressed many times)
    const last5Chars = currentInput.slice(-5);
    if (last5Chars.length === 5 && new Set(last5Chars).size === 1) {
      setCheatingDetected(true);
      if (!warningShown) {
        alert('⚠️ Please type the actual text, not the same character repeatedly!');
        setWarningShown(true);
      }
    }
  };

  const isPunctuationConfusion = (expected: string, actual: string): boolean => {
    return punctuationConfusions.some(([a, b]) => 
      (expected === a && actual === b) || (expected === b && actual === a)
    );
  };

  const detectErrors = (input: string): ErrorDetail[] => {
    const errors: ErrorDetail[] = [];
    const normalizedInput = normalizeText(input);
    const expectedChars = normalizedExerciseText.split('');
    const actualChars = normalizedInput.split('');
    let localPunctuationMistakes = 0;

    for (let i = 0; i < actualChars.length; i++) {
      if (i >= expectedChars.length) break;
      
      const expected = expectedChars[i];
      const actual = actualChars[i];

      if (expected !== actual) {
        let errorType: 'language' | 'punctuation' | 'typo' = 'typo';
        
        // Check for language switching errors
        const expectedLang = detectLanguage(expected);
        const actualLang = detectLanguage(actual);
        
        if (expectedLang && actualLang && expectedLang !== actualLang) {
          errorType = 'language';
        }
        // Check for punctuation errors including confusion patterns
        else if (/[.,!?;:\-(){}[\]"'•%/\\–_]/.test(expected) || /[.,!?;:\-(){}[\]"'•%/\\–_]/.test(actual)) {
          errorType = 'punctuation';
          // Track if it's a common confusion
          if (isPunctuationConfusion(expected, actual)) {
            localPunctuationMistakes++;
          }
        }

        errors.push({
          position: i,
          expected,
          actual,
          type: errorType,
          timestamp: Date.now()
        });
      }
    }

    // Update punctuation mistakes count
    setPunctuationMistakes(localPunctuationMistakes);

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldValue = userInput;
    const currentTime = Date.now();
    const delay = currentTime - lastKeystrokeTime;

    if (newValue.length < oldValue.length) {
      // User deleted characters
      setDeletions(prev => prev + (oldValue.length - newValue.length));
      
      // Check if the deletion fixed any mistakes
      const oldErrors = detectErrors(oldValue);
      const newErrors = detectErrors(newValue);
      
      // Find positions that were errors in old but not in new
      const oldErrorPositions = new Set(oldErrors.map(e => e.position));
      const newErrorPositions = new Set(newErrors.map(e => e.position));
      
      for (const pos of oldErrorPositions) {
        if (!newErrorPositions.has(pos) && allMistakes.has(pos)) {
          setCorrectedMistakes(prev => new Set(prev).add(pos));
        }
      }
    }

    if (newValue.length > oldValue.length) {
      const newChar = newValue.slice(-1);
      
      // Detect cheating
      detectCheating(newChar, newValue);
      
      const currentLang = detectLanguage(newChar);
      
      if (currentLang && lastLanguage && currentLang !== lastLanguage) {
        setLanguageSwitches(prev => prev + 1);
      }
      
      if (currentLang) {
        setLastLanguage(currentLang);
      }

      const normalizedNew = normalizeText(newValue);
      const position = normalizedNew.length - 1;
      const expectedChar = normalizedExerciseText[position];
      
      if (expectedChar && normalizedNew[position] !== expectedChar) {
        setAllMistakes(prev => new Set(prev).add(position));
      }
    }

    setKeystrokes(prev => [...prev, {
      key: newValue.slice(-1) || 'backspace',
      timestamp: currentTime,
      position: newValue.length,
      isBackspace: newValue.length < oldValue.length,
      delay
    }]);

    setLastKeystrokeTime(currentTime);
    setUserInput(newValue);
  };

  const calculateMetrics = (): TypingMetrics => {
    const normalizedInput = normalizeText(userInput);
    const errors = detectErrors(userInput);
    const languageErrors = errors.filter(e => e.type === 'language').length;
    const punctuationErrors = errors.filter(e => e.type === 'punctuation').length;
    
    // Calculate corrections properly - FIXED
    const corrections = correctedMistakes.size;
    
    // STRICTER WPM calculation - remove bonus
    const timeInMinutes = Math.max(0.1, (Date.now() - startTime) / 60000);
    const words = normalizedInput.split(/\s+/).filter(w => w.length > 0).length;
    const rawWPM = words / timeInMinutes;
    
    // Apply penalty for cheating
    let wpm = Math.round(rawWPM);
    if (cheatingDetected) {
      wpm = Math.max(0, Math.round(wpm * 0.3)); // Heavy penalty for cheating
    }
    wpm = Math.max(0, Math.min(150, wpm));
    
    const totalChars = normalizedInput.length;
    const correctChars = Math.max(0, totalChars - errors.length);
    let accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    // Penalty for cheating
    if (cheatingDetected) {
      accuracy = Math.max(0, accuracy - 30);
    }
    
    const validDelays = keystrokes.map(k => k.delay).filter(d => d < 5000 && d > 0);
    const averageDelay = validDelays.length > 0 
      ? Math.round(validDelays.reduce((a, b) => a + b, 0) / validDelays.length)
      : 0;
    
    // STRICTER frustration score calculation
    const frustrationFactors = [
      Math.min(3, errors.length * 0.25),
      Math.min(3, allMistakes.size * 0.15),
      Math.min(2, deletions * 0.15),
      Math.min(1, corrections * 0.05),
      Math.min(1, languageSwitches * 0.1),
      Math.min(1, punctuationMistakes * 0.2),
      averageDelay > 3000 ? 2 : (averageDelay > 2000 ? 1 : 0),
      cheatingDetected ? 3 : 0
    ];
    
    const frustrationScore = Math.round(
      Math.min(10, frustrationFactors.reduce((a, b) => a + b, 0))
    );

    return {
      totalErrors: errors.length,
      languageErrors,
      punctuationErrors,
      deletions,
      corrections,  // Now properly calculated
      languageSwitches,
      averageDelay,
      frustrationScore,
      totalMistakesMade: allMistakes.size,
      finalErrors: errors.length,
      accuracy,
      wpm
    };
  };

  const handleComplete = () => {
    const metrics = calculateMetrics();
    
    // Check minimum completion
    const normalizedInput = normalizeText(userInput);
    if (normalizedInput.length < normalizedExerciseText.length * 0.5) {
      alert('Please type at least 50% of the text to continue.');
      return;
    }
    
    // Check for extreme cheating
    if (cheatingDetected && metrics.accuracy < 50) {
      alert('⚠️ Invalid test detected! Please restart and type the actual text.');
      setUserInput('');
      setCheatingDetected(false);
      setCharFrequency({});
      setCorrectedMistakes(new Set());
      return;
    }
    
    // Cleanup before completing
    cleanup();
    
    onComplete({
      exercises: [{
        exerciseNumber,
        text: exercise.text,
        userInput,
        timeSpent: Date.now() - startTime,
        errors: detectErrors(userInput),
        deletions,
        corrections: metrics.corrections,
        languageSwitches,
        metrics,
        cheatingDetected
      }],
      metrics
    });
  };

  const renderTextComparison = () => {
    const normalizedInput = normalizeText(userInput);
    const expectedChars = normalizedExerciseText.split('');
    const actualChars = normalizedInput.split('');
    
    return expectedChars.map((char, index) => {
      let className = 'text-gray-400';
      let style: React.CSSProperties = {};
      
      if (index < actualChars.length) {
        if (actualChars[index] === char) {
          className = 'text-green-600';
          style = { fontWeight: 'bold' };
        } else {
          className = 'text-red-600 bg-red-50';
          style = { fontWeight: 'bold' };
        }
      }
      
      if (char === '\n') {
        return <br key={index} />;
      }
      
      return (
        <span key={index} className={className} style={style}>
          {char}
        </span>
      );
    });
  };

  const progress = Math.min(100, (normalizeText(userInput).length / normalizedExerciseText.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-xl p-4 max-w-6xl w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2">{exercise.title}</h2>
        
        {cheatingDetected && (
          <div className="mb-2 p-2 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 text-sm font-semibold">
              ⚠️ Suspicious activity detected! Please type the actual text.
            </p>
          </div>
        )}
        
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Progress: {Math.round(progress)}%</p>
        </div>

        <div className="mb-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {renderTextComparison()}
          </p>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Type the email here:
          </label>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onPaste={(e) => {
              e.preventDefault();
              setCheatingDetected(true);
              alert('⚠️ Paste is not allowed! Please type manually.');
            }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm leading-relaxed resize-none focus:border-blue-500 focus:outline-none bg-white"
            rows={7}
            placeholder="Start typing the email..."
            dir={isRTL ? 'rtl' : 'ltr'}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{ lineHeight: '1.6' }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span>Characters: {normalizeText(userInput).length} / {normalizedExerciseText.length}</span>
          </div>
          
          <button
            onClick={handleComplete}
            disabled={normalizeText(userInput).length < normalizedExerciseText.length * 0.5}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Exercise
          </button>
        </div>
        
        {normalizeText(userInput).length < normalizedExerciseText.length * 0.5 && (
          <p className="text-xs text-gray-500 mt-1 text-right">
            Type at least 50% to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default TypingExercise;