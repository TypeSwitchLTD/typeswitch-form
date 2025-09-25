import { createClient } from '@supabase/supabase-js';
import { SurveyData } from '../types'; // You might need to update this type

// Your Supabase credentials
const SUPABASE_URL = 'https://raagydwyruvrayaclgbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWd5ZHd5cnV2cmF5YWNsZ2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTE0MDEsImV4cCI6MjA3MTcyNzQwMX0.ZgivHwYwPvqgayTPMoXNWiTH3lzizJ7boJrYV7NpMtY';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to calculate overall score (if test is taken)
function calculateOverallScore(metrics: any): number {
  if (!metrics || !metrics.wpm) return 0; // Return 0 if no metrics
  let score = 100;
  
  // WPM scoring
  if (metrics.wpm < 20) score -= 30;
  else if (metrics.wpm < 30) score -= 25;
  else if (metrics.wpm < 40) score -= 18;
  else if (metrics.wpm < 50) score -= 10;
  else if (metrics.wpm < 60) score -= 5;
  
  // Accuracy scoring
  if (metrics.accuracy < 85) score -= 20;
  else if (metrics.accuracy < 90) score -= 15;
  else if (metrics.accuracy < 95) score -= 10;
  
  return Math.max(1, Math.min(100, score));
}

// Function to save survey data to the new v2 table
export async function saveSurveyData(surveyData: any, discountCode: string) {
  try {
    console.log('📊 Preparing data for Supabase (v2)...');
    
    const completionTime = Math.round((Date.now() - ((window as any).surveyStartTime || Date.now())) / 1000);
    
    const dataToSave = {
      // Demographics
      languages: surveyData.demographics?.languages || [],
      hours_typing: surveyData.demographics?.hoursTyping || null,
      occupation: surveyData.demographics?.occupation || null,
      keyboard_type: surveyData.demographics?.keyboardType || null,
      current_keyboard: surveyData.demographics?.currentKeyboard || null,
      age: surveyD ata.demographics?.age || null,
      diagnosis: surveyData.demographics?.diagnosis || null,
      
      // Self Assessment (if test taken)
      difficulty_rating: surveyData.selfAssessment?.difficulty || null,
      errors_rating: surveyData.selfAssessment?.errors || null,
      language_switching_rating: surveyData.selfAssessment?.languageSwitching || null,
      frustration_rating: surveyData.selfAssessment?.frustration || null,
      
      // Metrics (if test taken)
      total_wpm: surveyData.metrics?.wpm || null,
      total_accuracy: surveyData.metrics?.accuracy || null,
      total_errors: surveyData.metrics?.totalErrors || null,
      total_language_errors: surveyData.metrics?.languageErrors || null,
      total_punctuation_errors: surveyData.metrics?.punctuationErrors || null,
      total_deletions: surveyData.metrics?.deletions || null,
      total_corrections: surveyData.metrics?.corrections || null,
      total_language_switches: surveyData.metrics?.languageSwitches || null,
      frustration_score: surveyData.metrics?.frustrationScore || null,
      overall_score: calculateOverallScore(surveyData.metrics || {}),

      // NEW PAIN POINT DATA
      awakening_symptoms: surveyData.awakening?.symptoms || [],
      flow_breaker_impact: surveyData.deepDive?.flowBreakerImpact || null,
      professional_image_impact: surveyData.deepDive?.professionalImageImpact || null,
      high_pace_challenge: surveyData.deepDive?.highPaceChallenge || null,
      coping_mechanism_text: surveyData.deepDive?.copingMechanismText || null,
      coping_mechanism_none: surveyData.deepDive?.copingMechanismNone || false,
      overall_value_proposition: surveyData.epiphany?.overallValueProposition || null,
      feature_ranking: surveyData.epiphany?.ranking || {},
      final_feedback_text: surveyData.epiphany?.finalFeedbackText || null,
      
      // Meta
      discount_code: discountCode,
      user_agent: navigator.userAgent,
      completion_time: completionTime,
      ip_country: await getCountry(),
      test_skipped: surveyData.testSkipped,
      test_completed: surveyData.testCompleted,
      
      // Device info will be added in a separate update call
    };
    
    console.log('📤 Final data being sent to survey_responses_v2:', dataToSave);
    
    const { data, error } = await supabase
      .from('survey_responses_v2')
      .insert([dataToSave])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase response:', data);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('❌ Unexpected error in saveSurveyData:', error);
    return { success: false, error: 'Failed to save survey' };
  }
}

// Function to save email subscription (updates the new v2 table)
export async function saveEmailSubscription(email: string, surveyId?: string) {
  try {
    if (!surveyId) {
      console.error('No survey ID provided for email subscription');
      return { success: false, error: 'No survey ID' };
    }
    
    const { error } = await supabase
      .from('survey_responses_v2')
      .update({ email })
      .eq('id', surveyId);
    
    if (error) {
      console.error('Error saving email:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Email saved successfully for survey ID:', surveyId);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in saveEmailSubscription:', error);
    return { success: false, error: 'Failed to save email' };
  }
}


// Helper to get user's country
async function getCountry(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/country_name/');
    if (!response.ok) return 'Unknown';
    return await response.text();
  } catch {
    return 'Unknown';
  }
}

// NOTE: All admin functions (getAll, delete, etc.) would also need to be updated
// to point to 'survey_responses_v2' instead of 'survey_responses'.