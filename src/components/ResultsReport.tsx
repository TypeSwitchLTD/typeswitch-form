import React from 'react';
import { TypingMetrics } from '../types';
import { calculateOverallScore, getScoreBreakdown } from '../App';

interface Props {
  metrics: TypingMetrics;
  onNext: () => void;
  onShare: () => void;
  showBreakdown?: boolean;
}

const ResultsReport: React.FC<Props> = ({ metrics, onNext, onShare, showBreakdown = true }) => {
  const averages = {
    totalMistakesMade: 45,
    finalErrors: 10,
    corrections: 25,
    languageErrors: 8,
    punctuationErrors: 5,
    deletions: 12,
    languageSwitches: 6,
    frustrationScore: 5,
    wpm: 40,
    accuracy: 92
  };

  // Use centralized scoring function - FIXED TO USE APP'S FUNCTION
  const overallScore = calculateOverallScore(metrics);
  const scoreBreakdown = showBreakdown ? getScoreBreakdown(metrics) : null;
  
  const getScoreLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent!', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 55) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { level: 'Needs Improvement', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Poor - Significant Issues', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const scoreLevel = getScoreLevel(overallScore);

  const getColorClass = (value: number, average: number, inverse = false) => {
    if (inverse) {
      if (value > average * 1.2) return 'text-green-600';
      if (value < average * 0.8) return 'text-red-600';
      return 'text-yellow-600';
    }
    if (value < average * 0.7) return 'text-green-600';
    if (value > average * 1.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getWPMLevel = (wpm: number) => {
    if (wpm < 25) return { level: 'Very Slow', color: 'text-red-600' };
    if (wpm < 35) return { level: 'Below Average', color: 'text-orange-600' };
    if (wpm < 45) return { level: 'Average', color: 'text-yellow-600' };
    if (wpm < 60) return { level: 'Above Average', color: 'text-green-600' };
    if (wpm < 80) return { level: 'Fast', color: 'text-green-700' };
    return { level: 'Professional', color: 'text-purple-600' };
  };

  const wpmLevel = getWPMLevel(metrics.wpm || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Your Typing Analysis</h2>
        <p className="text-gray-600 text-center mb-6">Here's how you really performed</p>
        
        <div className="space-y-6">
          {/* Overall Score Card */}
          <div className={`${scoreLevel.bg} rounded-xl p-6 text-center`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Performance Score</h3>
            <div className={`text-6xl font-bold ${scoreLevel.color} mb-2`}>
              {overallScore}/100
            </div>
            <p className={`text-lg font-semibold ${scoreLevel.color}`}>{scoreLevel.level}</p>
            {overallScore < 55 && (
              <p className="text-sm text-gray-600 mt-2">
                Multilingual typing is challenging - our keyboard can help!
              </p>
            )}
          </div>

          {/* Score Breakdown - Only shown when not sharing */}
          {showBreakdown && scoreBreakdown && scoreBreakdown.breakdown.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                Score Deductions Breakdown
              </h3>
              
              <div className="space-y-3">
                {scoreBreakdown.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">{item.category}</span>
                      <span className="text-gray-500 text-sm ml-2">({item.reason})</span>
                    </div>
                    <span className="text-red-600 font-bold text-lg">
                      -{item.penalty} points
                    </span>
                  </div>
                ))}
                
                <div className="mt-4 pt-3 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Starting Score:</span>
                    <span className="text-gray-800 font-bold text-lg">100</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-semibold">Total Deductions:</span>
                    <span className="font-bold text-lg">-{scoreBreakdown.totalPenalty}</span>
                  </div>
                  <div className="flex justify-between items-center text-blue-600 mt-2 pt-2 border-t">
                    <span className="font-semibold">Final Score:</span>
                    <span className="font-bold text-xl">{scoreBreakdown.finalScore}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 This breakdown won't appear when you share your results
                </p>
              </div>
            </div>
          )}

          {/* Main Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Typing Speed</h3>
              <p className={`text-4xl font-bold ${wpmLevel.color}`}>
                {metrics.wpm || 0}
              </p>
              <p className="text-sm text-gray-600">Words Per Minute</p>
              <p className={`text-xs mt-1 ${wpmLevel.color}`}>{wpmLevel.level}</p>
              <div className="mt-3 text-xs text-gray-500">
                Average: {averages.wpm} WPM
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Final Accuracy</h3>
              <p className={`text-4xl font-bold ${getColorClass(metrics.accuracy || 0, averages.accuracy, true)}`}>
                {metrics.accuracy || 0}%
              </p>
              <p className="text-sm text-gray-600">After all corrections</p>
              <div className="mt-3 text-xs text-gray-500">
                {metrics.accuracy === 100 && metrics.totalMistakesMade > 0 && (
                  <span className="text-green-600 font-semibold">
                    You fixed all {metrics.corrections} mistakes
                  </span>
                )}
                {metrics.accuracy === 100 && metrics.totalMistakesMade === 0 && (
                  <span className="text-green-600 font-semibold">
                    Perfect typing!
                  </span>
                )}
                {metrics.accuracy < 100 && (
                  <span>Average: {averages.accuracy}%</span>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Frustration Level</h3>
              <p className={`text-4xl font-bold ${getColorClass(metrics.frustrationScore, averages.frustrationScore)}`}>
                {metrics.frustrationScore}/10
              </p>
              <p className="text-sm text-gray-600">
                {metrics.frustrationScore <= 2 ? 'Very Calm' :
                 metrics.frustrationScore <= 4 ? 'Normal' :
                 metrics.frustrationScore <= 6 ? 'Frustrated' :
                 metrics.frustrationScore <= 8 ? 'Very Frustrated' : 'Extremely Frustrated'}
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Average: {averages.frustrationScore}/10
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Errors Journey */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Error Journey
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Total mistakes made:</span>
                  <span className={`font-bold text-xl ${getColorClass(metrics.totalMistakesMade, averages.totalMistakesMade)}`}>
                    {metrics.totalMistakesMade}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Successfully corrected:</span>
                  <span className="font-bold text-xl text-green-600">
                    {metrics.corrections}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Uncorrected errors:</span>
                  <span className={`font-bold text-xl ${getColorClass(metrics.finalErrors, averages.finalErrors)}`}>
                    {metrics.finalErrors}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Types Analysis */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Error Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Language errors:</span>
                  <span className={`font-bold text-xl ${getColorClass(metrics.languageErrors, averages.languageErrors)}`}>
                    {metrics.languageErrors}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-700">Punctuation errors:</span>
                  <span className={`font-bold text-xl ${getColorClass(metrics.punctuationErrors, averages.punctuationErrors)}`}>
                    {metrics.punctuationErrors}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total deletions:</span>
                  <span className={`font-bold text-xl ${getColorClass(metrics.deletions, averages.deletions)}`}>
                    {metrics.deletions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Areas */}
          {overallScore < 70 && (
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Issues Detected
              </h3>
              <ul className="space-y-2 text-gray-700">
                {metrics.wpm < 35 && (
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Very slow typing speed - you're searching for keys
                  </li>
                )}
                {metrics.accuracy < 85 && (
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Low accuracy - too many uncorrected errors
                  </li>
                )}
                {metrics.languageErrors > averages.languageErrors && (
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Language confusion is your biggest challenge
                  </li>
                )}
                {metrics.frustrationScore > 6 && (
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    High frustration level affecting performance
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Solutions */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How TypeSwitch Can Help
            </h3>
            <ul className="space-y-2 text-gray-700">
              {metrics.languageErrors > 5 && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Shows only active language keys - eliminates confusion
                </li>
              )}
              {metrics.languageSwitches > 5 && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Physical language switch - no more Alt+Shift errors
                </li>
              )}
              {metrics.punctuationErrors > 3 && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Clear punctuation marking for each language
                </li>
              )}
              {metrics.frustrationScore > 4 && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Reduces cognitive load and typing frustration
                </li>
              )}
            </ul>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Continue?</h3>
            <p className="mb-4">
              Complete the survey to get your exclusive 25% discount code!
            </p>
            <button
              onClick={onNext}
              className="bg-white text-blue-600 py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              Continue to Feature Evaluation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsReport;