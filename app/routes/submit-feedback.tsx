import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group/radio-group";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { Card } from "~/components/ui/card/card";
import { CheckCircle2, AlertCircle, Edit2, ArrowLeft } from "lucide-react";
import styles from "./submit-feedback.module.css";
import { supabase, type FeedbackSubmission } from "~/lib/supabase";

const STUDENT_NAME_KEY = "peer_feedback_student_name";
const STUDENT_SECTION_KEY = "peer_feedback_student_section";

const sections = [
  "COMM 1100-012D",
  "COMM 1100-013D",
  "COMM 1100-014D",
  "COMM 1100-017D",
];

const speechTypes = [
  "Introductory Speech",
  "Informative Speech",
  "Social Activism Speech",
  "Persuasive Speech",
];

const ratingOptions = [
  { value: "needs_improvement", label: "Needs Improvement" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "very_good", label: "Very Good" },
  { value: "excellent", label: "Excellent" },
];

export default function SubmitFeedback() {
  // Student identity management (name + section)
  const [studentName, setStudentName] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempSection, setTempSection] = useState("");

  // Daily feedback counter
  const [todayCount, setTodayCount] = useState(0);

  // Form fields
  const [presenterName, setPresenterName] = useState("");
  const [speechType, setSpeechType] = useState("");
  const [preparation, setPreparation] = useState("");
  const [nonverbals, setNonverbals] = useState("");
  const [clarity, setClarity] = useState("");
  const [interest, setInterest] = useState("");
  const [dynamism, setDynamism] = useState("");
  const [comments, setComments] = useState("");

  // UI state
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for autofocus
  const presenterNameRef = useRef<HTMLInputElement>(null);

  // Load student identity from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem(STUDENT_NAME_KEY);
    const savedSection = localStorage.getItem(STUDENT_SECTION_KEY);
    if (savedName && savedSection) {
      setStudentName(savedName);
      setStudentSection(savedSection);
      loadTodayCount(savedName);
    } else {
      setIsEditingIdentity(true);
    }
  }, []);

  // Load today's feedback count
  const loadTodayCount = async (name: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count, error } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('student_name', name)
        .gte('created_at', todayISO);

      if (error) {
        console.error('Error loading today count:', error);
        return;
      }

      setTodayCount(count || 0);
    } catch (err) {
      console.error('Error loading today count:', err);
    }
  };

  // Save student identity
  const handleSaveIdentity = () => {
    if (!tempName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!tempSection) {
      setError("Please select your section");
      return;
    }
    const name = tempName.trim();
    setStudentName(name);
    setStudentSection(tempSection);
    localStorage.setItem(STUDENT_NAME_KEY, name);
    localStorage.setItem(STUDENT_SECTION_KEY, tempSection);
    setIsEditingIdentity(false);
    setError(null);
    loadTodayCount(name);
  };

  // Edit student identity
  const handleEditIdentity = () => {
    setTempName(studentName);
    setTempSection(studentSection);
    setIsEditingIdentity(true);
  };

  // Cancel identity edit
  const handleCancelEdit = () => {
    setTempName("");
    setTempSection("");
    setIsEditingIdentity(false);
    if (!studentName || !studentSection) {
      setIsEditingIdentity(true); // Keep editing mode if identity not set
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!studentName.trim() || !studentSection) {
      setError("Student identity is required. Please set your name and section first.");
      setIsSubmitting(false);
      return;
    }
    if (!presenterName.trim()) {
      setError("Presenter name is required");
      setIsSubmitting(false);
      return;
    }
    if (!speechType) {
      setError("Speech type is required");
      setIsSubmitting(false);
      return;
    }
    if (!preparation || !nonverbals || !clarity || !interest || !dynamism) {
      setError("All rating fields are required");
      setIsSubmitting(false);
      return;
    }

    // Prepare feedback submission
    const feedback: FeedbackSubmission = {
      student_name: studentName.trim(),
      full_name: presenterName.trim(),
      section: studentSection,
      speech_type: speechType,
      preparation,
      nonverbals,
      clarity,
      interest,
      dynamism,
      additional_comments: comments.trim() || undefined,
    };

    // Submit to Supabase
    const { error: insertError } = await supabase
      .from('feedback')
      .insert([feedback]);

    if (insertError) {
      setError(`Error submitting feedback: ${insertError.message}`);
      setIsSubmitting(false);
      return;
    }

    // Show success message
    setSuccess(true);
    setIsSubmitting(false);

    // Update today count
    setTodayCount(todayCount + 1);

    // Clear only: Presenter Name, Ratings, Additional Comments
    // Keep: Student Name, Student Section, Speech Type
    setPresenterName("");
    setPreparation("");
    setNonverbals("");
    setClarity("");
    setInterest("");
    setDynamism("");
    setComments("");

    // Autofocus presenter name field for next entry
    setTimeout(() => {
      presenterNameRef.current?.focus();
    }, 100);

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <h1 className={styles.title}>Submit Peer Feedback</h1>
        <p className={styles.subtitle}>
          Quick feedback during live presentations
        </p>
      </div>

      {/* Student Identity Card */}
      <Card className={styles.identityCard}>
        {isEditingIdentity ? (
          <div className={styles.identityEdit}>
            <h3 className={styles.identityTitle}>Your Information</h3>
            <div className={styles.identityFields}>
              <div className={styles.identityField}>
                <Label htmlFor="studentName">Your Name *</Label>
                <Input
                  id="studentName"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
              <div className={styles.identityField}>
                <Label htmlFor="studentSection">Your Section *</Label>
                <Select value={tempSection} onValueChange={setTempSection}>
                  <SelectTrigger id="studentSection">
                    <SelectValue placeholder="Select your section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className={styles.identityActions}>
              <Button type="button" onClick={handleSaveIdentity}>
                Save & Continue
              </Button>
              {studentName && studentSection && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.identityDisplay}>
            <div className={styles.identityInfo}>
              <div className={styles.identityRow}>
                <span className={styles.identityLabel}>Student:</span>
                <span className={styles.identityValue}>{studentName}</span>
              </div>
              <div className={styles.identityRow}>
                <span className={styles.identityLabel}>Section:</span>
                <span className={styles.identityValue}>{studentSection}</span>
              </div>
              <button
                type="button"
                onClick={handleEditIdentity}
                className={styles.changeButton}
                title="Change information"
              >
                <Edit2 size={14} />
                Change
              </button>
            </div>
            <div className={styles.counterBadge}>
              <span className={styles.counterLabel}>Today's feedback:</span>
              <span className={styles.counterValue}>{todayCount} / 5</span>
            </div>
          </div>
        )}
      </Card>

      {success && (
        <Alert className={styles.successAlert}>
          <CheckCircle2 className={styles.alertIcon} />
          <AlertDescription>
            ✓ Feedback submitted! Ready for next presenter.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className={styles.errorAlert}>
          <AlertCircle className={styles.alertIcon} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Presenter & Speech Type - Compact Row */}
        <div className={styles.topRow}>
          <div className={styles.topField}>
            <Label htmlFor="presenterName">Presenter Name *</Label>
            <Input
              ref={presenterNameRef}
              id="presenterName"
              value={presenterName}
              onChange={(e) => setPresenterName(e.target.value)}
              placeholder="Next presenter's name"
              required
            />
          </div>

          <div className={styles.topField}>
            <Label htmlFor="speechType">Speech Type *</Label>
            <Select value={speechType} onValueChange={setSpeechType}>
              <SelectTrigger id="speechType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {speechTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rating Questions Card */}
        <Card className={styles.ratingsCard}>
          <h2 className={styles.cardTitle}>Rate the Presentation</h2>
          
          <div className={styles.ratingsGrid}>
            {/* Preparation */}
            <div className={styles.ratingRow}>
              <Label className={styles.questionLabel}>
                Preparation – How well prepared was the speaker? *
              </Label>
              <RadioGroup value={preparation} onValueChange={setPreparation}>
                <div className={styles.horizontalRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className={styles.ratingOption}>
                      <RadioGroupItem value={option.value} id={`prep-${option.value}`} />
                      <Label htmlFor={`prep-${option.value}`} className={styles.optionLabel}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Nonverbals */}
            <div className={styles.ratingRow}>
              <Label className={styles.questionLabel}>
                Nonverbals – How effective were body language and eye contact? *
              </Label>
              <RadioGroup value={nonverbals} onValueChange={setNonverbals}>
                <div className={styles.horizontalRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className={styles.ratingOption}>
                      <RadioGroupItem value={option.value} id={`nonverb-${option.value}`} />
                      <Label htmlFor={`nonverb-${option.value}`} className={styles.optionLabel}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Clarity */}
            <div className={styles.ratingRow}>
              <Label className={styles.questionLabel}>
                Clarity – Was the message clear and easy to understand? *
              </Label>
              <RadioGroup value={clarity} onValueChange={setClarity}>
                <div className={styles.horizontalRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className={styles.ratingOption}>
                      <RadioGroupItem value={option.value} id={`clarity-${option.value}`} />
                      <Label htmlFor={`clarity-${option.value}`} className={styles.optionLabel}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Interest */}
            <div className={styles.ratingRow}>
              <Label className={styles.questionLabel}>
                Interest – How engaging was the presentation? *
              </Label>
              <RadioGroup value={interest} onValueChange={setInterest}>
                <div className={styles.horizontalRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className={styles.ratingOption}>
                      <RadioGroupItem value={option.value} id={`interest-${option.value}`} />
                      <Label htmlFor={`interest-${option.value}`} className={styles.optionLabel}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Dynamism */}
            <div className={styles.ratingRow}>
              <Label className={styles.questionLabel}>
                Dynamism – Was the delivery energetic and enthusiastic? *
              </Label>
              <RadioGroup value={dynamism} onValueChange={setDynamism}>
                <div className={styles.horizontalRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className={styles.ratingOption}>
                      <RadioGroupItem value={option.value} id={`dynamism-${option.value}`} />
                      <Label htmlFor={`dynamism-${option.value}`} className={styles.optionLabel}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Additional Comments */}
        <div className={styles.commentsField}>
          <Label htmlFor="comments">Additional Comments (Optional)</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Any additional constructive feedback..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting || !studentName || !studentSection}
            className={styles.submitButton}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </form>
    </div>
  );
}
