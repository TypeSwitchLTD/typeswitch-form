import React, { useState } from 'react';

interface Props {
  discountCode: string;
  onShare: () => void;
  onEmailSubmit?: (email: string) => void;
  skippedTest?: boolean;
  onTryTest?: () => void;
}
 
const ThankYou: React.FC<Props> = ({ discountCode, onShare, onEmailSubmit, skippedTest = false, onTryTest }) => {
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
      onEmailSubmit?.(email);
      setEmailSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <div className="mb-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Thank You for Participating!</h1>
          <p className="text-lg text-gray-600">You've helped shape the future of multilingual keyboards.</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Your Exclusive Reward</h3>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-center mb-3">25% Early Bird Discount Code:</p>
            <div className="flex items-center justify-center space-x-3">
              <code className="bg-white text-gray-800 px-6 py-3 rounded-lg text-2xl font-mono font-bold">
                {discountCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="bg-white/30 hover:bg-white/40 text-white px-4 py-3 rounded-lg transition"
              >
                {copied ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-center text-sm mt-2 text-green-200">
                ✓ Code copied to clipboard!
              </p>
            )}
          </div>
        </div>

        {!skippedTest ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Show Off Your Typing Skills!</h3>
            <p className="text-gray-600 text-center mb-4">Challenge friends by sharing your results.</p>
            <button
              onClick={onShare}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition"
            >
              Share My Results
            </button>
          </div>
        ) :
          (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Want to Try the Typing Test?</h3>
            <p className="text-gray-600 text-center mb-4">See how you perform and get shareable results!</p>
            <button
              onClick={onTryTest}
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-yellow-700 transition"
            >
              Try the Test Now
            </button>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Get notified at launch?</h3>
          {!emailSubmitted ? (
            <div className="flex space-x-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!email || !email.includes('@')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Notify Me
              </button>
            </div>
          ) : (
            <div className="bg-green-100 text-green-700 rounded-lg p-4 max-w-md mx-auto text-center">
              <p>Perfect! We'll email you when TypeSwitch launches.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
