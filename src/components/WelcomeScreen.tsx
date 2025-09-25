import React from 'react';

interface Props {
  onNext: () => void;
  onAdminClick: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onNext, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-3xl w-full relative">
        {/* Admin Click Icon */}
        <div 
            onClick={onAdminClick}
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 cursor-pointer p-2 z-20"
            title="Admin Access"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Is Your Keyboard Helping You Work, or Working Against You?
            </h1>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border text-center mb-8">
             <p className="text-gray-700 text-lg leading-relaxed">
                We're developing a new solution for professional multilingual typists, and we need your help.
                <br/><br/>
                This short survey (1-3 minutes) will help us uncover the hidden challenges of typing in multiple languages—those small moments of frustration, lost focus, and wasted time we've all become used to.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 flex items-start space-x-4">
                <div className="text-4xl">🎁</div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">What's in it for you?</h3>
                    <p className="text-gray-600 text-sm">
                        • <span className="font-semibold">A Significant Discount:</span> Get 15% OFF for the survey, plus an additional 10% OFF for leaving your email (Total 25% OFF).
                        <br/>
                        • <span className="font-semibold">Make an Impact:</span> Your answers will directly shape the core features of our product.
                    </p>
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-2xl p-6 border border-orange-200 flex items-start space-x-4">
                 <div className="text-4xl">⏱️</div>
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">Optional: Typing Challenge</h3>
                    <p className="text-gray-600 text-sm">
                        Want to see the problem in black and white? Our 3-minute test analyzes your true multilingual WPM, accuracy, time wasted on corrections, and frustration level.
                    </p>
                </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Start Survey →
          </button>
          
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>100% Anonymous</span>
            </div>
            <div className="flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                <span>1-3 Minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;