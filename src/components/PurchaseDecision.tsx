import React, { useState, useMemo } from 'react';

interface Props {
  onNext: (data: any) => void;
}

const PurchaseDecision: React.FC<Props> = ({ onNext }) => {
  const [answers, setAnswers] = useState({
    overallValueProposition: '',
    ranking: { '1': '', '2': '', '3': '' },
    finalFeedbackText: '',
  });

  const handleOptionChange = (field: keyof typeof answers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRankingChange = (rank: '1' | '2' | '3', value: string) => {
      setAnswers(prev => ({
          ...prev,
          ranking: { ...prev.ranking, [rank]: value },
      }));
  };

  const isFormValid = answers.overallValueProposition && answers.ranking['1'] && answers.ranking['2'] && answers.ranking['3'] && answers.finalFeedbackText.length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
        onNext({ epiphany: answers });
    }
  };

  const benefits = [
    { id: 'productivity', icon: '🚀', title: 'Productivity Boost', description: 'Save time and get more done.' },
    { id: 'focus', icon: '🧠', title: 'Uninterrupted Flow', description: 'Stay focused without losing your train of thought.' },
    { id: 'control', icon: '😌', title: 'Effortless Control', description: 'Feel in command of your keyboard, not fighting it.' },
    { id: 'communication', icon: '💬', title: 'Clearer Communication', description: 'Reduce errors and communicate more professionally.' },
  ];
  
  const rankingOptions = useMemo(() => [
        { id: 'mechanical', label: 'Mechanical Keyboard' },
        { id: 'physical_switch', label: 'Dedicated Physical Language Switch' },
        { id: 'auto_detection', label: 'Automatic Language Detection' },
        { id: 'dynamic_lighting', label: 'Dynamic Backlighting' },
        { id: 'wireless', label: 'Stable Wireless Connectivity' },
        { id: 'mic', label: 'High-Quality Built-in Mic w/ Dictation button' },
        { id: 'wrist_rest', label: 'Ergonomic Wrist Rest' },
        { id: 'programmable_keys', label: 'Programmable Keys' },
        { id: 'rotary_knob', label: 'Rotary Knob' },
        { id: 'visual_display', label: 'On-Keyboard Visual Display' },
  ], []);

  const getAvailableOptions = (exclude: string[]) => rankingOptions.filter(opt => !exclude.includes(opt.id));
  
  const rank1Options = getAvailableOptions([answers.ranking['2'], answers.ranking['3']]);
  const rank2Options = getAvailableOptions([answers.ranking['1'], answers.ranking['3']]);
  const rank3Options = getAvailableOptions([answers.ranking['1'], answers.ranking['2']]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">💡 The Ideal Solution</h2>
            <p className="text-lg text-gray-600">Let's define what the perfect keyboard looks like for you.</p>
        </div>
        
        <div className="space-y-8">
            {/* Question 3.1 */}
            <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">What's the SINGLE greatest benefit?</h3>
                <p className="text-gray-600 mb-4">Imagine a 'smart' keyboard that solves all your language-switching issues. What would be the biggest win for you?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map(benefit => (
                        <button 
                            key={benefit.id}
                            onClick={() => handleOptionChange('overallValueProposition', benefit.id)} 
                            className={`p-4 rounded-lg text-left transition-all transform hover:scale-105 border-2 ${answers.overallValueProposition === benefit.id ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-white hover:bg-blue-50 border-gray-200'}`}
                        >
                            <div className="flex items-center">
                                <span className="text-3xl mr-4">{benefit.icon}</span>
                                <div>
                                    <div className="font-bold text-lg">{benefit.title}</div>
                                    <p className={`text-sm ${answers.overallValueProposition === benefit.id ? 'text-blue-100' : 'text-gray-600'}`}>{benefit.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Question 3.2 */}
            <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Which solutions sound most appealing?</h3>
                <p className="text-gray-600 mb-4">To help us build the right features, please rank your top 3.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Rank 1 (Most Important)</label>
                        <select value={answers.ranking['1']} onChange={(e) => handleRankingChange('1', e.target.value)} className="w-full p-3 border-gray-300 rounded-md shadow-sm text-base">
                            <option value="">Select...</option>
                            {rank1Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Rank 2</label>
                         <select value={answers.ranking['2']} onChange={(e) => handleRankingChange('2', e.target.value)} className="w-full p-3 border-gray-300 rounded-md shadow-sm text-base">
                            <option value="">Select...</option>
                            {rank2Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Rank 3</label>
                         <select value={answers.ranking['3']} onChange={(e) => handleRankingChange('3', e.target.value)} className="w-full p-3 border-gray-300 rounded-md shadow-sm text-base">
                            <option value="">Select...</option>
                            {rank3Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Question 3.3 */}
            <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">This is your chance to make an impact.</h3>
                <p className="text-gray-600 mb-4">If you could change ONE thing about how your keyboard handles multiple languages, what would it be?</p>
                <textarea value={answers.finalFeedbackText} onChange={(e) => handleOptionChange('finalFeedbackText', e.target.value)} placeholder="Share your most important idea here..." className="w-full mt-2 p-3 border-2 border-gray-300 rounded-lg text-base" rows={4} />
            </div>
        </div>

        <button onClick={handleSubmit} disabled={!isFormValid} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isFormValid ? 'Complete Survey' : 'Please fill all fields to continue'}
        </button>
      </div>
    </div>
  );
};

export default PurchaseDecision;