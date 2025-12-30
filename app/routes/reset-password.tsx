import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { resetStudentPassword } from "../services/student.service";
import styles from "./reset-password.module.css";

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const newPassword = formData.get("newPassword") as string;

    const result = await resetStudentPassword(fullName, newPassword);

    if (!result.success) {
      setError(result.error || 'Failed to reset password');
      setIsSubmitting(false);
      return;
    }

    // Redirect to login with success message in URL
    navigate("/login?message=Password+reset.+Please+log+in.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your details to reset your password</p>
        </div>

        <Alert style={{ marginBottom: "var(--space-6)" }}>
          <AlertDescription>
            Password reset does not allow changes to your name or section. If your
            name or section was entered incorrectly, contact the instructor.
          </AlertDescription>
        </Alert>

        <form
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
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={styles.input}
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Remember your password?{" "}
            <Link to="/login" className={styles.footerLink}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
