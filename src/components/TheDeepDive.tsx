import React, { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
  lang: 'he' | 'en';
}

const texts = {
    he: {
        title: "ניתוח מצבי אמת",
        q2_1_instructions: "דמיין שזו כבר הפעם החמישית בשעה האחרונה שאתה קולט שהתחלת משפט בשפה הלא נכונה.",
        q2_1_question: "מהי ההשפעה המצטברת העיקרית של טעויות חוזרות ונשנות כאלה עליך?",
        q2_1_opt_a: "טכנית בעיקר - זה מצטבר לבזבוז זמן משמעותי של תיקונים ומחיקות.",
        q2_1_opt_b: "מנטלית בעיקר - זה \"מוציא לי את הרוח מהמפרשים\" ופוגע ביכולת שלי להישאר מרוכז לאורך זמן.",
        q2_1_opt_c: "רגשית בעיקר - התחושה המרכזית היא תסכול הולך וגובר מהמקלדת ו\"מלחמה\" מתמדת איתה.",
        q2_1_opt_d: "זניחה - אני מתקן את זה באופן אוטומטי וזה לא באמת מפריע לי.",
        q2_2_instructions: "עכשיו דמיין: אתה בתקשורת מהירה וחשובה עם לקוח או מנהל בכיר בצ'אט, ומשפט שלם נשלח בשפה הלא נכונה.",
        q2_2_question: "מה המחשבה הראשונה שעוברת לך בראש ברגע שאתה לוחץ Enter ורואה את הטעות?",
        q2_2_opt_a: "\"אוף, צריך לתקן את זה מהר.\" (התמקדות בתיקון)",
        q2_2_opt_b: "\"אני מקווה שהוא/היא הבין/ה את הכוונה.\" (התמקדות בהבנת הנמען)",
        q2_2_opt_c: "\"זה נראה לא מקצועי / מרושל.\" (התמקדות בתדמית)",
        q2_2_opt_d: "\"קורה, לא סיפור גדול.\" (התמקדות בהכלה)",
        q2_3_instructions: "חשוב על מצב שבו אתה מתמלל פגישה או כותב סיכום בזמן אמת, ועליך לעבור תדיר בין שתי השפות.",
        q2_3_question: "מהו האתגר הכי גדול שלך במצב כזה של הקלדה מהירה ורב-לשונית?",
        q2_3_opt_a: "המהירות שלי יורדת משמעותית כי אני חושב כל הזמן על החלפת השפה.",
        q2_3_opt_b: "כמות הטעויות הקטנות (אותיות לא נכונות, שפה שגויה) עולה דרמטית.",
        q2_3_opt_c: "אני מרגיש עומס קוגניטיבי גבוה - המוח שלי עובד \"שעות נוספות\" על ניהול השפות במקום על התוכן.",
        q2_3_opt_d: "אני לא חווה אתגר משמעותי במצבים כאלה.",
        q2_4_instructions: "אנשים רבים מפתחים \"טריקים\" או פתרונות משלהם כדי להתמודד עם בעיות חוזרות.",
        q2_4_question: "האם יש לך שיטה, הרגל או כלי כלשהו שאימצת כדי לצמצם את טעויות המקלדת הרב-לשוניות? (למשל: \"אני תמיד בודק את צבע האייקון\", \"התקנתי תוכנה X\", \"אני מקליד לאט יותר בכוונה\").",
        q2_4_checkbox: "אין לי שיטה או פתרון מיוחד.",
        nextButton: "המשך",
        formIncomplete: "אנא ענה על כל השאלות"
    },
    en: {
        title: "Analyzing Real-World Scenarios",
        q2_1_instructions: "Imagine this is the fifth time in the last hour you've realized you started a sentence in the wrong language.",
        q2_1_question: "What is the main cumulative effect of these repeated mistakes on you?",
        q2_1_opt_a: "Mostly technical - It adds up to a significant amount of wasted time from deleting and retyping.",
        q2_1_opt_b: "Mostly mental - It breaks my concentration and hurts my ability to stay focused for long periods.",
        q2_1_opt_c: "Mostly emotional - The primary feeling is a growing frustration and a constant \"fight\" with my keyboard.",
        q2_1_opt_d: "Negligible - I fix it automatically and it doesn't really bother me.",
        q2_2_instructions: "Now, imagine you're in a fast-paced, important chat with a client or a senior manager. An entire sentence gets sent in the wrong language.",
        q2_2_question: "What's the first thought that goes through your head the moment you hit Enter and see the mistake?",
        q2_2_opt_a: "\"Ugh, I have to fix that, fast.\" (Focus on the correction)",
        q2_2_opt_b: "\"I hope they understood what I meant.\" (Focus on the recipient's understanding)",
        q2_2_opt_c: "\"That looks unprofessional / sloppy.\" (Focus on professional image)",
        q2_2_opt_d: "\"It happens, no big deal.\" (Focus on acceptance)",
        q2_3_instructions: "Think about a time when you were transcribing a meeting or writing a summary in real-time, needing to switch frequently between two languages.",
        q2_3_question: "What is your biggest challenge in that kind of high-pace, multilingual typing situation?",
        q2_3_opt_a: "My speed drops significantly because I'm constantly thinking about switching languages.",
        q2_3_opt_b: "The number of small errors (wrong letters, wrong language) increases dramatically.",
        q2_3_opt_c: "I feel a high cognitive load - my brain is working overtime managing the languages instead of focusing on the content.",
        q2_3_opt_d: "I don't experience a significant challenge in these situations.",
        q2_4_instructions: "Many people develop their own \"tricks\" or workarounds to deal with recurring issues.",
        q2_4_question: "Do you have a specific method, habit, or tool you've adopted to minimize multilingual keyboard errors? (e.g., \"I always check the icon color,\" \"I installed software X,\" \"I deliberately type slower\").",
        q2_4_checkbox: "I don't have a specific method or solution.",
        nextButton: "Continue",
        formIncomplete: "Please answer all questions"
    }
};

