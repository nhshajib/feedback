import { useState, type FormEvent } from "react";
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
import { CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./submit-feedback.module.css";
import { supabase, type FeedbackSubmission } from "~/lib/supabase";

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
  "Needs Improvement",
  "Fair",
  "Good",
  "Very Good",
  "Excellent",
];

export default function SubmitFeedback() {
  const [fullName, setFullName] = useState("");
  const [section, setSection] = useState("");
  const [speechType, setSpeechType] = useState("");
  const [preparation, setPreparation] = useState("");
  const [nonverbals, setNonverbals] = useState("");
  const [clarity, setClarity] = useState("");
  const [interest, setInterest] = useState("");
  const [dynamism, setDynamism] = useState("");
  const [comments, setComments] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      setIsSubmitting(false);
      return;
    }
    if (!section) {
      setError("Section is required");
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
      full_name: fullName.trim(),
      section,
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

    // Reset form
    setFullName("");
    setSection("");
    setSpeechType("");
    setPreparation("");
    setNonverbals("");
    setClarity("");
    setInterest("");
    setDynamism("");
    setComments("");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit Peer Feedback</h1>
        <p className={styles.subtitle}>
          Provide constructive feedback for your classmate's speech
        </p>
      </div>

      {success && (
        <Alert className={styles.successAlert}>
          <CheckCircle2 className={styles.alertIcon} />
          <AlertDescription>
            Feedback submitted successfully.
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
        {/* Full Name */}
        <div className={styles.field}>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Section */}
        <div className={styles.field}>
          <Label htmlFor="section">Section *</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger id="section">
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

        {/* Speech Type */}
        <div className={styles.field}>
          <Label htmlFor="speechType">Speech Type *</Label>
          <Select value={speechType} onValueChange={setSpeechType}>
            <SelectTrigger id="speechType">
              <SelectValue placeholder="Select speech type" />
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

        <div className={styles.divider} />

        {/* Rating Questions */}
        <div className={styles.ratingsSection}>
          <h2 className={styles.sectionTitle}>Rate the Speech</h2>

          {/* Preparation */}
          <div className={styles.ratingField}>
            <Label className={styles.ratingLabel}>Preparation *</Label>
            <RadioGroup value={preparation} onValueChange={setPreparation}>
              <div className={styles.radioOptions}>
                {ratingOptions.map((option) => (
                  <div key={option} className={styles.radioItem}>
                    <RadioGroupItem value={option} id={`prep-${option}`} />
                    <Label htmlFor={`prep-${option}`} className={styles.radioOptionLabel}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Nonverbals */}
          <div className={styles.ratingField}>
            <Label className={styles.ratingLabel}>Nonverbals *</Label>
            <RadioGroup value={nonverbals} onValueChange={setNonverbals}>
              <div className={styles.radioOptions}>
                {ratingOptions.map((option) => (
                  <div key={option} className={styles.radioItem}>
                    <RadioGroupItem value={option} id={`nonverb-${option}`} />
                    <Label htmlFor={`nonverb-${option}`} className={styles.radioOptionLabel}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Clarity */}
          <div className={styles.ratingField}>
            <Label className={styles.ratingLabel}>Clarity *</Label>
            <RadioGroup value={clarity} onValueChange={setClarity}>
              <div className={styles.radioOptions}>
                {ratingOptions.map((option) => (
                  <div key={option} className={styles.radioItem}>
                    <RadioGroupItem value={option} id={`clarity-${option}`} />
                    <Label htmlFor={`clarity-${option}`} className={styles.radioOptionLabel}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Interest */}
          <div className={styles.ratingField}>
            <Label className={styles.ratingLabel}>Interest *</Label>
            <RadioGroup value={interest} onValueChange={setInterest}>
              <div className={styles.radioOptions}>
                {ratingOptions.map((option) => (
                  <div key={option} className={styles.radioItem}>
                    <RadioGroupItem value={option} id={`interest-${option}`} />
                    <Label htmlFor={`interest-${option}`} className={styles.radioOptionLabel}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Dynamism */}
          <div className={styles.ratingField}>
            <Label className={styles.ratingLabel}>Dynamism *</Label>
            <RadioGroup value={dynamism} onValueChange={setDynamism}>
              <div className={styles.radioOptions}>
                {ratingOptions.map((option) => (
                  <div key={option} className={styles.radioItem}>
                    <RadioGroupItem value={option} id={`dynamism-${option}`} />
                    <Label htmlFor={`dynamism-${option}`} className={styles.radioOptionLabel}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Additional Comments */}
        <div className={styles.field}>
          <Label htmlFor="comments">Additional Comments (Optional)</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide any additional constructive feedback..."
            rows={5}
          />
        </div>

        {/* Submit Button */}
        <div className={styles.actions}>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </form>
    </div>
  );
}
