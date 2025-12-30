// Client-side authentication utilities

export interface SessionStudent {
  id: string;
  full_name: string;
  section: string;
}

const SESSION_KEY = 'student_session';
const INSTRUCTOR_KEY = 'instructor_auth';
const INSTRUCTOR_PASSWORD_KEY = 'instructor_password';

function hasLocalStorage(): boolean {
  // Guard against server-side rendering where localStorage is not defined
  return typeof localStorage !== 'undefined';
}

export function setStudentSession(student: SessionStudent): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(student));
}

export function getStudentSession(): SessionStudent | null {
  if (!hasLocalStorage()) return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearStudentSession(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function setInstructorAuth(password: string): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(INSTRUCTOR_KEY, 'authenticated');
  localStorage.setItem(INSTRUCTOR_PASSWORD_KEY, password);
}

export function getInstructorPassword(): string | null {
  if (!hasLocalStorage()) return null;
  return localStorage.getItem(INSTRUCTOR_PASSWORD_KEY);
}

export function isInstructorAuthenticated(): boolean {
  if (!hasLocalStorage()) return false;
  return localStorage.getItem(INSTRUCTOR_KEY) === 'authenticated';
}

export function clearInstructorAuth(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(INSTRUCTOR_KEY);
  localStorage.removeItem(INSTRUCTOR_PASSWORD_KEY);
}

export function getEnvironmentPassword(): string {
  // In a real SPA deployment, this would come from a build-time environment variable
  // or a public configuration endpoint
  return import.meta.env.VITE_INSTRUCTOR_PASSWORD || 'admin123';
}
