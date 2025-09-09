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
      name: 'Volume Control Knob',
      description: 'Physical rotary knob for volume, scrolling, or other functions',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-5 max-w-3xl w-full">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Feature Evaluation</h2>
          <p className="text-sm text-gray-600">
            How important are these features to you in your ideal keyboard?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Rate each feature from 1 (not important) to 5 (critical)
          </p>
        </div>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {features.map(feature => (
            <div key={feature.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <span className="text-xl mr-2 mt-0.5">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">{feature.name}</div>
                    <div className="text-xs text-gray-600">{feature.description}</div>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRating(feature.id, rating)}
                      className={`w-8 h-8 rounded-full font-semibold text-xs transition transform hover:scale-110 ${
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
                <div className="text-xs text-orange-500 mt-1 ml-8">Please rate</div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">
            Select your TOP 2 must-have features:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map(feature => {
              const isSelected = topFeatures.includes(feature.id);
              const rank = topFeatures.indexOf(feature.id) + 1;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleTopFeature(feature.id)}
                  disabled={!isSelected && topFeatures.length >= 2}
                  className={`p-3 rounded-lg transition text-left relative text-sm ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1 right-1 bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                      #{rank}
                    </span>
                  )}
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{feature.icon}</span>
                    <div className="font-semibold text-xs">
                      {feature.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!hasTopFeatures && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Select {2 - topFeatures.length} more feature{topFeatures.length === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allRated || !hasTopFeatures}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
