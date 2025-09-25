import React, { useState, useMemo } from 'react';

interface Props {
  onNext: (data: any) => void;
  lang: 'he' | 'en';
}

const texts = {
    he: {
        title: "הפתרון האידיאלי",
        q3_1_instructions: "אחרי שחשבנו על האתגרים, דמיין שיש לך מקלדת פיזית 'חכמה' שפותרת את כל הבעיות האלה באופן מובנה.",
        q3_1_question: "מה תהיה התועלת המשמעותית ביותר עבורך מפתרון חומרה כזה?",
        q3_1_opt_a: "חיסכון בזמן ותפוקה גבוהה יותר.",
        q3_1_opt_b: "יכולת להישאר מרוכז ולא לאבד את קו המחשבה.",
        q3_1_opt_c: "שקט נפשי ותחושת שליטה, בלי \"להילחם\" במקלדת.",
        q3_1_opt_d: "תדמית מקצועית גבוהה יותר ותקשורת חלקה.",
        q3_2_instructions: "כדי שנוכל לבנות פתרון מדויק, ספר לנו איזה רעיון היה עוזר לך הכי הרבה להתמודד עם האתגרים שדיברנו עליהם.",
        q3_2_question: "איזה מהפתרונות הבאים נשמע לך הכי מועיל? (דרג את 3 החשובים ביותר)",
        q3_2_rank1: "הכי חשוב (מקום 1)",
        q3_2_rank2: "מקום 2",
        q3_2_rank3: "מקום 3",
        q3_3_instructions: "זו ההזדמנות שלך להשפיע.",
        q3_3_question: "אם היית יכול לשנות דבר אחד באופן שבו המקלדת שלך מתמודדת עם שפות מרובות, מה הוא היה?",
        nextButton: "סיים שאלון",
        formIncomplete: "אנא ענה על כל השאלות",
        selectOption: "בחר..."
    },
    en: {
        title: "The Ideal Solution",
        q3_1_instructions: "After thinking about these challenges, imagine you have a 'smart' physical keyboard that solves all these problems for you.",
        q3_1_question: "What would be the single greatest benefit for you from such a hardware solution?",
        q3_1_opt_a: "Saving time and achieving higher productivity.",
        q3_1_opt_b: "The ability to stay focused and in a state of \"flow.\"",
        q3_1_opt_c: "Peace of mind and a feeling of control, without \"fighting\" the keyboard.",
        q3_1_opt_d: "A more professional image and smoother communication.",
        q3_2_instructions: "To help us build the right solution, tell us which ideas would help you the most with the challenges we've discussed.",
        q3_2_question: "Which of the following solutions sounds most appealing to you? (Please rank your top 3)",
        q3_2_rank1: "Most important (1st)",
        q3_2_rank2: "2nd choice",
        q3_2_rank3: "3rd choice",
        q3_3_instructions: "This is your chance to make an impact.",
        q3_3_question: "If you could change one thing about how your keyboard handles multiple languages, what would it be?",
        nextButton: "Complete Survey",
        formIncomplete: "Please answer all questions",
        selectOption: "Select..."
    }
};

const TheEpiphany: React.FC<Props> = ({ onNext, lang }) => {
    const [answers, setAnswers] = useState({
        overallValueProposition: '',
        ranking: { '1': '', '2': '', '3': '' },
        finalFeedbackText: '',
    });
    
    const currentTexts = texts[lang];
    const pageDir = lang === 'he' ? 'rtl' : 'ltr';

    const handleOptionChange = (question: keyof typeof answers, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleRankingChange = (rank: '1' | '2' | '3', value: string) => {
        setAnswers(prev => ({
            ...prev,
            ranking: { ...prev.ranking, [rank]: value },
        }));
    };
    
    const isFormValid = answers.overallValueProposition && answers.ranking['1'] && answers.ranking['2'] && answers.ranking['3'] && answers.finalFeedbackText;

    const handleSubmit = () => {
        if (isFormValid) {
            onNext({ epiphany: answers });
        }
    };

    const rankingOptions = useMemo(() => ({
        he: [
            { id: 'mechanical', label: 'מקלדת מכנית' },
            { id: 'physical_switch', label: 'מתג פיזי ייעודי להחלפת שפה' },
            { id: 'auto_detection', label: 'זיהוי שפה אוטומטי' },
            { id: 'dynamic_lighting', label: 'תאורה דינמית' },
            { id: 'wireless', label: 'חיבור אלחוטי יציב' },
            { id: 'mic', label: 'מיקרופון איכותי מובנה עם כפתור תמלול' },
            { id: 'wrist_rest', label: 'משענת יד ארגונומית' },
            { id: 'programmable_keys', label: 'מקשים ניתנים לתכנות' },
            { id: 'rotary_knob', label: 'חוגה סיבובית (Rotary Knob)' },
            { id: 'visual_display', label: 'תצוגה ויזואלית על המקלדת' },
        ],
        en: [
            { id: 'mechanical', label: 'Mechanical Keyboard' },
            { id: 'physical_switch', label: 'Dedicated Physical Language Switch' },
            { id: 'auto_detection', label: 'Automatic Language Detection' },
            { id: 'dynamic_lighting', label: 'Dynamic Backlighting' },
            { id: 'wireless', label: 'Stable Wireless Connectivity' },
            { id: 'mic', label: 'High-Quality Built-in Microphone with Dictation button' },
            { id: 'wrist_rest', label: 'Ergonomic Wrist Rest' },
            { id: 'programmable_keys', label: 'Programmable Keys' },
            { id: 'rotary_knob', label: 'Rotary Knob' },
            { id: 'visual_display', label: 'On-Keyboard Visual Display' },
        ]
    }[lang]), [lang]);

    const getAvailableOptions = (exclude: string[]) => {
        return rankingOptions.filter(opt => !exclude.includes(opt.id));
    };

    const rank1Options = getAvailableOptions([answers.ranking['2'], answers.ranking['3']]);
    const rank2Options = getAvailableOptions([answers.ranking['1'], answers.ranking['3']]);
    const rank3Options = getAvailableOptions([answers.ranking['1'], answers.ranking['2']]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={pageDir}>
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{currentTexts.title}</h2>
                
                <div className="space-y-8">
                    {/* Question 3.1 */}
                    <div>
                        <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                            <p className="text-sm text-gray-600">{currentTexts.q3_1_instructions}</p>
                            <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q3_1_question}</h3>
                        </div>
                        <div className="space-y-2 p-3">
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.overallValueProposition === 'productivity' ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="valueProp" value="productivity" onChange={(e) => handleOptionChange('overallValueProposition', e.target.value)} />
                                <span className="ms-3 text-sm">{currentTexts.q3_1_opt_a}</span>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.overallValueProposition === 'focus' ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="valueProp" value="focus" onChange={(e) => handleOptionChange('overallValueProposition', e.target.value)} />
                                <span className="ms-3 text-sm">{currentTexts.q3_1_opt_b}</span>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.overallValueProposition === 'peace_of_mind' ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="valueProp" value="peace_of_mind" onChange={(e) => handleOptionChange('overallValueProposition', e.target.value)} />
                                <span className="ms-3 text-sm">{currentTexts.q3_1_opt_c}</span>
                            </label>
                             <label className={`flex items-center p-3 rounded-lg cursor-pointer transition ${answers.overallValueProposition === 'professionalism' ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="valueProp" value="professionalism" onChange={(e) => handleOptionChange('overallValueProposition', e.target.value)} />
                                <span className="ms-3 text-sm">{currentTexts.q3_1_opt_d}</span>
                            </label>
                        </div>
                    </div>

                    {/* Question 3.2 */}
                    <div>
                        <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                            <p className="text-sm text-gray-600">{currentTexts.q3_2_instructions}</p>
                            <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q3_2_question}</h3>
                        </div>
                        <div className="space-y-4 p-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{currentTexts.q3_2_rank1}</label>
                                <select value={answers.ranking['1']} onChange={(e) => handleRankingChange('1', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option value="">{currentTexts.selectOption}</option>
                                    {rank1Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{currentTexts.q3_2_rank2}</label>
                                <select value={answers.ranking['2']} onChange={(e) => handleRankingChange('2', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option value="">{currentTexts.selectOption}</option>
                                    {rank2Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{currentTexts.q3_2_rank3}</label>
                                <select value={answers.ranking['3']} onChange={(e) => handleRankingChange('3', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option value="">{currentTexts.selectOption}</option>
                                    {rank3Options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Question 3.3 */}
                    <div>
                        <div className="bg-gray-50 p-3 rounded-t-lg border-b">
                            <p className="text-sm text-gray-600">{currentTexts.q3_3_instructions}</p>
                            <h3 className="text-lg font-semibold text-gray-800 mt-1">{currentTexts.q3_3_question}</h3>
                        </div>
                        <div className="p-3">
                            <textarea
                                value={answers.finalFeedbackText}
                                onChange={(e) => handleOptionChange('finalFeedbackText', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                            />
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

export default TheEpiphany;