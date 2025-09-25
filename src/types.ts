export interface SurveyData {
  demographics: {
    languages: string[];
    hoursTyping: string;
    occupation: string;
    keyboardType: string;
    currentKeyboard: string;
    age: string;
    diagnosis: string;
  };
  exercises: ExerciseData[];
  selfAssessment: {
    difficulty: number;
    errors: number;
    languageSwitching: number;
    frustration: number;
  };
  awakening: {
    symptoms: string[];
  };
  deepDive: {
    flowBreakerImpact: string;
    professionalImageImpact: string;
    highPaceChallenge: string;
    copingMechanismText: string;
    copingMechanismNone: boolean;
  };
  epiphany: {
    overallValueProposition: string;
    ranking: { [key: string]: string };
    finalFeedbackText: string;
  };
  metrics: TypingMetrics;
}

export interface ExerciseData {
  exerciseNumber: number;
  text: string;
  userInput: string;
  timeSpent: number;
  errors: ErrorDetail[];
  deletions: number;
  corrections: number;
  languageSwitches: number;
  metrics: TypingMetrics;
  cheatingDetected: boolean;
}

export interface TypingMetrics {
  totalErrors: number;
  languageErrors: number;
  punctuationErrors: number;
  deletions: number;
  corrections: number;
  languageSwitches: number;
  averageDelay: number;
  frustrationScore: number;
  totalMistakesMade: number;
  finalErrors: number;
  accuracy: number;
  wpm: number;
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