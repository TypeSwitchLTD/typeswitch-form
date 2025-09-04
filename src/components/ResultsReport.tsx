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

  const overallScore = calculateOverallScore(metrics);
  const scoreBreakdown = showBreakdown ? getScoreBreakdown(metrics) : null;
  
  // UPDATED: Using the new encouraging titles
  const getScoreLevel = (score: number) => {
    if (score >= 85) return { level: 'מצוין!', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { level: 'טוב', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 55) return { level: 'ממוצע', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { level: 'זקוק לחיזוק', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'יש לאן לצמוח', color: 'text-red-600', bg: 'bg-red-100' };
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

  // UPDATED: Using the new encouraging WPM titles
  const getWPMLevel = (wpm: number) => {
    if (wpm < 25) return { level: 'מתחיל/ה', color: 'text-red-600' };
    if (wpm < 35) return { level: 'יש בסיס טוב', color: 'text-orange-600' };
    if (wpm < 45) return { level: 'ממוצע', color: 'text-yellow-600' };
    if (wpm < 60) return { level: 'מעל הממוצע', color: 'text-green-600' };
    if (wpm < 80) return { level: 'מהיר/ה', color: 'text-green-700' };
    return { level: 'מקצוענ/ית', color: 'text-purple-600' };
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

          {/* Score Breakdown */}
          {showBreakdown && scoreBreakdown && scoreBreakdown.breakdown.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Score Deductions Breakdown</h3>
              <div className="space-y-3">
                {scoreBreakdown.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <div>
                      <span className="text-gray-700 font-medium">{item.category}</span>
                      <span className="text-gray-500 text-sm ml-2">({item.reason})</span>
                    </div>
                    <span className="text-red-600 font-bold text-lg">-{item.penalty} points</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center"><span className="text-gray-800 font-semibold">Starting Score:</span><span className="text-gray-800 font-bold text-lg">100</span></div>
                  <div className="flex justify-between items-center text-red-600"><span className="font-semibold">Total Deductions:</span><span className="font-bold text-lg">-{scoreBreakdown.totalPenalty}</span></div>
                  <div className="flex justify-between items-center text-blue-600 mt-2 pt-2 border-t"><span className="font-semibold">Final Score:</span><span className="font-bold text-xl">{scoreBreakdown.finalScore}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Main Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Typing Speed</h3>
              <p className={`text-4xl font-bold ${wpmLevel.color}`}>{metrics.wpm || 0}</p>
              <p className="text-sm text-gray-600">Words Per Minute</p>
              <p className={`text-xs mt-1 ${wpmLevel.color}`}>{wpmLevel.level}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Final Accuracy</h3>
              <p className={`text-4xl font-bold ${getColorClass(metrics.accuracy || 0, averages.accuracy, true)}`}>{metrics.accuracy || 0}%</p>
              <p className="text-sm text-gray-600">After all corrections</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-700 mb-2">Frustration Level</h3>
              <p className={`text-4xl font-bold ${getColorClass(metrics.frustrationScore, averages.frustrationScore)}`}>{metrics.frustrationScore}/10</p>
              <p className="text-sm text-gray-600">{metrics.frustrationScore <= 2 ? 'Very Calm' : metrics.frustrationScore <= 4 ? 'Normal' : metrics.frustrationScore <= 6 ? 'Frustrated' : metrics.frustrationScore <= 8 ? 'Very Frustrated' : 'Extremely Frustrated'}</p>
            </div>
          </div>

          {/* Detailed Breakdown & Other sections remain the same... */}
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center mt-6">
            <h3 className="text-xl font-semibold mb-2">Ready to Continue?</h3>
            <p className="mb-4">Complete the survey to get your exclusive 25% discount code!</p>
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
