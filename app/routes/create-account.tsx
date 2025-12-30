import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { createStudent } from '~/services/student.service';
import styles from './create-account.module.css';

const SECTIONS = [
  'COMM 1100-012D',
  'COMM 1100-013D',
  'COMM 1100-014D',
  'COMM 1100-017D',
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [section, setSection] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    section?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate full name
    const nameParts = fullName.trim().split(/\s+/);
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (nameParts.length < 2) {
      newErrors.fullName = 'Full name must contain at least two words.';
    }

    // Validate section
    if (!section) {
      newErrors.section = 'Please select a section.';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Validate full name has at least two words
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setError('Full name must contain at least two words (e.g., First Last).');
      setIsSubmitting(false);
      return;
    }

    // Validate section is one of the allowed values
    if (!SECTIONS.includes(section)) {
      setError('Please select a valid section.');
      setIsSubmitting(false);
      return;
    }

    // Validate password is provided
    if (!password || password.trim().length === 0) {
      setError('Password is required.');
      setIsSubmitting(false);
      return;
    }

    // Create the student account
    const result = await createStudent(fullName.trim(), section, password);

    if (!result.success) {
      setError(result.error || 'Failed to create account');
      setIsSubmitting(false);
      return;
    }

    // Redirect to login with success message
    navigate('/login?message=Account+created.+Please+log+in.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            Sign up to start submitting feedback
            <br />
            Enter your name exactly as it appears on the class roster.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className={styles.input}
              required
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <span className={styles.errorText}>{errors.fullName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="section" className={styles.label}>
              Section *
            </label>
            <select
              id="section"
              name="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className={styles.select}
              required
              disabled={isSubmitting}
            >
              <option value="">Select your section</option>
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
            {errors.section && (
              <span className={styles.errorText}>{errors.section}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className={styles.input}
              required
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <a href="/login" className={styles.link}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
