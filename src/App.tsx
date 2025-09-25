import React, { useState, useEffect, useRef } from 'react';
import { SurveyData, TypingMetrics } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import DemographicsScreen from './components/DemographicsScreen';
import TypingExercise from './components/TypingExercise';
import SelfAssessment from './components/SelfAssessment';
import ResultsReport from './components/ResultsReport';
import TheAwakening from './components/TheAwakening';
import TheDeepDive from './components/TheDeepDive';
import TheEpiphany from './components/TheEpiphany';
import ThankYou from './components/ThankYou';
import ShareCard from './components/ShareCard';
import AdminDashboard from './components/AdminDashboard';
import { saveSurveyData, saveEmailSubscription } from './lib/supabase';
import {
  getDeviceFingerprint,
  getIPAddress,
  checkIfAlreadySubmitted,
  saveDeviceInfo,
  detectDevice,
  DeviceInfo
} from './lib/deviceTracking';

// Centralized scoring and breakdown functions
export const calculateOverallScore = (metrics: TypingMetrics): number => {
  if (!metrics || !metrics.wpm) return 0;
  
  let score = 100;
  
  // WPM penalties
  if (metrics.wpm < 20) score -= 30;
  else if (metrics.wpm < 30) score -= 25;
  else if (metrics.wpm < 40) score -= 18;
  else if (metrics.wpm < 50) score -= 10;
  else if (metrics.wpm < 60) score -= 5;
  
  // Accuracy penalties
  if (metrics.accuracy < 85) score -= 20;
  else if (metrics.accuracy < 90) score -= 15;
  else if (metrics.accuracy < 95) score -= 10;
  
  // Error penalties
  score -= Math.min(15, metrics.totalErrors * 2);
  score -= Math.min(10, metrics.languageErrors * 3);
  score -= Math.min(8, metrics.deletions * 0.5);
  score -= Math.min(12, metrics.frustrationScore * 1.5);
  
  return Math.max(1, Math.min(100, Math.round(score)));
};

