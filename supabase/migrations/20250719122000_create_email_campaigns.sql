-- Migration: Create email_campaigns table for feedback delivery tracking
CREATE TABLE IF NOT EXISTS email_campaigns (
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
-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_email_campaigns_candidate_id ON email_campaigns(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_feedback_id ON email_campaigns(feedback_id);
