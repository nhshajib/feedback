import { Form, Link } from "react-router";
import { Button } from "./ui/button/button";
import styles from "./student-banner.module.css";

interface StudentBannerProps {
  student: {
    full_name: string;
    section: string;
  };
}

export function StudentBanner({ student }: StudentBannerProps) {

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.info}>
          Logged in as: <strong>{student.full_name}</strong> —{" "}
          <strong>{student.section}</strong>
        </span>
        <div className={styles.actions}>
          <Button
            variant="link"
            size="sm"
            asChild
            className={styles.navButton}
          >
            <Link to="/submit-feedback">Submit Feedback</Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            asChild
            className={styles.navButton}
          >
            <Link to="/view-feedback">View Feedback</Link>
          </Button>
          <Form method="post" action="/logout" style={{ display: 'inline' }}>
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className={styles.changeButton}
            >
              Log out
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
