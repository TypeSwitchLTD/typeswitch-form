import React, { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
}

const DemographicsScreen: React.FC<Props> = ({ onNext }) => {
  const [demographics, setDemographics] = useState({
    languages: [] as string[],
    hoursTyping: '',
    occupation: '',
    keyboardType: '',
    keyboardTypeOther: '',
    currentKeyboard: '',
    age: '',
    diagnosis: ''
  });

  const languageOptions = [
    'Arabic-English',
    'French-English',
    'Hebrew-English',
    'Hindi-English',
    'Japanese-English',
    'Korean-English',
    'Russian-English'
  ];

  const keyboardTypes = [
    { value: 'mechanical', label: 'Mechanical (Cherry MX, gaming keyboards)' },
    { value: 'ergonomic', label: 'Ergonomic (Split layout, curved design)' },
    { value: 'wireless', label: 'Wireless/Bluetooth (Portable, no cables)' },
    { value: 'membrane', label: 'Membrane (Standard office keyboards)' },
    { value: 'laptop', label: 'Laptop/Built-in (Came with computer)' }
  ];

  const handleSubmit = () => {
    // Check all required fields
    if (demographics.languages.length > 0 && 
        demographics.hoursTyping && 
        demographics.occupation && 
        demographics.currentKeyboard &&
        demographics.age &&
        demographics.keyboardType) {
      onNext({ demographics });
    }
  };

  const selectLanguage = (lang: string) => {
    setDemographics(prev => ({
      ...prev,
      languages: [lang]
    }));
  };

  // Check if all required fields are filled
  const isFormValid = demographics.languages.length > 0 && 
                     demographics.hoursTyping && 
                     demographics.occupation && 
                     demographics.currentKeyboard &&
                     demographics.age &&
                     (demographics.keyboardType && (demographics.keyboardType !== 'other' || demographics.keyboardTypeOther));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Initial Setup</h2>
        
        <div className="space-y-6">
          {/* Languages - Single Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Which language pair do you type in? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  onClick={() => selectLanguage(lang)}
                  className={`p-3 rounded-lg transition text-left ${
                    demographics.languages[0] === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {!demographics.languages.length && (
              <p className="text-sm text-red-500 mt-1">Please select a language pair</p>
            )}
          </div>

          {/* Hours typing */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              How many hours per day do you type? <span className="text-red-500">*</span>
            </label>
            <select
              value={demographics.hoursTyping}
              onChange={(e) => setDemographics({...demographics, hoursTyping: e.target.value})}
              className="w-full p-3 border rounded-lg text-lg"
            >
              <option value="">Select...</option>
              <option value="less-1">Less than 1 hour</option>
              <option value="1-3">1-3 hours</option>
              <option value="3-5">3-5 hours</option>
              <option value="5-8">5-8 hours</option>
              <option value="8+">8+ hours</option>
            </select>
            {!demographics.hoursTyping && (
              <p className="text-sm text-red-500 mt-1">Please select typing hours</p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Field of work? <span className="text-red-500">*</span>
            </label>
            <select
              value={demographics.occupation}
              onChange={(e) => setDemographics({...demographics, occupation: e.target.value})}
              className="w-full p-3 border rounded-lg text-lg"
            >
              <option value="">Select...</option>
              <option value="student">Student</option>
              <option value="tech">Tech / Programming</option>
              <option value="sales">Sales</option>
              <option value="purchasing">Purchasing</option>
              <option value="translation">Translation</option>
              <option value="education">Education</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="other">Other</option>
            </select>
            {!demographics.occupation && (
              <p className="text-sm text-red-500 mt-1">Please select your occupation</p>
            )}
          </div>

          {/* Current Keyboard Type */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              What type of keyboard do you currently use? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {keyboardTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setDemographics({...demographics, currentKeyboard: type.value})}
                  className={`w-full p-3 rounded-lg transition text-left ${
                    demographics.currentKeyboard === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {!demographics.currentKeyboard && (
              <p className="text-sm text-red-500 mt-1">Please select your keyboard type</p>
            )}
          </div>

          {/* Keyboard layout */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Keyboard layout? <span className="text-red-500">*</span>
            </label>
            <select
              value={demographics.keyboardType}
              onChange={(e) => setDemographics({...demographics, keyboardType: e.target.value, keyboardTypeOther: ''})}
              className="w-full p-3 border rounded-lg text-lg"
            >
              <option value="">Select...</option>
              <option value="qwerty">QWERTY</option>
              <option value="azerty">AZERTY</option>
              <option value="other">Other</option>
            </select>
            
            {demographics.keyboardType === 'other' && (
              <input
                type="text"
                value={demographics.keyboardTypeOther}
                onChange={(e) => setDemographics({...demographics, keyboardTypeOther: e.target.value})}
                placeholder="Please specify your keyboard layout..."
                className="w-full mt-2 p-3 border rounded-lg text-lg"
              />
            )}
            {!demographics.keyboardType && (
              <p className="text-sm text-red-500 mt-1">Please select keyboard layout</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Age? <span className="text-red-500">*</span>
            </label>
            <select
              value={demographics.age}
              onChange={(e) => setDemographics({...demographics, age: e.target.value})}
              className="w-full p-3 border rounded-lg text-lg"
            >
              <option value="">Select...</option>
              <option value="under-18">Under 18</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46-55">46-55</option>
              <option value="55+">55+</option>
            </select>
            {!demographics.age && (
              <p className="text-sm text-red-500 mt-1">Please select your age group</p>
            )}
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Have you been diagnosed with:
            </label>
            <p className="text-sm text-gray-600 mb-3">
              (Optional but important for our research)
            </p>
            <select
              value={demographics.diagnosis}
              onChange={(e) => setDemographics({...demographics, diagnosis: e.target.value})}
              className="w-full p-3 border rounded-lg text-lg"
            >
              <option value="">Select...</option>
              <option value="adhd">ADHD</option>
              <option value="dyslexia">Dyslexia</option>
              <option value="other">Other learning disability</option>
              <option value="undiagnosed">Not diagnosed but suspect attention difficulties</option>
              <option value="none">None</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isFormValid ? 'Please fill all required fields' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemographicsScreen;