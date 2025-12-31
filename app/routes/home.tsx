import { Link } from "react-router";
import { MessageSquare, BarChart3 } from "lucide-react";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Public Speaking Peer Feedback</h1>
          <p className={styles.subtitle}>
            Share thoughtful feedback. Learn from your peers. Improve your speaking.
          </p>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        <Link to="/submit-feedback" className={styles.cardLink}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <MessageSquare size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.cardTitle}>Submit Feedback</h2>
            <p className={styles.cardDescription}>
              Provide constructive feedback for your classmates' speeches.
            </p>
            <div className={styles.cardButton}>
              Submit Feedback
            </div>
          </div>
        </Link>

        <Link to="/view-feedback" className={styles.cardLink}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <BarChart3 size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.cardTitle}>View Feedback</h2>
            <p className={styles.cardDescription}>
              See anonymous peer feedback on presentations.
            </p>
            <div className={styles.cardButton}>
              View Feedback
            </div>
          </div>
        </Link>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          All feedback is anonymous. Please be respectful and constructive.
        </p>
        <Link to="/instructor" className={styles.instructorLink}>
          Instructor Dashboard
        </Link>
      </div>
    </div>
  );
}
