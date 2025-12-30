import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { loginStudent } from "../services/student.service";
import { setStudentSession, getStudentSession } from "~/lib/auth.client";
import styles from "./login.module.css";

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const successMessage = searchParams.get("message");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const student = getStudentSession();
    if (student) {
      navigate("/submit-feedback");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    const result = await loginStudent(fullName, password);

    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
      return;
    }

    // Store session client-side
    setStudentSession({
      id: result.data.id,
      full_name: result.data.full_name,
      section: result.data.section,
    });

    // Navigate to submit feedback page
    navigate("/submit-feedback");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form
          method="post"
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={styles.input}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
            />
          </div>

          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
          <Link to="/reset-password" className={styles.secondaryButton}>
            Reset Password
          </Link>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/create-account" className={styles.footerLink}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
