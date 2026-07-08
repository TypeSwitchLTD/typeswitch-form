// src/types.ts
// Shared type definitions for the TypeSwitch survey app.

export interface TypingMetrics {
  totalErrors: number;
  languageErrors: number;
  punctuationErrors: number;
  deletions: number;
  averageDelay: number;
  frustrationScore: number;
  languageSwitches: number;
  corrections: number;
  totalMistakesMade: number;
  finalErrors: number;
  accuracy: number;
  wpm: number;
  // Added by TypingExercise on completion:
  completionRate?: number;       // 0-100
  testDurationSeconds?: number;  // measured from first keystroke to completion
  tabSwitches?: number;          // times the user left the tab mid-exercise
}

export interface ErrorDetail {
  position: number;
  expected: string;
  actual: string;
  type: 'language' | 'punctuation' | 'typo';
  timestamp: number;
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  position: number;
  isBackspace: boolean;
  delay: number;
}

export interface ExerciseResult {
  text: string;
  userInput: string;
  timeSpent: number;
  errors: ErrorDetail[];
  deletions: number;
  corrections: number;
  languageSwitches: number;
  metrics: TypingMetrics;
  cheatingDetected?: boolean;
}

export interface Demographics {
  languages?: string[];
  hoursTyping?: string;
  occupation?: string;
  keyboardLayout?: string;
  keyboardLayoutOther?: string;
  keyboardPhysicalType?: string;
  age?: string;
  diagnosis?: string;
  [key: string]: any;
}

export interface SelfAssessmentData {
  difficulty?: number;
  errors?: number;
  languageSwitching?: number;
  frustration?: number;
}

export interface AwakeningData {
  symptoms?: string[];
}

export interface DeepDiveData {
  flowBreakerImpact?: string;
  professionalImageImpact?: string;
  highPaceChallenge?: string;
  copingMechanismText?: string;
  copingMechanismNone?: boolean;
}

export interface EpiphanyData {
  overallValueProposition?: string;
  rankedFeatures?: string[];
  finalFeedbackText?: string;
  noFinalFeedback?: boolean;
}

export interface SurveyData {
  demographics: Demographics;
  exercises: ExerciseResult[];
  selfAssessment: SelfAssessmentData;
  featureRatings: Record<string, any>;
  purchaseDecision: Record<string, any>;
  metrics: TypingMetrics;
  awakening?: AwakeningData;
  deepDive?: DeepDiveData;
  epiphany?: EpiphanyData;
  email?: string;
  testSkipped?: boolean;
  testCompleted?: boolean;
  screenTimes?: Record<string, number>;
  dropOffScreen?: string;
  browserClosedAt?: string;
  deviceInfo?: any;
  chosenExercise?: string;
}
