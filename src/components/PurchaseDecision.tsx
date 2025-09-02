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
        // Replace the second option
        current[1] = option;
      }
      
      return { ...prev, whereToBuy: current };
    });
  };

  const handleSubmit = () => {
    const allPrioritiesSet = Object.values(priorities).every(p => p > 0);
    if (allPrioritiesSet && purchase.whereToBuy.length > 0 && purchase.priceRange) {
      // Create the complete purchaseDecision object
      const purchaseDecisionData = {
        purchaseDecision: {
          priorities: priorities,
          whereToBuy: purchase.whereToBuy,
          priceRange: purchase.priceRange,
          otherProblem: otherProblem
        }
      };
      
      console.log('Submitting purchase decision:', purchaseDecisionData);
      onNext(purchaseDecisionData);
    }
  };

  const isAllPrioritiesSet = Object.values(priorities).every(p => p > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Purchase Decision</h2>
        
        <div className="space-y-8">
          {/* Priority Ranking */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Rank by importance (1=most important, 5=least important):
            </h3>
            <p className="text-sm text-gray-600 mb-4">Each number can only be used once</p>
            <div className="space-y-3">
              {priorityOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-4">
                  <select
                    value={priorities[option.id] || ''}
                    onChange={(e) => handlePriorityChange(option.id, parseInt(e.target.value))}
                    className="w-16 p-2 border rounded-lg text-center font-semibold"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <span className="text-gray-700 flex-1">{option.label}</span>
                </div>
              ))}
            </div>
            {!isAllPrioritiesSet && (
              <p className="text-sm text-orange-600 mt-2">Please rank all items</p>
            )}
          </div>

          {/* Where to Buy - Max 2 selections */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Where would you purchase?</h3>
            <p className="text-sm text-gray-600 mb-4">Select up to 2 options (1st choice and alternative)</p>
            <div className="grid grid-cols-2 gap-3">
              {purchaseOptions.map((option, index) => {
                const optionIndex = purchase.whereToBuy.indexOf(option);
                const isSelected = optionIndex > -1;
                const isPrimary = optionIndex === 0;
                
                return (
                  <button
                    key={option}
                    onClick={() => togglePurchaseOption(option)}
                    className={`p-3 rounded-lg transition text-left relative ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-2 text-xs font-bold bg-white text-blue-600 px-2 py-1 rounded">
                        {isPrimary ? '1st' : '2nd'}
                      </span>
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
            {purchase.whereToBuy.length === 0 && (
              <p className="text-sm text-orange-600 mt-2">Please select at least one option</p>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How much would you pay?</h3>
            <div className="grid grid-cols-2 gap-3">
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
                  className={`p-3 rounded-lg transition ${
                    purchase.priceRange === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {!purchase.priceRange && (
              <p className="text-sm text-orange-600 mt-2">Please select a price range</p>
            )}
          </div>

          {/* Open Feedback - Optional */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Help us understand your needs better (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Is there anything else about multilingual typing that frustrates you?
              Share any challenges we haven't covered - your input helps us build better solutions.
            </p>
            <textarea
              value={otherProblem}
              onChange={(e) => setOtherProblem(e.target.value.slice(0, 500))}
              placeholder="For example: specific software issues, physical discomfort, workflow interruptions..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {otherProblem.length}/500 characters
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!purchase.whereToBuy.length || !purchase.priceRange || !isAllPrioritiesSet}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDecision;