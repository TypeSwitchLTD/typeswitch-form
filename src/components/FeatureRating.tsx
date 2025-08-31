import React, { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
}

const FeatureRating: React.FC<Props> = ({ onNext }) => {
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [topFeatures, setTopFeatures] = useState<string[]>([]);

  const features = [
    { 
      id: 'mechanical', 
      name: 'Mechanical Keyboard',
      description: 'Tactile feedback, durable switches, satisfying click sound',
      icon: '⌨️'
    },
    { 
      id: 'rgbFull', 
      name: 'Full RGB Lighting',
      description: 'Customizable colors, effects, brightness for aesthetics',
      icon: '🌈'
    },
    { 
      id: 'physicalSwitch', 
      name: 'Physical Language Switch',
      description: 'Dedicated button to change languages instantly',
      icon: '🔄'
    },
    { 
      id: 'wireless', 
      name: 'Wireless Connectivity',
      description: 'Bluetooth or USB dongle, no cables, portable',
      icon: '📡'
    },
    { 
      id: 'dynamicLight', 
      name: 'Dynamic Language Lighting',
      description: 'Only active language keys light up, reduces confusion',
      icon: '💡'
    },
    { 
      id: 'modularKeys', 
      name: 'Replaceable Keys',
      description: 'Swap keys for different languages, repair, or customization',
      icon: '🔧'
    },
    { 
      id: 'wristRest', 
      name: 'Ergonomic Wrist Rest',
      description: 'Padded support for comfortable long typing sessions',
      icon: '🤲'
    },
    { 
      id: 'shortcuts', 
      name: 'Professional Shortcuts Area',
      description: 'Programmable keys for profession-specific functions',
      icon: '⚡'
    },
    { 
      id: 'volumeKnob', 
      name: 'Rotary Encoder Knob',
      description: 'Precision volume control, scrolling, or other functions',
      icon: '🎛️'
    }
  ];

  const handleRating = (featureId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [featureId]: rating }));
  };

  const toggleTopFeature = (featureId: string) => {
    setTopFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(f => f !== featureId);
      }
      if (prev.length < 2) {
        return [...prev, featureId];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    onNext({ featureRatings: { ratings, topFeatures } });
  };

  const allRated = Object.keys(ratings).length === features.length;
  const hasTopFeatures = topFeatures.length === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Feature Evaluation</h2>
          <p className="text-lg text-gray-600">
            How important are these features to you in your ideal keyboard?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Rate each feature from 1 (not important at all) to 5 (absolutely critical)
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {features.map(feature => (
            <div key={feature.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <span className="text-2xl mr-3 mt-1">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{feature.name}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                </div>
                <div className="flex space-x-1 ml-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRating(feature.id, rating)}
                      className={`w-12 h-12 rounded-full font-semibold transition transform hover:scale-110 ${
                        ratings[feature.id] === rating
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              {!ratings[feature.id] && (
                <div className="text-xs text-orange-500 mt-2 ml-11">Please rate this feature</div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Almost done! Select your TOP 2 must-have features:
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Which features would make you actually buy this keyboard?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map(feature => {
              const isSelected = topFeatures.includes(feature.id);
              const rank = topFeatures.indexOf(feature.id) + 1;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleTopFeature(feature.id)}
                  disabled={!isSelected && topFeatures.length >= 2}
                  className={`p-4 rounded-lg transition text-left relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      #{rank}
                    </span>
                  )}
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <div>
                      <div className="font-semibold">{feature.name}</div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {feature.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!hasTopFeatures && (
            <p className="text-sm text-orange-600 mt-3 text-center">
              Please select {2 - topFeatures.length} more feature{topFeatures.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allRated || !hasTopFeatures}
          className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {!allRated ? `Rate all features (${Object.keys(ratings).length}/${features.length})` :
           !hasTopFeatures ? 'Select your top 2 features' :
           'Continue to Final Questions'}
        </button>
      </div>
    </div>
  );
};

export default FeatureRating;