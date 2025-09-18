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
      console.log('Email submitted:', email);
      onEmailSubmit?.(email);
      setEmailSubmitted(true);
      alert('✅ Email saved! We\'ll notify you when TypeSwitch launches.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        {/* Success Animation */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Progress Complete */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              🎉 100% Complete!
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Thank You for Participating!
          </h1>
          <p className="text-lg text-gray-600 text-center">
            You've helped shape the future of multilingual keyboards
          </p>
        </div>

        {/* Discount Code Section */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" stroke
