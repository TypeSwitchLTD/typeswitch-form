import React, { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
}

const PurchaseDecision: React.FC<Props> = ({ onNext }) => {
  const [priorities, setPriorities] = useState({
    savingTime: 0,
    reducingErrors: 0,
    lessFrustration: 0,
    lookProfessional: 0,
    typingSpeed: 0
  });
  
  const [purchase, setPurchase] = useState({
    whereToBuy: [] as string[],
    priceRange: ''
  });
  
  const [otherProblem, setOtherProblem] = useState('');

  const priorityOptions = [
    { id: 'savingTime', label: 'Saving 10+ minutes per day' },
    { id: 'reducingErrors', label: 'Reducing errors by 50%' },
    { id: 'lessFrustration', label: 'Less frustration' },
    { id: 'lookProfessional', label: 'Looking professional' },
    { id: 'typingSpeed', label: 'Typing speed' }
  ];

  const purchaseOptions = [
    'Manufacturer website',
    'Online marketplaces (Amazon/eBay)',
    'Physical store',
    'Large electronics store',
    'Other'
  ];

  const handlePriorityChange = (id: string, value: number) => {
    const currentValue = priorities[id];
    const isValueUsed = Object.entries(priorities).some(
      ([key, val]) => key !== id && val === value
    );
    
    if (isValueUsed) {
      const swapKey = Object.keys(priorities).find(
        key => key !== id && priorities[key] === value
      );
      if (swapKey) {
        setPriorities(prev => ({
          ...prev,
          [id]: value,
          [swapKey]: currentValue
        }));
      }
    } else {
      setPriorities(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const togglePurchaseOption = (option: string) => {
    setPurchase(prev => {
      const current = [...prev.whereToBuy];
      const index = current.indexOf(option);
      
      if (index > -1) {
        current.splice(index, 1);
      } else if (current.length < 2) {
        current.push(option);
      } else {
        current[1] = option;
      }
      
      return { ...prev, whereToBuy: current };
    });
  };

  const handleSubmit = () => {
    const allPrioritiesSet = Object.values(priorities).every(p => p > 0);
    if (allPrioritiesSet && purchase.whereToBuy.length > 0 && purchase.priceRange) {
      const purchaseDecisionData = {
        purchaseDecision: {
          priorities: priorities,
          whereToBuy: purchase.whereToBuy,
          priceRange: purchase.priceRange,
          otherProblem: otherProblem
        }
      };
      
      onNext(purchaseDecisionData);
    }
  };

  const isAllPrioritiesSet = Object.values(priorities).every(p => p > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">Purchase Decision</h2>
        
        <div className="space-y-4">
          {/* Priority Ranking */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Rank by importance (1=most, 5=least):
            </h3>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <select
                    value={priorities[option.id] || ''}
                    onChange={(e) => handlePriorityChange(option.id, parseInt(e.target.value))}
                    className="w-12 p-1 border rounded text-center text-sm font-semibold"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <span className="text-gray-700 flex-1 text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Where to Buy */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Where would you purchase?</h3>
            <p className="text-xs text-gray-600 mb-2">Select up to 2 options</p>
            <div className="grid grid-cols-2 gap-2">
              {purchaseOptions.map((option) => {
                const optionIndex = purchase.whereToBuy.indexOf(option);
                const isSelected = optionIndex > -1;
                const isPrimary = optionIndex === 0;
                
                return (
                  <button
                    key={option}
                    onClick={() => togglePurchaseOption(option)}
                    className={`p-2 rounded-lg transition text-left relative text-xs ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-0.5 right-1 text-xs font-bold bg-white text-blue-600 px-1 rounded">
                        {isPrimary ? '1st' : '2nd'}
                      </span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">How much would you pay?</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                'Up to $80',
                '$80-120',
                '$120-150',
                '$150-200',
                'Over $200'
              ].map(option => (
                <button
                  key={option}
                  onClick={() => setPurchase({...purchase, priceRange: option})}
                  className={`p-2 rounded-lg transition text-xs ${
                    purchase.priceRange === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Open Feedback */}
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Help us understand (Optional)
            </h3>
            <textarea
              value={otherProblem}
              onChange={(e) => setOtherProblem(e.target.value.slice(0, 500))}
              placeholder="Any other frustrations with multilingual typing..."
              className="w-full p-2 border-2 border-gray-300 rounded-lg text-xs focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-0.5">
              {otherProblem.length}/500
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!purchase.whereToBuy.length || !purchase.priceRange || !isAllPrioritiesSet}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDecision;
