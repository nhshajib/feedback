import { getSupabaseClient, type PeerFeedback } from '~/lib/supabase';

export type FeedbackFilters = {
  section?: string;
  studentName?: string;
  speechType?: string;
};

export type SortField = 'student_name' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export type StudentFeedbackSummary = {
  student_name: string;
  section: string;
  total_feedback_count: number;
  participation_score: number;
};

export type SummarySortField = 'total_feedback_count';
export type SummarySortOrder = 'asc' | 'desc';

export async function getAllFeedback(
  filters?: FeedbackFilters,
  sortBy?: SortField,
  sortOrder: SortOrder = 'desc'
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  let query = supabase.from('peer_feedback').select('*');

  // Apply filters
  if (filters?.section) {
    query = query.eq('section', filters.section);
  }
  if (filters?.studentName) {
    query = query.eq('student_name', filters.studentName);
  }
  if (filters?.speechType) {
    query = query.eq('speech_type', filters.speechType);
  }

  // Apply sorting
  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  } else {
    // Default sort by created_at descending
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: `Failed to fetch feedback: ${error.message}` };
  }

  return { success: true, data: data || [] };
}

export async function getUniqueSections() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('section')
    .order('section');

  if (error) {
    return { success: false, error: `Failed to fetch unique sections: ${error.message}` };
  }

  // Get unique sections
  const uniqueSections = [...new Set(data.map(item => item.section))];
  return { success: true, data: uniqueSections };
}

export async function getUniqueStudentNames() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('student_name')
    .order('student_name');

  if (error) {
    return { success: false, error: `Failed to fetch unique student names: ${error.message}` };
  }

  // Get unique student names
  const uniqueNames = [...new Set(data.map(item => item.student_name))];
  return { success: true, data: uniqueNames };
}

export async function getUniqueSpeechTypes() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { data, error } = await supabase
    .from('peer_feedback')
    .select('speech_type')
    .order('speech_type');

  if (error) {
    return { success: false, error: `Failed to fetch unique speech types: ${error.message}` };
  }

  // Get unique speech types
  const uniqueTypes = [...new Set(data.map(item => item.speech_type))];
  return { success: true, data: uniqueTypes };
}

export async function getStudentFeedbackSummary(
  sortBy?: SummarySortField,
  sortOrder: SummarySortOrder = 'desc',
  sectionFilter?: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  let query = supabase
    .from('peer_feedback')
    .select('student_name, section');
  
  // Apply section filter if provided
  if (sectionFilter) {
    query = query.eq('section', sectionFilter);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: `Failed to fetch feedback summary: ${error.message}` };
  }

  if (!data) return { success: true, data: [] };

  // Group by student_name and section, count occurrences
  const groupMap = new Map<string, StudentFeedbackSummary>();

  data.forEach(record => {
    const key = `${record.student_name}|${record.section}`;
    if (groupMap.has(key)) {
      const existing = groupMap.get(key)!;
      existing.total_feedback_count++;
    } else {
      groupMap.set(key, {
        student_name: record.student_name,
        section: record.section,
        total_feedback_count: 1,
        participation_score: 0, // Will be calculated below
      });
    }
  });

  // Calculate participation_score for each entry
  groupMap.forEach(entry => {
    if (entry.total_feedback_count >= 40) {
      entry.participation_score = 30;
    } else {
      const missing_feedbacks = 40 - entry.total_feedback_count;
      const penalty = Math.floor(missing_feedbacks / 4) * 4;
      entry.participation_score = Math.max(0, 30 - penalty);
    }
  });

  // Convert to array
  let summary = Array.from(groupMap.values());

  // Sort by count if specified
  if (sortBy === 'total_feedback_count') {
    summary.sort((a, b) => {
      const diff = a.total_feedback_count - b.total_feedback_count;
      return sortOrder === 'asc' ? diff : -diff;
    });
  } else {
    // Default sort: by student_name, then section
    summary.sort((a, b) => {
      const nameCompare = a.student_name.localeCompare(b.student_name);
      if (nameCompare !== 0) return nameCompare;
      return a.section.localeCompare(b.section);
    });
  }

  return { success: true, data: summary };
}

export async function toggleFeedbackRelease(
  feedbackIds: string[],
  released: boolean
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { error } = await supabase
    .from('peer_feedback')
    .update({ feedback_released: released })
    .in('id', feedbackIds);

  if (error) {
    return { success: false, error: `Failed to update feedback release status: ${error.message}` };
  }

  return { success: true, data: null };
}

export async function bulkReleaseFeedback(
  section?: string,
  speechType?: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  let query = supabase
    .from('peer_feedback')
    .update({ feedback_released: true })
    .eq('feedback_released', false); // Only update unreleased feedback

  // Apply filters
  if (section) {
    query = query.eq('section', section);
  }
  if (speechType) {
    query = query.eq('speech_type', speechType);
  }

  const { data, error } = await query.select();

  if (error) {
    return { success: false, error: `Failed to bulk release feedback: ${error.message}` };
  }

  return { success: true, data: data?.length || 0 };
}

export async function bulkUnreleaseFeedback(
  section?: string,
  speechType?: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  let query = supabase
    .from('peer_feedback')
    .update({ feedback_released: false })
    .eq('feedback_released', true); // Only update released feedback

  // Apply filters
  if (section) {
    query = query.eq('section', section);
  }
  if (speechType) {
    query = query.eq('speech_type', speechType);
  }

  const { data, error } = await query.select();

  if (error) {
    return { success: false, error: `Failed to bulk unrelease feedback: ${error.message}` };
  }

  return { success: true, data: data?.length || 0 };
}

export async function deleteAllFeedback() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database configuration error' };
  }

  const { error } = await supabase
    .from('peer_feedback')
    .delete()
    .gt('created_at', '1900-01-01T00:00:00.000Z'); // Delete all records

  if (error) {
    return { success: false, error: `Failed to delete all feedback: ${error.message}` };
  }

  return { success: true, data: null };
}
