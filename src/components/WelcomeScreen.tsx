import React from 'react';

interface Props {
  onNext: () => void;
  onAdminClick: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onNext, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-3xl w-full">
        <div className="relative z-10">
          <div 
            onClick={onAdminClick}
            className="mb-8 text-center cursor-pointer select-none"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Is Your Keyboard Helping You Work, or Working Against You?
            </h1>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border text-center mb-8">
             <p className="text-gray-700">
                We're developing a new solution for professional multilingual typists, and we need your help.
                <br/><br/>
                This short survey (1-3 minutes) will help us uncover the hidden challenges of typing in multiple languages—those small moments of frustration, lost focus, and wasted time that we've become so used to, we've stopped noticing them.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-1">What's in it for you?</h3>
                <p className="text-gray-600 text-sm">
                    • <span className="font-semibold">A Significant Discount:</span> Get 15% OFF for the survey, plus an additional 10% OFF for leaving your email (Total 25% OFF).
                    <br/>
                    • <span className="font-semibold">Make an Impact:</span> Your answers will directly shape the core features of our product.
                </p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-2xl p-5 border border-orange-200">
                <h3 className="font-bold text-gray-800 mb-1">Optional: Typing Challenge</h3>
                <p className="text-gray-600 text-sm">
                    Want to see the problem in black and white? Our 3-minute test analyzes your true multilingual WPM, accuracy, time wasted on corrections, and frustration level.
                </p>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-lg sm:text-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Start Survey →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;