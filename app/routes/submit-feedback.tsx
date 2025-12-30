import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StudentBanner } from "~/components/student-banner";
import { Button } from "~/components/ui/button/button";
import { Label } from "~/components/ui/label/label";
import { Textarea } from "~/components/ui/textarea/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select/select";
import { Alert, AlertDescription } from "~/components/ui/alert/alert";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover/popover";
import { submitFeedback, getTodayFeedbackCount, getDistinctPresenters } from "~/services/feedback.service";
import { getStudentSession } from "~/lib/auth.client";
import { Check, ChevronsUpDown } from "lucide-react";
import type { RatingOption } from "~/lib/supabase";
import styles from "./submit-feedback.module.css";

const RATING_OPTIONS: RatingOption[] = [
  'Needs Improvement',
  'Fair',
  'Good',
  'Very Good',
  'Excellent'
];

export default function SubmitFeedback() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(getStudentSession());
  const [speechType, setSpeechType] = useState<string>("Introductory Speech");
  const [presenterName, setPresenterName] = useState("");
  const [open, setOpen] = useState(false);
  const [preparation, setPreparation] = useState<RatingOption | ''>('');
  const [nonverbals, setNonverbals] = useState<RatingOption | ''>('');
  const [clarity, setClarity] = useState<RatingOption | ''>('');
  const [interest, setInterest] = useState<RatingOption | ''>('');
  const [dynamism, setDynamism] = useState<RatingOption | ''>('');
  const [additionalComments, setAdditionalComments] = useState("");
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [presenters, setPresenters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!student) {
      navigate("/login");
    }
  }, [student, navigate]);

  // Load initial data
  useEffect(() => {
    if (!student) return;

    const loadData = async () => {
      const [feedbackCountResult, presentersResult] = await Promise.all([
        getTodayFeedbackCount(student.full_name, student.section),
        getDistinctPresenters()
      ]);

      if (feedbackCountResult.success) {
        setFeedbackCount(feedbackCountResult.data);
      }

      if (presentersResult.success) {
        setPresenters(presentersResult.data);
      }
    };

    loadData();
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!speechType || !presenterName || !preparation || !nonverbals || !clarity || !interest || !dynamism) {
      setError("Please answer all five evaluation questions before submitting.");
      return;
    }

    setIsSubmitting(true);

    const result = await submitFeedback({
      student_name: student.full_name,
      section: student.section,
      speech_type: speechType,
      presenter_name: presenterName,
      preparation,
      nonverbals,
      clarity,
      interest,
      dynamism,
      additional_comments: additionalComments || undefined,
    });

    if (!result.success) {
      setError(result.error || "Failed to submit feedback");
      setIsSubmitting(false);
      return;
    }

    setSuccess("Feedback submitted. You may submit another.");
    
    // Clear form fields after successful submission and increment counter
    setPresenterName("");
    setSpeechType("Introductory Speech");
    setPreparation('');
    setNonverbals('');
    setClarity('');
    setInterest('');
    setDynamism('');
    setAdditionalComments("");
    setFeedbackCount(prev => prev + 1);
    setIsSubmitting(false);
  };

  if (!student) {
    return null;
  }
  
  // Check if all required fields are filled
  const isFormValid = presenterName.trim() !== '' && preparation !== '' && nonverbals !== '' && clarity !== '' && interest !== '' && dynamism !== '';

  return (
    <>
      <StudentBanner student={student} />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Submit Feedback</h1>
          
          <div className={styles.counter}>
            Feedback submitted today: {feedbackCount} / 5
          </div>
          
          {success && (
            <Alert className={styles.successAlert}>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className={styles.errorAlert}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className={styles.guidanceBox}>
            <ul className={styles.guidanceList}>
              <li>Be specific and constructive.</li>
              <li>Focus on observable behaviors, not the person.</li>
              <li>Write feedback you would find helpful yourself.</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Speech Type */}
            <div className={styles.field}>
              <Label htmlFor="speech_type">Speech Type</Label>
              <Select 
                name="speech_type" 
                value={speechType} 
                onValueChange={setSpeechType}
                required
              >
                <SelectTrigger id="speech_type">
                  <SelectValue placeholder="Select speech type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Introductory Speech">Introductory Speech</SelectItem>
                  <SelectItem value="Informative Speech">Informative Speech</SelectItem>
                  <SelectItem value="Social Activism Speech">Social Activism Speech</SelectItem>
                  <SelectItem value="Persuasive Speech">Persuasive Speech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Presenter Name */}
            <div className={styles.field}>
              <Label htmlFor="presenter_name">Presenter Name</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={styles.comboboxTrigger}
                  >
                    <span className={styles.comboboxValue}>
                      {presenterName || "Type or select a name..."}
                    </span>
                    <ChevronsUpDown className={styles.comboboxIcon} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={styles.comboboxPopover} align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search or type a name..." 
                      value={presenterName}
                      onValueChange={setPresenterName}
                    />
                    <CommandList>
                      <CommandEmpty>
                        Press Enter to use "{presenterName}"
                      </CommandEmpty>
                      <CommandGroup>
                        {presenters
                          .filter(name => 
                            name.toLowerCase().includes(presenterName.toLowerCase())
                          )
                          .map((name) => (
                            <CommandItem
                              key={name}
                              value={name}
                              onSelect={(currentValue) => {
                                setPresenterName(currentValue);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={styles.checkIcon}
                                style={{ opacity: presenterName === name ? 1 : 0 }}
                              />
                              {name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Rating Questions */}
            <div className={styles.field}>
              <Label htmlFor="preparation">Preparation — How well prepared was the speaker? *</Label>
              <Select 
                name="preparation" 
                value={preparation} 
                onValueChange={(value) => setPreparation(value as RatingOption)}
                required
              >
                <SelectTrigger id="preparation">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <Label htmlFor="nonverbals">Nonverbals — How effective were the speaker's body language and eye contact? *</Label>
              <Select 
                name="nonverbals" 
                value={nonverbals} 
                onValueChange={(value) => setNonverbals(value as RatingOption)}
                required
              >
                <SelectTrigger id="nonverbals">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <Label htmlFor="clarity">Clarity — Was the speaker's message clear and easy to understand? *</Label>
              <Select 
                name="clarity" 
                value={clarity} 
                onValueChange={(value) => setClarity(value as RatingOption)}
                required
              >
                <SelectTrigger id="clarity">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <Label htmlFor="interest">Interest — How interesting and engaging was the presentation? *</Label>
              <Select 
                name="interest" 
                value={interest} 
                onValueChange={(value) => setInterest(value as RatingOption)}
                required
              >
                <SelectTrigger id="interest">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <Label htmlFor="dynamism">Dynamism — Did the speaker deliver with energy and enthusiasm? *</Label>
              <Select 
                name="dynamism" 
                value={dynamism} 
                onValueChange={(value) => setDynamism(value as RatingOption)}
                required
              >
                <SelectTrigger id="dynamism">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Comments */}
            <div className={styles.field}>
              <Label htmlFor="additional_comments">Additional Comments (Optional)</Label>
              <p className={styles.helpText}>
                Please use the space below to provide any extra feedback, suggestions, or specific observations that may help the speaker improve.
              </p>
              <Textarea
                id="additional_comments"
                name="additional_comments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows={6}
              />
            </div>

            <Button type="submit" size="lg" className={styles.submitButton} disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
