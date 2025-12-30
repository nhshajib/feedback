import { Link } from "react-router";
import { Button } from "~/components/ui/button/button";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Speech Feedback Portal</h1>
        <p className={styles.subtitle}>
          Submit and view anonymous peer feedback for public speaking presentations
        </p>
        
        <div className={styles.actions}>
          <Link to="/login">
            <Button size="lg">Student Login</Button>
          </Link>
          <Link to="/create-account">
            <Button size="lg" variant="outline">Create Account</Button>
          </Link>
          <Link to="/instructor-dashboard">
            <Button size="lg" variant="outline">Instructor Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>Submit Feedback</h3>
          <p>Provide constructive anonymous feedback on your peers' speeches</p>
        </div>
        <div className={styles.feature}>
          <h3>View Feedback</h3>
          <p>See anonymous feedback from your classmates to improve your skills</p>
        </div>
        <div className={styles.feature}>
          <h3>Track Progress</h3>
          <p>Monitor your participation and growth throughout the course</p>
        </div>
      </div>
    </div>
  );
}
