import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select/select';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '~/lib/supabase';
import styles from './instructor-dashboard.module.css';

const sections = [
  'COMM 1100-012D',
  'COMM 1100-013D',
  'COMM 1100-014D',
  'COMM 1100-017D',
];

const ALL_SECTIONS = '__all__';

type StudentSummary = {
  studentName: string;
  section: string;
  totalFeedback: number;
  missingFeedback: number;
  finalScore: number;
};

export default function InstructorDashboard() {
  const [selectedSection, setSelectedSection] = useState<string>(ALL_SECTIONS);
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentSummaries();
  }, [selectedSection]);

  const fetchStudentSummaries = async () => {
    setLoading(true);
    try {
      // Fetch all feedback submissions
      let query = supabase
        .from('feedback')
        .select('student_name, section');

      // Apply section filter if not "all"
      if (selectedSection !== ALL_SECTIONS) {
        query = query.eq('section', selectedSection);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by student name and count
      const summaryMap = new Map<string, { section: string; count: number }>();
      
      data?.forEach((item) => {
        const key = item.student_name;
        if (summaryMap.has(key)) {
          summaryMap.get(key)!.count++;
        } else {
          summaryMap.set(key, { section: item.section, count: 1 });
        }
      });

      // Calculate grades
      const summaries: StudentSummary[] = Array.from(summaryMap.entries()).map(
        ([studentName, { section, count }]) => {
          const totalFeedback = count;
          const missingFeedback = Math.max(0, 40 - totalFeedback);
          
          // Grading logic: 30 points for 40+, subtract 4 for every 4 missing
          let finalScore = 30;
          if (totalFeedback < 40) {
            const pointsToSubtract = Math.floor(missingFeedback / 4) * 4;
            finalScore = Math.max(0, 30 - pointsToSubtract);
          }

          return {
            studentName,
            section,
            totalFeedback,
            missingFeedback,
            finalScore,
          };
        }
      );

      // Sort by student name
      summaries.sort((a, b) => a.studentName.localeCompare(b.studentName));

      setStudentSummaries(summaries);
    } catch (error) {
      console.error('Error fetching student summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <h1 className={styles.dashboardTitle}>Instructor Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Student participation and grading summary
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="section" className={styles.filterLabel}>
            Section:
          </label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger id="section" className={styles.filterSelect}>
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SECTIONS}>All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Section</th>
                <th>Total Feedback Submitted</th>
                <th>Missing Feedback</th>
                <th>Final Score (out of 30)</th>
              </tr>
            </thead>
            <tbody>
              {studentSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No feedback submissions found
                  </td>
                </tr>
              ) : (
                studentSummaries.map((student) => (
                  <tr key={`${student.studentName}-${student.section}`}>
                    <td className={styles.nameCell}>{student.studentName}</td>
                    <td>{student.section}</td>
                    <td className={styles.numberCell}>{student.totalFeedback}</td>
                    <td className={styles.numberCell}>
                      {student.missingFeedback > 0 ? student.missingFeedback : '—'}
                    </td>
                    <td className={styles.scoreCell}>{student.finalScore}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.gradingInfo}>
        <h3>Grading Logic:</h3>
        <ul>
          <li>Full credit (30 points) for 40 or more feedback submissions</li>
          <li>For every 4 missing submissions below 40, subtract 4 points</li>
          <li>Minimum score: 0 points</li>
        </ul>
      </div>
    </div>
  );
}
