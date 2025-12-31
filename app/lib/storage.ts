/**
 * Client-side localStorage service for peer feedback
 * No backend, no authentication - all data stored locally in browser
 */

export type Rating = 'Needs Improvement' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';

export type Section = 'COMM 1100-012D' | 'COMM 1100-013D' | 'COMM 1100-014D' | 'COMM 1100-017D';

export type SpeechType = 'Introductory Speech' | 'Informative Speech' | 'Social Activism Speech' | 'Persuasive Speech';

export type PeerFeedback = {
  id: string;
  fullName: string;
  section: Section;
  speechType: SpeechType;
  preparation: Rating;
  nonverbals: Rating;
  clarity: Rating;
  interest: Rating;
  dynamism: Rating;
  comments?: string;
  createdAt: string;
};

const STORAGE_KEY = 'peer_feedback_data';

/**
 * Safely access localStorage with fallback
 */
function safeGetStorage(): PeerFeedback[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return [];
  }
}

/**
 * Safely write to localStorage
 */
function safeSaveStorage(data: PeerFeedback[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to write to localStorage:', error);
    return false;
  }
}

/**
 * Get all feedback records
 */
export function getAllFeedback(): PeerFeedback[] {
  return safeGetStorage();
}

/**
 * Add new feedback record
 */
export function addFeedback(feedback: Omit<PeerFeedback, 'id' | 'createdAt'>): { success: boolean; data?: PeerFeedback } {
  try {
    const allFeedback = safeGetStorage();
    const newFeedback: PeerFeedback = {
      ...feedback,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    allFeedback.push(newFeedback);
    const saved = safeSaveStorage(allFeedback);
    return saved ? { success: true, data: newFeedback } : { success: false };
  } catch (error) {
    console.error('Failed to add feedback:', error);
    return { success: false };
  }
}

/**
 * Get unique sections
 */
export function getUniqueSections(): Section[] {
  const allFeedback = safeGetStorage();
  const sections = new Set(allFeedback.map(f => f.section));
  return Array.from(sections).sort();
}

/**
 * Get unique student names
 */
export function getUniqueStudentNames(): string[] {
  const allFeedback = safeGetStorage();
  const names = new Set(allFeedback.map(f => f.fullName));
  return Array.from(names).sort();
}

/**
 * Get unique speech types
 */
export function getUniqueSpeechTypes(): SpeechType[] {
  const allFeedback = safeGetStorage();
  const types = new Set(allFeedback.map(f => f.speechType));
  return Array.from(types).sort();
}

/**
 * Filter feedback by criteria
 */
export function filterFeedback(filters: {
  section?: Section;
  studentName?: string;
  speechType?: SpeechType;
}): PeerFeedback[] {
  let feedback = safeGetStorage();
  
  if (filters.section) {
    feedback = feedback.filter(f => f.section === filters.section);
  }
  if (filters.studentName) {
    feedback = feedback.filter(f => f.fullName === filters.studentName);
  }
  if (filters.speechType) {
    feedback = feedback.filter(f => f.speechType === filters.speechType);
  }
  
  return feedback;
}

/**
 * Get feedback count for today by student name and section
 */
export function getTodayFeedbackCount(fullName: string, section: Section): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const allFeedback = safeGetStorage();
  return allFeedback.filter(f => {
    const feedbackDate = new Date(f.createdAt);
    return f.fullName === fullName && 
           f.section === section && 
           feedbackDate >= today && 
           feedbackDate < tomorrow;
  }).length;
}

/**
 * Delete all feedback (instructor only)
 */
export function deleteAllFeedback(): { success: boolean } {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete feedback:', error);
    return { success: false };
  }
}

/**
 * Export to CSV format
 */
export function exportToCSV(feedback: PeerFeedback[]): string {
  const headers = [
    'Student Name',
    'Section',
    'Speech Type',
    'Preparation',
    'Nonverbals',
    'Clarity',
    'Interest',
    'Dynamism',
    'Comments',
    'Submitted At'
  ];
  
  const escapeCSV = (field: string) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };
  
  const rows = feedback.map(f => [
    f.fullName,
    f.section,
    f.speechType,
    f.preparation,
    f.nonverbals,
    f.clarity,
    f.interest,
    f.dynamism,
    f.comments || '',
    new Date(f.createdAt).toLocaleString('en-US')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
