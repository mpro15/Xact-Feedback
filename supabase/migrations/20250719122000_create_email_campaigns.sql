-- Migration: Create email_campaigns table for feedback delivery tracking
-- Note: Table already exists with different structure, only add indexes if columns exist

-- Check if table exists with the expected structure and add indexes conditionally
DO $$
BEGIN
  -- Only create indexes if the columns exist in the current table structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'email_campaigns' 
    AND column_name = 'candidate_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_email_campaigns_candidate_id ON email_campaigns(candidate_id);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'email_campaigns' 
    AND column_name = 'feedback_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_email_campaigns_feedback_id ON email_campaigns(feedback_id);
  END IF;
  
  -- If the table doesn't exist at all, create the original structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_campaigns'
  ) THEN
    CREATE TABLE email_campaigns (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
      feedback_id uuid REFERENCES feedback(id) ON DELETE CASCADE,
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      status text NOT NULL DEFAULT 'sent',
      sent_at timestamptz DEFAULT now(),
      email text NOT NULL,
      feedback_pdf_url text,
      opens integer DEFAULT 0,
      clicks integer DEFAULT 0
    );
    CREATE INDEX idx_email_campaigns_candidate_id ON email_campaigns(candidate_id);
    CREATE INDEX idx_email_campaigns_feedback_id ON email_campaigns(feedback_id);
  END IF;
END $$;
