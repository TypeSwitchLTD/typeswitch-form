import React, { useState } from 'react';

interface Props {
  onNext: (lang: 'he' | 'en') => void;
  onAdminClick: () => void;
}

const texts = {
  he: {
    headline: "האם המקלדת הנוכחית שלך עוזרת לך או פוגעת בך?",
    body: "אנחנו מפתחים פתרון חדש למקלידים רב-לשוניים מקצועיים, ואנחנו צריכים את עזרתך.\nהשאלון הקצר הזה (1-3 דקות) יעזור לנו לחשוף את האתגרים הנסתרים של הקלדה בשפות מרובות – אותם רגעים קטנים של תסכול, איבוד ריכוז ובזבוז זמן שאנחנו כל כך רגילים אליהם, עד שכבר הפסקנו לשים לב.",
    rewardsTitle: "מה תקבלו בתמורה?",
    rewardsDiscount: "הנחה משמעותית: 15% הנחה על השתתפות בסקר, ו-10% נוספים בהשארת אימייל לעדכונים (סה\"כ 25% הנחה לרכישת המקלדת שלנו כשתצא לשוק).",
    rewardsImpact: "הזדמנות להשפיע: התשובות שלכם יכריעו מה יהיו היכולות המרכזיות של המוצר.",
    challengeTitle: "אופציונלי: אתגר הקלדה (3 דקות נוספות, דורש מקלדת)",
    challengeBody: "רוצה לראות את הנתונים שחור על גבי לבן? אתגר ההקלדה שלנו מנתח את הביצועים שלך במשימה רב-לשונית מורכבת. בסיום תקבל דו\"ח אישי שמפרט:",
    challengeWPM: "מהירות הקלדה אמיתית (WPM): בשילוב שתי שפות.",
    challengeAccuracy: "אחוזי דיוק: כולל ניתוח טעויות שפה מול טעויות הקלדה רגילות.",
    challengeTimeWasted: "זמן אבוד: כמה שניות בזבזת על מחיקות ותיקונים.",
    challengeFrustration: "רמת תסכול: בהתבסס על השהיות ותיקונים חוזרים.",
    startButton: "התחל שאלון",
    selectLang: "בחר שפה / Select Language"
  },
  en: {
    headline: "Is Your Keyboard Helping You Work, or Working Against You?",
    body: "We're developing a new solution for professional multilingual typists, and we need your help.\nThis short survey (1-3 minutes) will help us uncover the hidden challenges of typing in multiple languages—those small moments of frustration, lost focus, and wasted time that we've become so used to, we've stopped noticing them.",
    rewardsTitle: "What's in it for you?",
    rewardsDiscount: "A Significant Discount: Get 15% OFF for completing the survey, plus an additional 10% OFF for leaving your email for updates (Total of 25% OFF when our keyboard launches).",
    rewardsImpact: "A Chance to Make an Impact: Your answers will directly shape the core features of our product.",
    challengeTitle: "Optional: Typing Challenge (3 extra minutes, keyboard required)",
    challengeBody: "Want to see the problem in black and white? Our typing challenge analyzes your performance on a complex multilingual task. At the end, you'll receive a personal report detailing:",
    challengeWPM: "Your True Multilingual WPM: How fast you type when mixing languages.",
    challengeAccuracy: "Accuracy Rate: Including a breakdown of language errors vs. standard typos.",
    challengeTimeWasted: "Time Wasted: Seconds you lost on backspacing and corrections.",
    challengeFrustration: "Frustration Level: Based on pauses and repeated edits.",
    startButton: "Start Survey",
    selectLang: "Select Language / בחר שפה"
  }
};

const WelcomeScreen: React.FC<Props> = ({ onNext, onAdminClick }) => {
  const [lang, setLang] = useState<'he' | 'en' | null>(null);
  const currentTexts = lang ? texts[lang] : texts.en;
  const pageDir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full" dir={pageDir}>
        <div onClick={onAdminClick} className="text-center cursor-pointer mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{currentTexts.headline}</h1>
        </div>
        
        {!lang ? (
             <div className="text-center p-6">
                <h2 className="text-2xl font-semibold mb-4">{texts.en.selectLang}</h2>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setLang('en')} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">English</button>
                    <button onClick={() => setLang('he')} className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">עברית</button>
                </div>
            </div>
        ) : (
            <>
                <p className="text-gray-600 whitespace-pre-line text-center">{currentTexts.body}</p>
                
                <div className="mt-8 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-gray-800 mb-2">{currentTexts.rewardsTitle}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            <li>{currentTexts.rewardsDiscount}</li>
                            <li>{currentTexts.rewardsImpact}</li>
                        </ul>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-bold text-gray-800 mb-2">{currentTexts.challengeTitle}</h3>
                         <p className="text-sm text-gray-700 mb-2">{currentTexts.challengeBody}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            <li>{currentTexts.challengeWPM}</li>
                            <li>{currentTexts.challengeAccuracy}</li>
                            <li>{currentTexts.challengeTimeWasted}</li>
                            <li>{currentTexts.challengeFrustration}</li>
                        </ul>
                    </div>
                </div>

                <button onClick={() => onNext(lang)} className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition">
                    {currentTexts.startButton}
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;