import React, { useState } from 'react';

interface Props {
  discountCode: string;
  onShare: () => void;
  onEmailSubmit?: (email: string) => void;
}

const ThankYou: React.FC<Props> = ({ discountCode, onShare, onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleEmailSubmit = () => {
    if (email && email.includes('@')) {
      console.log('Email submitted:', email);
      onEmailSubmit?.(email);
      setEmailSubmitted(true);
      alert('✅ Email saved! We\'ll notify you when TypeSwitch launches.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full">
        {/* Success Animation */}
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="flex items-center justify-center mb-3">
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold text-sm">
              🎉 100% Complete!
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Thank You for Participating!
          </h1>
          <p className="text-base text-gray-600 text-center">
            You've helped shape the future of multilingual keyboards
          </p>
        </div>

        {/* Discount Code Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-5 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-center">15% Instant Discount for Completing the Survey!</h3>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <p className="text-center mb-2 text-sm">Your discount code:</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="bg-white text-gray-800 px-5 py-2 rounded-lg text-xl font-mono font-bold">
                {discountCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="bg-white/30 hover:bg-white/40 text-white px-3 py-2 rounded-lg transition"
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-center text-xs mt-2 text-green-200">
                ✔ Code copied!
              </p>
            )}
          </div>
          <p className="text-center text-xs mt-2 text-blue-100">
            Valid for the first 1000 customers at launch
          </p>
        </div>

        {/* Additional 10% Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4 border border-purple-200">
          <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">
            🎁 Want an additional 10% off? (Total 25% discount!)
          </h3>
          <p className="text-sm text-gray-600 text-center mb-3">
            Subscribe for updates and get 10% more off at launch
          </p>
          
          {!emailSubmitted ? (
            <div className="flex space-x-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!email || !email.includes('@')}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Get 10% More
              </button>
            </div>
          ) : (
            <div className="bg-green-100 text-green-700 rounded-lg p-3 max-w-md mx-auto text-center">
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-semibold">Perfect! You got an additional 10% off!</p>
              <p className="text-xs mt-1">Total 25% discount - we'll email you the full code</p>
            </div>
          )}
        </div>

        {/* Share Results Button */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">
            Show off your typing skills to friends!
          </h3>
          <button
            onClick={onShare}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-blue-700 transition transform hover:scale-105 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
            </svg>
            Share My Results
          </button>
        </div>

        {/* What's Next */}
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">What happens next?</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-base">📊</span>
              </div>
              <p className="text-xs text-gray-600">We analyze all responses</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-base">🔧</span>
              </div>
              <p className="text-xs text-gray-600">Build the features you voted for</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-base">🚀</span>
              </div>
              <p className="text-xs text-gray-600">Launch in Q2 2026</p>
            </div>
          </div>
        </div>

        {/* Website Link */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Want to learn more about TypeSwitch?</p>
          <a 
            href="https://typeswitch.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            Visit typeswitch.io →
          </a>
        </div>

        {/* Final Message */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          <p>Survey ID: {discountCode.replace('TYPE', 'SURV')}</p>
          <p className="mt-1">Completed: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">✅ Data saved to database</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
