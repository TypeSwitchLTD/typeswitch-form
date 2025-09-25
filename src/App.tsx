import React, { useState, useEffect, useRef } from 'react';
// import { SurveyData, TypingMetrics } from './types'; // This type will need updating
import WelcomeScreen from './components/WelcomeScreen';
import DemographicsScreen from './components/DemographicsScreen';
import TypingExercise from './components/TypingExercise';
import SelfAssessment from './components/SelfAssessment';
import ResultsReport from './components/ResultsReport';
// --- DELETED IMPORTS ---
// import FeatureRating from './components/FeatureRating';
// import PurchaseDecision from './components/PurchaseDecision';
// --- NEW IMPORTS ---
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

// Centralized scoring and breakdown functions can remain as they are...
export const calculateOverallScore = (metrics: any): number => { /* ... no change ... */ return 0; };
export const getScoreBreakdown = (metrics: any) => { /* ... no change ... */ };


function App() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [lang, setLang] = useState<'he' | 'en'>('en'); // Add language state
  // ... other state variables remain the same ...
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
  // ... other state ...

  const [surveyData, setSurveyData] = useState<any>({ // Using `any` for now, should create a proper type
    demographics: {},
    exercises: [],
    selfAssessment: {},
    // New survey sections
    awakening: {},
    deepDive: {},
    epiphany: {},
    // Metrics
    metrics: { /* ... initial metrics ... */ }
  });

  // UPDATED screens array
  const screens = [
    'welcome',
    'demographics',
    'beforeExercise',
    'exercise1',
    'selfAssessment',
    'results',
    'theAwakening', // New Screen 6
    'theDeepDive',  // New Screen 7
    'theEpiphany',  // New Screen 8
    'thankYou'
  ];
  
  // ... useEffects and other functions remain largely the same ...
  
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

        // Save logic: now happens on the last survey screen before Thank You
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
    // This function can remain mostly the same, it just calls the updated supabase function
    if (saveAttempted.current || isSaving) return { success: false, id: null };
    // ... rest of the function ...
    const result = await saveSurveyData(dataToSave, discountCode);
    // ... rest of the function ...
    return result;
  };


  // ... other handler functions (handleSkipTest, handleEmailSubmit, etc.) are fine ...

  const renderScreen = () => {
    const screenName = screens[currentScreen];
    switch (screenName) {
      case 'welcome': return <WelcomeScreen onNext={handleWelcomeNext} onAdminClick={() => {}} />;
      case 'demographics': return <DemographicsScreen onNext={handleNext} />;
      // ... cases 'beforeExercise', 'exercise1', 'selfAssessment', 'results' are fine ...
      
      // NEW SCREEN CASES
      case 'theAwakening': return <TheAwakening onNext={handleNext} lang={lang} />;
      case 'theDeepDive': return <TheDeepDive onNext={handleNext} lang={lang} />;
      case 'theEpiphany': return <TheEpiphany onNext={handleNext} lang={lang} />;

      case 'thankYou': return <ThankYou discountCode={discountCode} onShare={() => {}} onEmailSubmit={()=>{}} skippedTest={skippedTest && !testCompleted} onTryTest={() => {}} />;
      default: return <WelcomeScreen onNext={handleWelcomeNext} onAdminClick={() => {}} />;
    }
  };

  // The progress bar logic needs to be updated with the new screen count
  const totalSteps = screens.length - 2; // e.g. 10 screens total, 8 steps
  const progressPercent = Math.round(((currentScreen) / totalSteps) * 100);

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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;