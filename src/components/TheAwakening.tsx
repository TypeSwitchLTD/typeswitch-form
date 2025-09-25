import React, { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
  lang: 'he' | 'en';
}

const texts = {
  he: {
    title: 'חווית ההקלדה היומיומית שלך',
    instructions: 'חשוב על יום עבודה רגיל שלך. אילו מהמצבים הבאים מוכרים לך? (סמן את כל מה שמתאים)',
    q1_1_title: 'בדיקות מקדימות',
    q1_1_opt1: 'לפני שאני מתחיל להקליד משהו חשוב, אני מציץ בזווית העין לאייקון השפה (למשל ENG/HEB) בשורת המשימות למטה, כדי לוודא שאני בשפה הנכונה.',
    q1_1_opt2: 'אני משתמש בקיצור המקשים (Alt+Shift או Cmd+Space) "ליתר ביטחון" כמה פעמים, רק כדי לוודא שאני על השפה הנכונה.',
    q1_1_opt3: 'אני מקליד מילה או שתיים, עוצר כדי לראות אם יצאו בשפה הנכונה, ואז ממשיך.',
    q1_2_title: 'תיקונים קטנים',
    q1_2_opt1: 'אני מוצא את עצמי מוחק מילה שלמה שהוקלדה בשפה הלא נכונה.',
    q1_2_opt2: 'אני מקליד פסיק או נקודה בסוף משפט, ומקבל אות עברית במקום (למשל \'ת\' במקום \',\' או \'ץ\' במקום \'.\').',
    q1_2_opt3: 'שלחתי הודעה מהירה באימייל, בצ\'אט (WhatsApp, Slack) או בכל פלטפורמה אחרת, ורק אחרי השליחה קלטתי שהיא בשפה הלא נכונה.',
    q1_3_title: 'מאמץ מנטלי ופתרונות קיימים',
    q1_3_opt1: 'במעבר מהיר בין חלונות, המוח שלי צריך לעשות מאמץ אקטיבי כדי לנסות לזכור באיזו שפה השארתי את המקלדת, במקום שהמידע הזה יהיה זמין וברור.',
    q1_3_opt2: 'אני נמנע מלהשתמש בקיצורי מקלדת מסוימים כי הם מתנגשים עם קיצור החלפת השפה (Alt+Shift, Cmd+Space).',
    q1_3_opt3: 'חיפשתי בעבר או שאני משתמש כיום בתוכנה חיצונית או פתרון אחר כלשהו כדי להקל על המעבר בין שפות.',
    nextButton: 'המשך'
  },
  en: {
    title: 'Your Daily Typing Experience',
    instructions: 'Think about a typical workday. Which of the following situations feel familiar? (Check all that apply)',
    q1_1_title: 'Preemptive Checks',
    q1_1_opt1: 'Before typing something important, I glance at the language icon (e.g., ENG/HEB) in my taskbar or menu bar to make sure I\'m in the right language.',
    q1_1_opt2: 'I use the keyboard shortcut (Alt+Shift or Cmd+Space) a few times "just in case," to be certain the language has switched.',
    q1_1_opt3: 'I type a word or two, pause to see if they came out in the right language, and then continue.',
    q1_2_title: 'Micro-Corrections',
    q1_2_opt1: 'I find myself deleting an entire word that was typed in the wrong language.',
    q1_2_opt2: 'I type a comma or period at the end of a sentence, but get a Hebrew letter instead (e.g., \'ת\' instead of \',\' or \'ץ\' instead of \'.\').',
    q1_2_opt3: 'I\'ve sent a quick message via email, chat (WhatsApp, Slack), or another platform, only to realize after hitting send that it was in the wrong language.',
    q1_3_title: 'Mental Effort & Existing Solutions',
    q1_3_opt1: 'When switching between windows quickly, my brain has to make an active effort to try to remember which language the keyboard is set to, instead of that information being clear and available.',
    q1_3_opt2: 'I avoid using certain keyboard shortcuts because they conflict with the language-switching shortcut (Alt+Shift, Cmd+Space).',
    q1_3_opt3: 'I have searched for or currently use third-party software or another solution to make language switching easier.',
    nextButton: 'Continue'
  }
};

const TheAwakening: React.FC<Props> = ({ onNext, lang }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const currentTexts = texts[lang];
  const pageDir = lang === 'he' ? 'rtl' : 'ltr';

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(item => item !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    onNext({ awakening: { symptoms: selectedSymptoms } });
  };

  const questions = {
    [currentTexts.q1_1_title]: [
      { id: 'glance_icon', label: currentTexts.q1_1_opt1 },
      { id: 'extra_shortcut', label: currentTexts.q1_1_opt2 },
      { id: 'type_and_check', label: currentTexts.q1_1_opt3 },
    ],
    [currentTexts.q1_2_title]: [
      { id: 'delete_word', label: currentTexts.q1_2_opt1 },
      { id: 'wrong_punctuation', label: currentTexts.q1_2_opt2 },
      { id: 'sent_wrong_lang', label: currentTexts.q1_2_opt3 },
    ],
    [currentTexts.q1_3_title]: [
      { id: 'mental_effort', label: currentTexts.q1_3_opt1 },
      { id: 'shortcut_conflict', label: currentTexts.q1_3_opt2 },
      { id: 'use_3rd_party', label: currentTexts.q1_3_opt3 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={pageDir}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{currentTexts.title}</h2>
            <p className="text-gray-600 mt-2">{currentTexts.instructions}</p>
        </div>
        
        <div className="space-y-6">
          {Object.entries(questions).map(([title, options]) => (
            <div key={title}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">{title}</h3>
              <div className="space-y-3">
                {options.map(option => (
                  <label key={option.id} className={`flex items-start p-4 rounded-lg cursor-pointer transition ${selectedSymptoms.includes(option.id) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'} border`}>
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(option.id)}
                      onChange={() => toggleSymptom(option.id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ms-3 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">
          {currentTexts.nextButton}
        </button>
      </div>
    </div>
  );
};

export default TheAwakening;