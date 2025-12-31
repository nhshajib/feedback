import { createClient } from '@supabase/supabase-js';

export type RatingOption = 'Needs Improvement' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';

export type PeerFeedback = {
  id?: string;
  student_name: string;
  section: string;
  speech_type: string;
  presenter_name: string;
  preparation: RatingOption;
  nonverbals: RatingOption;
  clarity: RatingOption;
  interest: RatingOption;
  dynamism: RatingOption;
  additional_comments?: string;
  created_at?: string;
  feedback_released?: boolean;
};

/**
 * Creates and returns a Supabase client.
 * Returns null if required environment variables are missing.
 * Should only be called inside loaders/actions, never at module level.
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
  const supabaseKey = process.env.SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}
