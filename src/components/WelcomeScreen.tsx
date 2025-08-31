import React from 'react';

interface Props {
  onNext: () => void;
  onAdminClick?: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onNext, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to the TypeSwitch Keyboard Research Study
        </h1>
        
        <div className="space-y-4 text-lg text-gray-700">
          <p>
            This questionnaire is designed for research purposes to develop 
            a revolutionary keyboard for multilingual users.
          </p>
          
          <p className="font-medium text-blue-600">
            Your honest feedback will help us create a keyboard that actually solves real typing problems!
          </p>
          
          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">What we'll measure in 1 exercise:</h3>
            <ul className="space-y-2 text-base">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Your typing speed and accuracy in multiple languages</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Common mistakes when switching between languages</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Frustration points in current keyboard designs</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Features that matter most to you</span>
              </li>
            </ul>
          </div>
          
          {/* Time and Reward Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6 border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <p className="font-semibold text-gray-800">3-5 minutes</p>
                <p className="text-sm text-gray-600">Quick & Easy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎁</div>
                <p className="font-semibold text-gray-800">25% OFF</p>
                <p className="text-sm text-gray-600">Exclusive discount code</p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-gray-500 italic mt-4">
            Your data is anonymous and used only for product development
          </p>
        </div>

        <button
          onClick={onNext}
          className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
        >
          Start Survey →
        </button>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Admin button - hidden in corner */}
      {onAdminClick && (
        <button
          onClick={onAdminClick}
          className="fixed bottom-4 right-4 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition shadow-lg z-50 select-none"
          title="Admin Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WelcomeScreen;