import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '~/components/ui/card/card';
import { Button } from '~/components/ui/button/button';
import { ArrowLeft } from 'lucide-react';
import { supabase, type FeedbackSubmission } from '~/lib/supabase';
import styles from './instructor-dashboard.module.css';

const sections = [
  'COMM 1100-012D',
  'COMM 1100-013D',
  'COMM 1100-014D',
  'COMM 1100-017D',
];

const speechTypes = [
  'Introductory Speech',
  'Informative Speech',
  'Social Activism Speech',
  'Persuasive Speech',
];

const ratingLabels: Record<string, string> = {
  'needs_improvement': 'Needs Improvement',
  'fair': 'Fair',
  'good': 'Good',
  'very_good': 'Very Good',
  'excellent': 'Excellent',
};

export default function ViewFeedback() {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSpeechType, setSelectedSpeechType] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch feedback when both filters are selected
  useEffect(() => {
    if (selectedSection && selectedSpeechType) {
      fetchFeedback();
    } else {
      setFeedback([]);
    }
  }, [selectedSection, selectedSpeechType]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('section', selectedSection)
        .eq('speech_type', selectedSpeechType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    setSelectedSpeechType(''); // Reset speech type when section changes
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRating = (rating: string): string => {
    return ratingLabels[rating] || rating;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <h1 className={styles.title}>View Feedback</h1>
        <p className={styles.subtitle}>Anonymous peer feedback for presentations</p>
      </div>

      {/* Step 1: Section Selection */}
      <Card className={styles.filterCard}>
        <h2 className={styles.filterTitle}>Step 1: Select Section</h2>
        <div className={styles.sectionGrid}>
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => handleSectionSelect(section)}
              className={`${styles.sectionButton} ${
                selectedSection === section ? styles.active : ''
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </Card>

      {/* Step 2: Speech Type Selection (only shown when section is selected) */}
      {selectedSection && (
        <Card className={styles.filterCard}>
          <h2 className={styles.filterTitle}>Step 2: Select Speech Type</h2>
          <div className={styles.speechTypeGrid}>
            {speechTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedSpeechType(type)}
                className={`${styles.speechTypeButton} ${
                  selectedSpeechType === type ? styles.active : ''
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 3: Feedback Display */}
      {selectedSection && selectedSpeechType && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              Feedback for {selectedSection} - {selectedSpeechType}
            </h2>
            <p className={styles.resultsCount}>
              {feedback.length} {feedback.length === 1 ? 'response' : 'responses'}
            </p>
          </div>

          {loading ? (
            <Card className={styles.loadingCard}>
              <p>Loading feedback...</p>
            </Card>
          ) : feedback.length === 0 ? (
            <Card className={styles.emptyCard}>
              <p className={styles.emptyMessage}>
                No feedback available for this section and speech type yet.
              </p>
            </Card>
          ) : (
            <div className={styles.feedbackGrid}>
              {feedback.map((item) => (
                <Card key={item.id} className={styles.feedbackCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.presenterName}>Presenter: {item.full_name}</h3>
                    <p className={styles.submissionDate}>{formatDate(item.created_at!)}</p>
                  </div>

                  <div className={styles.ratingsSection}>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Preparation:</span>
                      <span className={styles.ratingValue}>{formatRating(item.preparation)}</span>
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Nonverbals:</span>
                      <span className={styles.ratingValue}>{formatRating(item.nonverbals)}</span>
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Clarity:</span>
                      <span className={styles.ratingValue}>{formatRating(item.clarity)}</span>
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Interest:</span>
                      <span className={styles.ratingValue}>{formatRating(item.interest)}</span>
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Dynamism:</span>
                      <span className={styles.ratingValue}>{formatRating(item.dynamism)}</span>
                    </div>
                  </div>

                  {item.additional_comments && (
                    <div className={styles.commentsSection}>
                      <p className={styles.commentsLabel}>Additional Comments:</p>
                      <p className={styles.commentsText}>{item.additional_comments}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
