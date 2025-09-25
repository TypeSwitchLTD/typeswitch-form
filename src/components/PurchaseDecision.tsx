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

  const isFormValid = answers.overallValueProposition && answers.ranking['1'] && answers.ranking['2'] && answers.ranking['3'];

  const handleSubmit = () => {
    if (isFormValid) {
        onNext({ epiphany: answers });
    }
  };
  
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
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">💡 The Ideal Solution</h2>
        
        <div className="space-y-8">
            {/* Question 3.1 */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800">What's the single greatest benefit of a 'smart' keyboard that solves these issues?</h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button onClick={() => handleOptionChange('overallValueProposition', 'productivity')} className={`p-3 rounded-lg ${answers.overallValueProposition === 'productivity' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Saving time</button>
                    <button onClick={() => handleOptionChange('overallValueProposition', 'focus')} className={`p-3 rounded-lg ${answers.overallValueProposition === 'focus' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Staying focused</button>
                    <button onClick={() => handleOptionChange('overallValueProposition', 'peace_of_mind')} className={`p-3 rounded-lg ${answers.overallValueProposition === 'peace_of_mind' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Peace of mind</button>
                    <button onClick={() => handleOptionChange('overallValueProposition', 'professionalism')} className={`p-3 rounded-lg ${answers.overallValueProposition === 'professionalism' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Professional image</button>
                </div>
            </div>

            {/* Question 3.2 */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Which of the following solutions sounds most appealing? (Please rank your top 3)</h3>
                <div className="space-y-3 mt-2">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Most important (1st)</label>
                        <select value={answers.ranking['1']} onChange={(e) => handleRankingChange('1', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md">
                            <option value="">Select...</option>
                            {rank1Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">2nd choice</label>
                         <select value={answers.ranking['2']} onChange={(e) => handleRankingChange('2', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md">
                            <option value="">Select...</option>
                            {rank2Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">3rd choice</label>
                         <select value={answers.ranking['3']} onChange={(e) => handleRankingChange('3', e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-md">
                            <option value="">Select...</option>
                            {rank3Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Question 3.3 */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800">If you could change one thing about how your keyboard handles multiple languages, what would it be?</h3>
                <textarea value={answers.finalFeedbackText} onChange={(e) => handleOptionChange('finalFeedbackText', e.target.value)} placeholder="Your feedback here..." className="w-full mt-2 p-3 border-2 border-gray-300 rounded-lg" rows={3} />
            </div>
        </div>

        <button onClick={handleSubmit} disabled={!isFormValid} className="w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          Complete Survey
        </button>
      </div>
    </div>
  );
};

export default PurchaseDecision;