import React, { useRef, useState } from 'react';
import { TypingMetrics } from '../types';

interface Props {
  metrics: TypingMetrics;
  onClose: () => void;
  selectedLanguage?: string;
}

// NOTE: I've moved the scoring logic directly into this file.
// This makes the component self-contained and avoids issues with imports.
const calculateOverallScore = (metrics: TypingMetrics): number => {
  let score = 100;
  
  if (metrics.wpm < 20) score -= 30;
  else if (metrics.wpm < 30) score -= 25;
  else if (metrics.wpm < 40) score -= 18;
  else if (metrics.wpm < 50) score -= 10;
  else if (metrics.wpm < 60) score -= 5;
  
  if (metrics.accuracy < 70) score -= 30;
  else if (metrics.accuracy < 80) score -= 25;
  else if (metrics.accuracy < 85) score -= 20;
  else if (metrics.accuracy < 90) score -= 15;
  else if (metrics.accuracy < 95) score -= 10;
  else if (metrics.accuracy < 98) score -= 5;
  
  if (metrics.languageSwitches > 20) score -= 15;
  else if (metrics.languageSwitches > 15) score -= 12;
  else if (metrics.languageSwitches > 10) score -= 8;
  else if (metrics.languageSwitches > 5) score -= 4;
  
  if (metrics.totalMistakesMade > 80) score -= 15;
  else if (metrics.totalMistakesMade > 60) score -= 12;
  else if (metrics.totalMistakesMade > 40) score -= 8;
  else if (metrics.totalMistakesMade > 20) score -= 4;
  
  if (metrics.frustrationScore > 8) score -= 15;
  else if (metrics.frustrationScore > 6) score -= 12;
  else if (metrics.frustrationScore > 4) score -= 8;
  else if (metrics.frustrationScore > 2) score -= 4;
  
  return Math.max(1, Math.round(score));
};


