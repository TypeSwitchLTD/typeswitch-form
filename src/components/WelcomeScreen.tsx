import React, { useEffect, useState } from 'react';

interface Props {
  onNext: () => void;
  onAdminClick?: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onNext, onAdminClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
      setIsMobile(mobileCheck);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Desktop Required</h2>
          <p className="text-gray-600">
            This survey is designed for desktop computers to ensure accurate typing analysis. 
            Please visit this page from a laptop or PC.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              We need a physical keyboard to measure your typing patterns accurately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl text-center">
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to the TypeSwitch Keyboard Research Study
        </h1>
        
        <div className="space-y-3 text-base text-gray-700">
          <p>
            This questionnaire is designed for research purposes to develop 
            a revolutionary keyboard for multilingual users.
          </p>
          
          <p className="font-medium text-blue-600">
            Your honest feedback will help us create a keyboard that actually solves real typing problems!
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">What we'll measure in 1 exercise:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-0.5">⌨️</span>
                <span>Your typing speed and accuracy in multiple languages</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2 mt-0.5">⚠️</span>
                <span>Common mistakes when switching between languages</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 mt-0.5">😤</span>
                <span>Frustration points in current keyboard designs</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">⭐</span>
                <span>Features that matter most to you</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mt-4 border border-blue-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl mb-1">⏱️</div>
                <p className="font-semibold text-gray-800">5-7 minutes</p>
                <p className="text-xs text-gray-600">Quick & Easy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎁</div>
                <p className="font-semibold text-gray-800">Up to 25% OFF</p>
                <p className="text-xs text-gray-600">15% + 10% with email</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-800 font-medium flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% Anonymous - Your data is used only for product development
            </p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-10 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
        >
          Start Survey →
        </button>

        <div className="mt-4 flex justify-center items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {onAdminClick && (
        <button
          onClick={onAdminClick}
          className="fixed bottom-4 right-4 w-10 h-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition shadow-lg z-50 select-none"
          title="Admin Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WelcomeScreen;
