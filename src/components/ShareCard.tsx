import React, { useRef, useState } from 'react';
import { TypingMetrics } from '../types';

interface Props {
  metrics: TypingMetrics;
  onClose: () => void;
  selectedLanguage?: string;
}

const ShareCard: React.FC<Props> = ({ metrics, onClose, selectedLanguage = 'Hebrew-English' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStep, setShareStep] = useState<'initial' | 'generated'>('initial');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState('');


  const getWPMLevel = (wpm: number) => {
    if (wpm < 30) return 'Beginner Typist';
    if (wpm < 40) return 'Average Typist';
    if (wpm < 60) return 'Above Average Typist';
    if (wpm < 80) return 'Fast Typist';
    return 'Professional Typist';
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy < 85) return 'Needs Practice';
    if (accuracy < 92) return 'Good Accuracy';
    if (accuracy < 96) return 'Great Accuracy';
    return 'Excellent Accuracy';
  };

  // Language-specific share texts
  const shareTexts = {
    'Hebrew-English': {
      title: '🚀 עזרו לפתח את המקלדת הרב-לשונית הטובה בעולם!',
      line1: 'עשיתי את מבחן ההקלדה של TypeSwitch.',
      line2: 'התוצאות פתחו לי עיניים על כמה טעויות אני עושה ביום!',
      line3: 'מסתבר שהקלדתי {wpm} מילים בדקה עם {accuracy}% דיוק.',
      cta: '💡 בואו לבדוק את עצמכם ולעזור למחקר! כל תשובה עוזרת + 25% הנחה.',
      isRTL: true
    },
    'Russian-English': {
      title: '🚀 Помогите создать лучшую клавиатуру!',
      line1: 'Я прошёл тест TypeSwitch.',
      line2: 'Результаты просто шокировали!',
      line3: 'Оказывается, я печатаю {wpm} слов в минуту с точностью {accuracy}%.',
      cta: '💡 Проверьте себя и помогите исследованию! + 25% скидка.',
      isRTL: false
    },
    'Arabic-English': {
      title: '🚀 ساعدوا في تطوير أفضل لوحة مفاتيح!',
      line1: 'قمت بإجراء اختبار TypeSwitch.',
      line2: 'النتائج فتحت عيني على كمية الأخطاء التي أرتكبها يومياً!',
      line3: 'اتضح أنني أكتب {wpm} كلمة في الدقيقة بدقة {accuracy}%.',
      cta: '💡 اختبروا أنفسكم وساعدوا في البحث! كل إجابة تساعد + خصم 25%.',
      isRTL: true
    },
    // Adding other languages with placeholders for metrics
    'Hindi-English': {
      title: '🚀 बेहतरीन keyboard बनाने में मदद करें!',
      line1: 'मैंने TypeSwitch test किया।',
      line2: 'Results देखकर आंखें खुल गईं!',
      line3: 'पता चला कि मैं {wpm} शब्द प्रति मिनट {accuracy}% सटीकता के साथ टाइप करता हूं।',
      cta: '💡 खुद को परखें और रिसर्च में मदद करें! आपकी मदद + 25% छूट।',
      isRTL: false
    },
    'French-English': {
      title: '🚀 Aidez à développer le meilleur clavier!',
      line1: "J'ai fait le test TypeSwitch.",
      line2: 'Les résultats sont révélateurs!',
      line3: "Il s'avère que je tape {wpm} mots par minute avec une précision de {accuracy}%.",
      cta: '💡 Testez-vous et aidez la recherche ! Chaque réponse aide + 25% de réduction.',
      isRTL: false
    },
    'Japanese-English': {
      title: '🚀 最高のキーボード開発にご協力を！',
      line1: 'TypeSwitchテストを受けました。',
      line2: '結果を見て目が覚めました！',
      line3: 'なんと、私は毎分{wpm}語を{accuracy}%の精度で入力していました。',
      cta: '💡 あなたもテストして研究にご協力ください！ご協力で25%割引。',
      isRTL: false
    },
    'Korean-English': {
      title: '🚀 최고의 키보드 개발을 도와주세요!',
      line1: 'TypeSwitch 테스트를 해봤는데,',
      line2: '결과를 보고 깜짝 놀랐어요!',
      line3: '제가 분당 {wpm} 단어를 {accuracy}%의 정확도로 입력하고 있더라고요.',
      cta: '💡 여러분도 테스트해보고 연구에 도움을 주세요! 참여하고 25% 할인 받으세요.',
      isRTL: false
    }
  };

  const currentText = shareTexts[selectedLanguage] || shareTexts['Hebrew-English'];

  const generateImageWithCanvas = () => {
    setIsGenerating(true);
    
    // This function remains largely the same as you provided
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    canvas.width = 800;
    canvas.height = 1000;
    const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1000);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    roundRect(ctx, 40, 40, 720, 920, 20);
    ctx.fill();
    if (currentText.isRTL) {
      ctx.direction = 'rtl';
    }
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const titleLines = wrapText(ctx, currentText.title, 680);
    let yPos = 100;
    titleLines.forEach(line => {
      ctx.fillText(line, 400, yPos);
      yPos += 40;
    });
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#4B5563';

    // Use the text templates, replacing placeholders
    const line1 = currentText.line1;
    const line2 = currentText.line2;
    const line3WithMetrics = currentText.line3
        .replace('{wpm}', String(metrics.wpm))
        .replace('{accuracy}', String(metrics.accuracy));

    ctx.fillText(line1, 400, yPos + 30);
    ctx.fillText(line2, 400, yPos + 65);
    ctx.fillText(line3WithMetrics, 400, yPos + 100);

    yPos += 150;
    ctx.fillStyle = '#6B7280';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText('My Results', 400, yPos);
    yPos += 40;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    roundRect(ctx, 100, yPos, 280, 120, 15);
    ctx.fill();
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${metrics.wpm} WPM`, 240, yPos + 70);
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(getWPMLevel(metrics.wpm || 0), 240, yPos + 100);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    roundRect(ctx, 420, yPos, 280, 120, 15);
    ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${metrics.accuracy}%`, 560, yPos + 70);
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Accuracy', 560, yPos + 100);
    yPos += 150;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    roundRect(ctx, 100, yPos, 600, 80, 15);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Frustration Level:', 120, yPos + 35);
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = metrics.frustrationScore > 6 ? '#EF4444' : metrics.frustrationScore > 3 ? '#F59E0B' : '#22C55E';
    ctx.textAlign = 'right';
    ctx.fillText(`${metrics.frustrationScore}/10`, 680, yPos + 35);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    roundRect(ctx, 120, yPos + 45, 560, 20, 10);
    ctx.fill();
    const barColor = metrics.frustrationScore > 6 ? '#EF4444' : metrics.frustrationScore > 3 ? '#F59E0B' : '#22C55E';
    ctx.fillStyle = barColor;
    roundRect(ctx, 120, yPos + 45, (560 * metrics.frustrationScore) / 10, 20, 10);
    ctx.fill();
    yPos += 120;
    const stats = [
      { label: 'Mistakes', value: metrics.totalMistakesMade },
      { label: 'Corrected', value: metrics.corrections },
      { label: 'Lang Switches', value: metrics.languageSwitches }
    ];
    let xPos = 100;
    stats.forEach(stat => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, xPos, yPos, 200, 80, 10);
      ctx.fill();
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(stat.value), xPos + 100, yPos + 40);
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(stat.label, xPos + 100, yPos + 65);
      xPos += 220;
    });
    yPos += 120;
    
    // **NEW:** The CTA on the image itself now doesn't contain the discount, as it's in the post text
    const imageCta = currentText.cta.split('+')[0].trim();
    ctx.fillStyle = 'rgba(147, 51, 234, 0.1)';
    roundRect(ctx, 60, yPos, 680, 140, 20);
    ctx.fill();
    ctx.fillStyle = '#7C3AED';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(imageCta, 400, yPos + 50);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('typeswitch.io', 400, yPos + 95);
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Join 1000+ testers shaping the future of multilingual typing', 400, 950);

    setImageUrl(canvas.toDataURL('image/png'));
    setShareStep('generated');
    setIsGenerating(false);
  };
  
  // Helper functions wrapText and roundRect remain unchanged
  const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `typeswitch-results-${selectedLanguage}.png`;
    a.click();
  };

  // *** NEW: Function to build the post text ***
  const buildPostText = () => {
    const line3WithMetrics = currentText.line3
      .replace('{wpm}', String(metrics.wpm))
      .replace('{accuracy}', String(metrics.accuracy));

    return [
      currentText.line1,
      currentText.line2,
      line3WithMetrics,
      '', // For a new line
      currentText.cta,
      '',
      'Test yourself: https://typeswitch.io'
    ].join('\n');
  };

  // *** MAJOR CHANGE: Updated sharing logic ***
  const shareToSocial = async (platform: string) => {
    setCopySuccess(''); // Reset message
    const postText = buildPostText();
    const siteUrl = 'https://typeswitch.io';

    // Step 1: Copy the image to the clipboard
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopySuccess('✅ התמונה הועתקה! פשוט הדבק (Ctrl+V) אותה בפוסט.');
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      setCopySuccess('לא ניתן היה להעתיק את התמונה, תוכל להוריד ולצרף אותה ידנית.');
    }

    // Step 2: Open the social media platform with pre-filled text
    let url = '';
    const encodedText = encodeURIComponent(postText);
    const encodedUrl = encodeURIComponent(siteUrl);

    switch (platform) {
      case 'linkedin':
        // LinkedIn doesn't support pre-filled text via URL, so we rely on clipboard
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        // A trick to pre-fill LinkedIn is to have them copy-paste.
        // We'll copy the text for them for an easy paste.
        navigator.clipboard.writeText(postText);
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        // Facebook uses the 'quote' parameter for the text
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}`;
        break;
    }
    
    if (url) window.open(url, '_blank');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Share Your Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {shareStep === 'initial' && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Your results will include:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Your typing speed and accuracy
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Personalized message in your language ({selectedLanguage})
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  25% discount offer for your friends
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Beautiful shareable image with all the info
                </li>
              </ul>
            </div>

            <button
              onClick={generateImageWithCanvas}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your personalized image...
                </>
              ) : (
                <>📸 Generate Share Image in {selectedLanguage.split('-')[0]}</>
              )}
            </button>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                💡 The image will contain your message in {selectedLanguage.split('-')[0]} to reach your community!
              </p>
            </div>
          </>
        )}

        {shareStep === 'generated' && (
          <>
            <div className="mb-6 max-h-96 overflow-y-auto rounded-lg shadow-lg">
              <img src={imageUrl} alt="Your Results" className="w-full" />
            </div>
            
            {/* *** NEW: Success message for user *** */}
            {copySuccess && (
               <div className="mt-2 mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
                <p className="text-sm text-green-800 font-semibold">
                  {copySuccess}
                </p>
              </div>
            )}

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <button
                  onClick={() => shareToSocial('linkedin')}
                  className="bg-blue-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-900 transition"
                >
                  Share to LinkedIn
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="bg-sky-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-600 transition"
                >
                  Share to Twitter/X
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button
                  onClick={() => shareToSocial('facebook')}
                  className="bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition"
                >
                  Share to Facebook
                </button>
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Share to WhatsApp
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                  <button
                    onClick={downloadImage}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                   <button
                    onClick={() => {
                      setShareStep('initial');
                      setImageUrl('');
                      setCopySuccess('');
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    ← Back
                  </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareCard;