const ShareCard: React.FC<Props> = ({ metrics, onClose, selectedLanguage = 'Hebrew-English' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStep, setShareStep] = useState<'initial' | 'generated'>('initial');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState('');

  // Calculate the final score using the logic from App.tsx
  const finalScore = calculateOverallScore(metrics);

  const shareTexts = {
    'Hebrew-English': {
      postLine1: 'עשיתי את מבחן ההקלדה של TypeSwitch.',
      postLine2: 'מסתבר שרמת ההקלדה שלי היא "{scoreLevel}" עם ציון כללי של {finalScore}/100.',
      postCta: '💡 בואו לבדוק את עצמכם ולעזור למחקר! כל תשובה עוזרת + 25% הנחה.',
      copyMessage: '✅ הטקסט הועתק! פשוט הדבק (Ctrl+V) אותו בפוסט.',
      isRTL: true
    },
    'Russian-English': {
      postLine1: 'Я прошёл тест на скорость печати от TypeSwitch.',
      postLine2: 'Оказывается, мой уровень — "{scoreLevel}" с общим баллом {finalScore}/100.',
      postCta: '💡 Проверьте себя и помогите исследованию! + 25% скидка.',
      copyMessage: '✅ Текст скопирован! Просто вставьте (Ctrl+V) его в пост.',
      isRTL: false
    },
    'Arabic-English': {
      postLine1: 'لقد أجريت اختبار الكتابة من TypeSwitch.',
      postLine2: 'اتضح أن مستواي هو "{scoreLevel}" بنتيجة إجمالية {finalScore}/100.',
      postCta: '💡 اختبروا أنفسكم وساعدوا في البحث! كل إجابة تساعد + خصم 25%.',
      copyMessage: '✅ تم نسخ النص! فقط قم بلصقه (Ctrl+V) في المنشور.',
      isRTL: true
    },
    'Hindi-English': {
      postLine1: 'मैंने TypeSwitch टाइपिंग टेस्ट दिया।',
      postLine2: 'पता चला कि मेरा स्तर "{scoreLevel}" है और कुल स्कोर {finalScore}/100 है।',
      postCta: '💡 खुद को परखें और रिसर्च में मदद करें! आपकी मदद + 25% छूट।',
      copyMessage: '✅ टेक्स्ट कॉपी हो गया! बस इसे पोस्ट में पेस्ट (Ctrl+V) करें।',
      isRTL: false
    },
    'French-English': {
      postLine1: "J'ai passé le test de dactylographie de TypeSwitch.",
      postLine2: 'Il s\'avère que mon niveau est "{scoreLevel}" avec un score global de {finalScore}/100.',
      postCta: '💡 Testez-vous et aidez la recherche ! + 25% de réduction.',
      copyMessage: '✅ Texte copié ! Il suffit de le coller (Ctrl+V) dans la publication.',
      isRTL: false
    },
    'Japanese-English': {
      postLine1: 'TypeSwitchのタイピングテストを受けました。',
      postLine2: '私のレベルは「{scoreLevel}」で、総合スコアは{finalScore}/100でした。',
      postCta: '💡 あなたもテストして研究にご協力ください！+ 25%割引。',
      copyMessage: '✅ テキストをコピーしました！投稿に貼り付け（Ctrl+V）てください。',
      isRTL: false
    },
    'Korean-English': {
      postLine1: 'TypeSwitch 타이핑 테스트를 해봤어요.',
      postLine2: '제 수준은 "{scoreLevel}"이고, 총 점수는 {finalScore}/100점입니다.',
      postCta: '💡 여러분도 테스트해보고 연구에 도움을 주세요! + 25% 할인.',
      copyMessage: '✅ 텍스트가 복사되었습니다! 게시물에 붙여넣기(Ctrl+V)하세요.',
      isRTL: false
    }
  };

  const currentText = shareTexts[selectedLanguage] || shareTexts['Hebrew-English'];
  
  // NEW: Encouraging titles based on final score
  const getScoreLevelInfo = (score: number) => {
    if (score >= 85) return { level: 'Excellent!', color: '#22C55E', gradient: ['#6EE7B7', '#3B82F6'] };
    if (score >= 70) return { level: 'Good', color: '#3B82F6', gradient: ['#93C5FD', '#8B5CF6'] };
    if (score >= 55) return { level: 'Average', color: '#F59E0B', gradient: ['#FDE68A', '#F97316'] };
    if (score >= 40) return { level: 'Needs Improvement', color: '#F97316', gradient: ['#FDBA74', '#EF4444'] };
    return { level: 'Room to Grow', color: '#EF4444', gradient: ['#FCA5A5', '#D946EF'] };
  };
  
  const scoreLevelInfo = getScoreLevelInfo(finalScore);

  const generateImageWithCanvas = () => {
    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    canvas.width = 800;
    canvas.height = 1000;
    
    // NEW: Dynamic gradient background based on score
    const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
    gradient.addColorStop(0, scoreLevelInfo.gradient[0]);
    gradient.addColorStop(1, scoreLevelInfo.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1000);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    roundRect(ctx, 40, 40, 720, 920, 20);
    ctx.fill();
    if (currentText.isRTL) {
      ctx.direction = 'rtl';
    }
    
    // --- Drawing content on the canvas ---
    let yPos = 120;

    // NEW: Main Title (The encouraging level)
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = scoreLevelInfo.color;
    ctx.textAlign = 'center';
    ctx.fillText(scoreLevelInfo.level, 400, yPos);
    
    // NEW: Subtitle with final score
    yPos += 70;
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText(`Overall Score: ${finalScore}/100`, 400, yPos);

    // Key metrics section
    yPos += 100;
    const stats = [
      { label: 'Speed (WPM)', value: metrics.wpm },
      { label: 'Accuracy', value: `${metrics.accuracy}%` },
      { label: 'Mistakes', value: metrics.totalMistakesMade }
    ];
    let xPos = 100;
    stats.forEach(stat => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      roundRect(ctx, xPos, yPos, 200, 100, 15);
      ctx.fill();
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(stat.value), xPos + 100, yPos + 55);
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(stat.label, xPos + 100, yPos + 85);
      xPos += 220;
    });

    // Frustration bar
    yPos += 150;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
    roundRect(ctx, 100, yPos, 600, 80, 15);
    ctx.fill();
    ctx.fillStyle = '#1F2937';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Frustration Level:', 120, yPos + 48);
    const barColor = metrics.frustrationScore > 6 ? '#EF4444' : metrics.frustrationScore > 3 ? '#F59E0B' : '#22C55E';
    ctx.fillStyle = barColor;
    const barWidth = (400 * metrics.frustrationScore) / 10;
    roundRect(ctx, 320, yPos + 25, 360, 30, 15);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();
    roundRect(ctx, 320, yPos + 25, barWidth > 360 ? 360: barWidth, 30, 15);
    ctx.fillStyle = barColor;
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${metrics.frustrationScore}/10`, 320 + (barWidth > 360 ? 360: barWidth)/2, yPos + 46);
    
    // CTA Section
    yPos += 150;
    const shareUrl = "typeswitch.io";
    ctx.fillStyle = 'rgba(147, 51, 234, 0.1)';
    roundRect(ctx, 60, yPos, 680, 200, 20);
    ctx.fill();
    ctx.fillStyle = '#7C3AED';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Help build the best multilingual keyboard!', 400, yPos + 70);
    ctx.fillStyle = '#3B82F6';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText(shareUrl, 400, yPos + 130);
    
    // Footer
    ctx.fillStyle = '#4B5563';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Join 1000+ testers shaping the future of typing', 400, 950);

    setImageUrl(canvas.toDataURL('image/png'));
    setShareStep('generated');
    setIsGenerating(false);
  };
  
  // Helper to draw rounded rectangles (no changes)
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

  // Build the text for sharing, now with the final score
  const buildPostText = () => {
    const postLine2WithScore = currentText.postLine2
      .replace('{scoreLevel}', scoreLevelInfo.level)
      .replace('{finalScore}', String(finalScore));

    return [
      currentText.postLine1,
      postLine2WithScore,
      '', 
      currentText.postCta,
      '',
      'Test yourself: https://typeswitch.io'
    ].join('\n');
  };

  const shareToSocial = (platform: string) => {
    const postText = buildPostText();
    const siteUrl = 'https://typeswitch.io';

    navigator.clipboard.writeText(postText).then(() => {
      setCopySuccess(currentText.copyMessage); // Use translated message
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });

    let url = '';
    const encodedText = encodeURIComponent(postText);
    const encodedUrl = encodeURIComponent(siteUrl);

    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {shareStep === 'initial' && (
           <>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Your results will include:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Your final score and title</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Your typing speed and accuracy</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>A beautiful shareable image with all the info</li>
              </ul>
            </div>
            <button onClick={generateImageWithCanvas} disabled={isGenerating} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center">
              {isGenerating ? 'Creating your image...' : `📸 Generate Share Image in ${selectedLanguage.split('-')[0]}`}
            </button>
          </>
        )}

        {shareStep === 'generated' && (
          <>
            <div className="mb-4 max-h-96 overflow-y-auto rounded-lg shadow-lg border">
              <img src={imageUrl} alt="Your Results" className="w-full" />
            </div>
            
            {copySuccess && (
               <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
                <p className="text-sm text-green-800 font-semibold">{copySuccess}</p>
              </div>
            )}

            <div className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => shareToSocial('linkedin')} className="bg-blue-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-900 transition">Share to LinkedIn</button>
                 <button onClick={() => shareToSocial('twitter')} className="bg-sky-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-600 transition">Share to Twitter/X</button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => shareToSocial('facebook')} className="bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition">Share to Facebook</button>
                 <button onClick={() => shareToSocial('whatsapp')} className="bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition">Share to WhatsApp</button>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={downloadImage} className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </button>
                   <button onClick={() => { setShareStep('initial'); setImageUrl(''); setCopySuccess(''); }} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition">
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

// Helper function to wrap text on canvas (not used in the new design, but kept for safety)
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

export default ShareCard;
