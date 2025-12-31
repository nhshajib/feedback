-- Create the feedback table in Supabase
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  section TEXT NOT NULL,
  speech_type TEXT NOT NULL,
  preparation TEXT NOT NULL,
  nonverbals TEXT NOT NULL,
  clarity TEXT NOT NULL,
  interest TEXT NOT NULL,
  dynamism TEXT NOT NULL,
  additional_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_feedback_student_name ON public.feedback(student_name);
CREATE INDEX idx_feedback_section ON public.feedback(section);
CREATE INDEX idx_feedback_speech_type ON public.feedback(speech_type);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to insert feedback (no authentication required)
CREATE POLICY "Allow public insert" ON public.feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a policy to allow anyone to read feedback (for instructor dashboard)
CREATE POLICY "Allow public read" ON public.feedback
  FOR SELECT
  TO anon
  USING (true);

-- Optional: Add comments for documentation
COMMENT ON TABLE public.feedback IS 'Stores peer feedback for public speaking presentations';
COMMENT ON COLUMN public.feedback.student_name IS 'Name of the student submitting the feedback';
COMMENT ON COLUMN public.feedback.full_name IS 'Name of the presenter receiving feedback';
COMMENT ON COLUMN public.feedback.section IS 'Course section (e.g., COMM 1100-012D)';
COMMENT ON COLUMN public.feedback.speech_type IS 'Type of speech being evaluated';