export const getScoreBreakdown = (metrics: TypingMetrics) => {
  const breakdown = [];
  let totalPenalty = 0;
  
  if (metrics.wpm < 60) {
    const penalty = metrics.wpm < 20 ? 30 : metrics.wpm < 30 ? 25 : metrics.wpm < 40 ? 18 : metrics.wpm < 50 ? 10 : 5;
    breakdown.push({ category: 'Typing Speed', reason: `${metrics.wpm} WPM`, penalty });
    totalPenalty += penalty;
  }
  
  if (metrics.accuracy < 95) {
    const penalty = metrics.accuracy < 85 ? 20 : metrics.accuracy < 90 ? 15 : 10;
    breakdown.push({ category: 'Accuracy', reason: `${metrics.accuracy}%`, penalty });
    totalPenalty += penalty;
  }
  
  if (metrics.totalErrors > 0) {
    const penalty = Math.min(15, metrics.totalErrors * 2);
    breakdown.push({ category: 'Total Errors', reason: `${metrics.totalErrors} errors`, penalty });
    totalPenalty += penalty;
  }
  
  if (metrics.languageErrors > 0) {
    const penalty = Math.min(10, metrics.languageErrors * 3);
    breakdown.push({ category: 'Language Errors', reason: `${metrics.languageErrors} wrong language`, penalty });
    totalPenalty += penalty;
  }
  
  if (metrics.deletions > 0) {
    const penalty = Math.min(8, metrics.deletions * 0.5);
    breakdown.push({ category: 'Deletions', reason: `${metrics.deletions} backspaces`, penalty });
    totalPenalty += penalty;
  }
  
  if (metrics.frustrationScore > 0) {
    const penalty = Math.min(12, metrics.frustrationScore * 1.5);
    breakdown.push({ category: 'Frustration', reason: `${metrics.frustrationScore}/10 level`, penalty });
    totalPenalty += penalty;
  }
  
  return {
    breakdown,
    totalPenalty,
    finalScore: Math.max(1, 100 - totalPenalty)
  };
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [lang, setLang] = useState<'he' | 'en'>('en');
  const [showShareCard, setShowShareCard] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [discountCode] = useState(`TYPE${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const [isSaving, setIsSaving] = useState(false);
  const saveAttempted = useRef(false);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const [skippedTest, setSkippedTest] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [isRetakeTest, setIsRetakeTest] = useState(false);

  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({
    demographics: {
      languages: [],
      hoursTyping: '',
      occupation: '',
      keyboardType: '',
      currentKeyboard: '',
      age: '',
      diagnosis: ''
    },
    exercises: [],
    selfAssessment: {
      difficulty: 0,
      errors: 0,
      languageSwitching: 0,
      frustration: 0
    },
    awakening: {
      symptoms: []
    },
    deepDive: {
      flowBreakerImpact: '',
      professionalImageImpact: '',
      highPaceChallenge: '',
      copingMechanismText: '',
      copingMechanismNone: false
    },
    epiphany: {
      overallValueProposition: '',
      ranking: {},
      finalFeedbackText: ''
    },
    metrics: {
      totalErrors: 0,
      languageErrors: 0,
      punctuationErrors: 0,
      deletions: 0,
      corrections: 0,
      languageSwitches: 0,
      averageDelay: 0,
      frustrationScore: 0,
      totalMistakesMade: 0,
      finalErrors: 0,
      accuracy: 0,
      wpm: 0
    }
  });

  const screens = [
    'welcome',
    'demographics',
    'beforeExercise',
    'exercise1',
    'selfAssessment',
    'results',
    'theAwakening',
    'theDeepDive',
    'theEpiphany',
    'thankYou'
  ];

  // Initialize device tracking
  useEffect(() => {
    const initializeDeviceTracking = async () => {
      try {
        // Set checkingSubmission to false immediately so welcome screen shows
        setCheckingSubmission(false);
        
        const device = detectDevice();
        setIsMobileDevice(device.isMobile);
        
        const [fingerprint, ip] = await Promise.all([
          getDeviceFingerprint(),
          getIPAddress()
        ]);
        
        const deviceInfo: DeviceInfo = {
          fingerprint,
          ip,
          deviceType: device.type,
          isMobile: device.isMobile
        };
        
        setDeviceInfo(deviceInfo);
        
        const alreadySubmitted = await checkIfAlreadySubmitted(fingerprint, ip);
        setAlreadySubmitted(alreadySubmitted);
      } catch (error) {
        console.error('Error initializing device tracking:', error);
        // Even if there's an error, allow the user to proceed
        setAlreadySubmitted(false);
      }
    };

    initializeDeviceTracking();
    (window as any).surveyStartTime = Date.now();
  }, []);

  const handleWelcomeNext = (selectedLang: 'he' | 'en') => {
    setLang(selectedLang);
    setCurrentScreen(1);
  };

  const handleNext = async (data?: any) => {
    setError(null);
    setIsLoading(true);

    try {
      let updatedSurveyData = { ...surveyData, ...data };
      
      if (data && data.exercises && data.exercises.length > 0) {
        const exercise = data.exercises[0];
        updatedSurveyData.metrics = exercise.metrics;
        setTestCompleted(true);
      }

      setSurveyData(updatedSurveyData);

      // Save logic: happens on the last survey screen before Thank You
      if (currentScreen === screens.indexOf('theEpiphany') && !saveAttempted.current && !surveyCompleted && !isRetakeTest) {
        updatedSurveyData.testSkipped = skippedTest;
        updatedSurveyData.testCompleted = testCompleted;
        await saveToDatabase(updatedSurveyData);
      }

      const nextScreen = isRetakeTest && currentScreen === 3 ? 5 : currentScreen + 1;
      setCurrentScreen(nextScreen);

    } catch (err) {
      console.error('Error processing data:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDatabase = async (dataToSave: any) => {
    if (saveAttempted.current || isSaving) return { success: false, id: null };
    
    saveAttempted.current = true;
    setIsSaving(true);
    
    try {
      const result = await saveSurveyData(dataToSave, discountCode);
      
      if (result.success && result.id) {
        setSurveyId(result.id);
        setSurveyCompleted(true);
        
        if (deviceInfo) {
          await saveDeviceInfo(result.id, deviceInfo);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error saving to database:', error);
      return { success: false, error: 'Failed to save' };
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipTest = () => {
    setSkippedTest(true);
    setCurrentScreen(6); // Skip to theAwakening
  };

  const handleEmailSubmit = async (email: string) => {
    if (surveyId) {
      await saveEmailSubscription(email, surveyId);
    }
  };

  const handleShare = () => {
    if (surveyData.metrics) {
      setShowShareCard(true);
    }
  };

  const handleTryTest = () => {
    setIsRetakeTest(true);
    setCurrentScreen(2); // Go to beforeExercise
  };

  const renderScreen = () => {
    if (checkingSubmission) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your device...</p>
          </div>
        </div>
      );
    }

    if (alreadySubmitted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Already Completed</h2>
            <p className="text-gray-600 mb-6">
              It looks like you've already completed this survey from this device or network.
              Thank you for your participation!
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      );
    }

    if (showShareCard && surveyData.metrics) {
      return (
        <ShareCard
          metrics={surveyData.metrics}
          onClose={() => setShowShareCard(false)}
          selectedLanguage={surveyData.demographics?.languages?.[0] || 'Hebrew-English'}
        />
      );
    }

    if (showAdmin) {
      return <AdminDashboard onClose={() => setShowAdmin(false)} />;
    }

    const screenName = screens[currentScreen];
    switch (screenName) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} onAdminClick={() => setShowAdmin(true)} />;
      
      case 'demographics':
        return <DemographicsScreen onNext={handleNext} />;
      
      case 'beforeExercise':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready for the Typing Challenge?</h2>
              <p className="text-gray-600 mb-6">
                You'll type a multilingual email mixing {surveyData.demographics?.languages?.[0] || 'Hebrew-English'}. 
                This will help us analyze your real typing patterns.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentScreen(3)}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Start Typing Test
                </button>
                <button
                  onClick={handleSkipTest}
                  className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Skip Test
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'exercise1':
        return (
          <TypingExercise
            exerciseNumber={1}
            onComplete={handleNext}
            selectedLanguage={surveyData.demographics?.languages?.[0] || 'Hebrew-English'}
          />
        );
      
      case 'selfAssessment':
        return <SelfAssessment onNext={handleNext} />;
      
      case 'results':
        return (
          <ResultsReport
            metrics={surveyData.metrics!}
            onNext={handleNext}
            onShare={handleShare}
            isRetake={isRetakeTest}
          />
        );
      
      case 'theAwakening':
        return <TheAwakening onNext={handleNext} lang={lang} />;
      
      case 'theDeepDive':
        return <TheDeepDive onNext={handleNext} lang={lang} />;
      
      case 'theEpiphany':
        return <TheEpiphany onNext={handleNext} lang={lang} />;
      
      case 'thankYou':
        return (
          <ThankYou
            discountCode={discountCode}
            onShare={handleShare}
            onEmailSubmit={handleEmailSubmit}
            skippedTest={skippedTest && !testCompleted}
            onTryTest={handleTryTest}
          />
        );
      
      default:
        return <WelcomeScreen onNext={handleWelcomeNext} onAdminClick={() => setShowAdmin(true)} />;
    }
  };

  const totalSteps = screens.length - 2;
  const progressPercent = Math.round(((currentScreen) / totalSteps) * 100);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setCurrentScreen(0);
            }}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {renderScreen()}
      {currentScreen > 0 && currentScreen < screens.length - 1 && !isRetakeTest && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-2 z-40">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Step {currentScreen} of {totalSteps}</span>
              <span className="text-xs text-gray-600">{progressPercent}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;