const TheDeepDive: React.FC<Props> = ({ onNext, lang }) => {
  const [answers, setAnswers] = useState({
    flowBreakerImpact: '',
    professionalImageImpact: '',
    highPaceChallenge: '',
    copingMechanismText: '',
    copingMechanismNone: false,
  });

  const currentTexts = texts[lang];
  const pageDir = lang === 'he' ? 'rtl' : 'ltr';

  const handleOptionChange = (question: keyof typeof answers, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAnswers(prev => ({
      ...prev,
      copingMechanismNone: isChecked,
      copingMechanismText: isChecked ? '' : prev.copingMechanismText
    }));
  };

  const isFormValid = answers.flowBreakerImpact && answers.professionalImageImpact && answers.highPaceChallenge && (answers.copingMechanismNone || answers.copingMechanismText);

  const handleSubmit = () => {
    if (isFormValid) {
      onNext({ deepDive: answers });
    }
  };

  const q2_1_options = [
      { id: 'technical', label: currentTexts.q2_1_opt_a },
      { id: 'mental', label: currentTexts.q2_1_opt_b },
      { id: 'emotional', label: currentTexts.q2_1_opt_c },
      { id: 'negligible', label: currentTexts.q2_1_opt_d },
  ];
  const q2_2_options = [
      { id: 'correction_focus', label: currentTexts.q2_2_opt_a },
      { id: 'recipient_focus', label: currentTexts.q2_2_opt_b },
      { id: 'image_focus', label: currentTexts.q2_2_opt_c },
      { id: 'acceptance_focus', label: currentTexts.q2_2_opt_d },
  ];
    const q2_3_options = [
      { id: 'speed_drop', label: currentTexts.q2_3_opt_a },
      { id: 'error_increase', label: currentTexts.q2_3_opt_b },
      { id: 'cognitive_load', label: currentTexts.q2_3_opt_c },
      { id: 'no_challenge', label: currentTexts.q2_3_opt_d },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={pageDir}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{currentTexts.title}</h2>
        
        <div className="space-y-8">
            {/* Question 2.1 */}
            <div>
                <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                    <p className="text-sm text-gray-600">{currentTexts.q2_1_instructions}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q2_1_question}</h3>
                </div>
                <div className="space-y-2 p-3">
                    {q2_1_options.map(opt => (
                        <label key={opt.id} className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.flowBreakerImpact === opt.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                            <input type="radio" name="flowBreaker" value={opt.id} onChange={(e) => handleOptionChange('flowBreakerImpact', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                            <span className="ms-3 text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

             {/* Question 2.2 */}
             <div>
                <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                    <p className="text-sm text-gray-600">{currentTexts.q2_2_instructions}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q2_2_question}</h3>
                </div>
                <div className="space-y-2 p-3">
                    {q2_2_options.map(opt => (
                        <label key={opt.id} className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.professionalImageImpact === opt.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                            <input type="radio" name="professionalImage" value={opt.id} onChange={(e) => handleOptionChange('professionalImageImpact', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                            <span className="ms-3 text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

             {/* Question 2.3 */}
             <div>
                <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                    <p className="text-sm text-gray-600">{currentTexts.q2_3_instructions}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q2_3_question}</h3>
                </div>
                <div className="space-y-2 p-3">
                    {q2_3_options.map(opt => (
                        <label key={opt.id} className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.highPaceChallenge === opt.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                            <input type="radio" name="highPace" value={opt.id} onChange={(e) => handleOptionChange('highPaceChallenge', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300"/>
                            <span className="ms-3 text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Question 2.4 */}
            <div>
                <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                    <p className="text-sm text-gray-600">{currentTexts.q2_4_instructions}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q2_4_question}</h3>
                </div>
                 <div className="p-3">
                    <textarea 
                        value={answers.copingMechanismText}
                        onChange={(e) => handleOptionChange('copingMechanismText', e.target.value)}
                        disabled={answers.copingMechanismNone}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        rows={3}
                    />
                    <label className="flex items-center mt-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={answers.copingMechanismNone} onChange={handleCheckboxChange} className="h-4 w-4 text-blue-600 border-gray-300"/>
                        <span className="ms-3 text-sm text-gray-700">{currentTexts.q2_4_checkbox}</span>
                    </label>
                </div>
            </div>
        </div>
        
        <button onClick={handleSubmit} disabled={!isFormValid} className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {isFormValid ? currentTexts.nextButton : currentTexts.formIncomplete}
        </button>
      </div>
    </div>
  );
};

export default TheDeepDive;