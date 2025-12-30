import { getSupabaseClient, type PeerFeedback } from '~/lib/supabase';
import { normalizePresenterName } from '~/lib/utils';

export async function submitFeedback(feedback: Omit<PeerFeedback, 'id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  // Normalize presenter name before saving
  const normalizedFeedback = {
    ...feedback,
    presenter_name: normalizePresenterName(feedback.presenter_name)
  };

  const { data, error } = await supabase
    .from('peer_feedback')
    .insert([normalizedFeedback])
    .select()
    .single();

  if (error) {
    return { success: false, error: `Failed to submit feedback: ${error.message}` };
  }

  return { success: true, data };
}

export async function getTodayFeedbackCount(studentName: string, section: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  // Get today's date at midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get tomorrow's date at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count, error } = await supabase
    .from('peer_feedback')
    .select('*', { count: 'exact', head: true })
    .eq('student_name', studentName)
    .eq('section', section)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    return { success: false, error: `Failed to get feedback count: ${error.message}` };
  }

  return { success: true, data: count || 0 };
}

export async function getFeedbackForPresenter(presenterName: string, section: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('*')
    .ilike('presenter_name', `%${presenterName.trim()}%`)
    .eq('section', section)
    .eq('feedback_released', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: `Failed to get feedback for presenter: ${error.message}` };
  }

  return { success: true, data: data || [] };
}

export async function getFeedbackBySpeechAndPresenter(speechType: string, presenterName: string, section: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('*')
    .eq('speech_type', speechType)
    .ilike('presenter_name', `%${presenterName.trim()}%`)
    .eq('section', section)
    .eq('feedback_released', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: `Failed to get feedback by speech and presenter: ${error.message}` };
  }

  return { success: true, data: data || [] };
}

export async function getDistinctPresentersBySection(section: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('presenter_name')
    .eq('section', section)
    .order('presenter_name');

  if (error) {
    return { success: false, error: `Failed to get distinct presenters: ${error.message}` };
  }

  // Get unique presenter names
  const uniquePresenters = [...new Set(data.map(item => item.presenter_name))];
  const filtered = uniquePresenters.filter(name => name && name.trim() !== '');
  
  return { success: true, data: filtered };
}

export async function getDistinctPresenters() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('presenter_name')
    .order('presenter_name');

  if (error) {
    return { success: false, error: `Failed to get distinct presenters: ${error.message}` };
  }

  // Get unique presenter names
  const uniquePresenters = [...new Set(data.map(item => item.presenter_name))];
  const filtered = uniquePresenters.filter(name => name && name.trim() !== '');
  
  return { success: true, data: filtered };
}

/**
 * One-time data normalization to clean up existing presenter names.
 * This normalizes all existing presenter_name values by:
 * - Trimming extra spaces
 * - Collapsing multiple spaces into one
 * - Converting to Title Case
 */
export async function normalizeExistingPresenterNames() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  // Fetch all feedback records
  const { data, error } = await supabase
    .from('peer_feedback')
    .select('id, presenter_name');

  if (error || !data) {
    return { success: false, error: `Failed to fetch feedback for normalization: ${error?.message || 'No data'}` };
  }

  let updatedCount = 0;

  // Normalize each presenter name
  for (const record of data) {
    const normalizedName = normalizePresenterName(record.presenter_name);
    
    // Only update if the name changed
    if (normalizedName !== record.presenter_name) {
      const { error: updateError } = await supabase
        .from('peer_feedback')
        .update({ presenter_name: normalizedName })
        .eq('id', record.id);

      if (!updateError) {
        updatedCount++;
      }
    }
  }

  return { success: true, data: updatedCount };
}
