// src/components/ThankYou.tsx

import React, { useState } from 'react';

interface Props {
  discountCode: string;
  onShare: () => void;
  onEmailSubmit: (email: string) => void;
  skippedTest?: boolean;
  onTryTest?: () => void;
  t: any; // Translation object (translations.thankYou)
}

const ThankYou: React.FC<Props> = ({ discountCode, onShare, onEmailSubmit, skippedTest = false, onTryTest, t }) => {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSubmit = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) return;
    onEmailSubmit(trimmed);
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.discountTitle}</h3>
          <p className="text-gray-700 mb-3">{t.discountDesc}</p>
          <div className="flex items-center justify-center gap-2">
            <code className="bg-white px-4 py-2 rounded-lg text-xl font-mono font-bold text-blue-600 border border-blue-200">
              {discountCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">{t.discountNote}</p>
        </div>

        {skippedTest && onTryTest ? (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.tryTestTitle}</h3>
            <p className="text-gray-600 mb-4">{t.tryTestDesc}</p>
            <button
              onClick={onTryTest}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
            >
              {t.tryTestButton}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.shareTitle}</h3>
            <p className="text-gray-600 mb-4">{t.shareDesc}</p>
            <button
              onClick={onShare}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition"
            >
              {t.shareButton}
            </button>
          </div>
        )}

        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.emailTitle}</h3>
          {emailSubmitted ? (
            <p className="text-green-600 font-semibold">{t.emailSuccess}</p>
          ) : (
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit(); }}
                placeholder="your@email.com"
                dir="ltr"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!isValidEmail(email.trim())}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {t.emailButton}
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">{t.nextTitle}</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start"><span className="text-blue-600 font-bold me-2">1.</span>{t.nextStep1}</li>
            <li className="flex items-start"><span className="text-blue-600 font-bold me-2">2.</span>{t.nextStep2}</li>
            <li className="flex items-start"><span className="text-blue-600 font-bold me-2">3.</span>{t.nextStep3}</li>
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t">
          <a href="https://typeswitch.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">typeswitch.io</a>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
