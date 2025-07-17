/*
  # Email Tracking and Retry System

  1. New Tables
    - `email_delivery_log` - Track email delivery status and failures
    - `email_retry_queue` - Queue failed emails for retry with exponential backoff
    - `email_tracking_pixels` - Track email opens via pixel tracking
    - `email_link_clicks` - Track link clicks with UTM parameters

  2. Security
    - Enable RLS on all new tables
    - Add policies for company-based access control

  3. Functions
    - Add helper functions for email tracking and retry logic
*/

-- Email delivery log table
CREATE TABLE IF NOT EXISTS email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  email_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  message_id text,
  error_message text,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Email retry queue table
CREATE TABLE IF NOT EXISTS email_retry_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  email_content jsonb NOT NULL DEFAULT '{}',
  pdf_url text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  next_retry_at timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email tracking pixels table
CREATE TABLE IF NOT EXISTS email_tracking_pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  email_id text NOT NULL,
  opened_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Email link clicks table
CREATE TABLE IF NOT EXISTS email_link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  email_id text NOT NULL,
  link_url text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  clicked_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_company_id ON email_delivery_log(company_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_candidate_id ON email_delivery_log(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_email_id ON email_delivery_log(email_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_status ON email_delivery_log(status);

CREATE INDEX IF NOT EXISTS idx_email_retry_queue_company_id ON email_retry_queue(company_id);
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_status ON email_retry_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_retry_queue_next_retry ON email_retry_queue(next_retry_at);

CREATE INDEX IF NOT EXISTS idx_email_tracking_pixels_company_id ON email_tracking_pixels(company_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_pixels_candidate_id ON email_tracking_pixels(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_pixels_email_id ON email_tracking_pixels(email_id);

CREATE INDEX IF NOT EXISTS idx_email_link_clicks_company_id ON email_link_clicks(company_id);
CREATE INDEX IF NOT EXISTS idx_email_link_clicks_candidate_id ON email_link_clicks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_link_clicks_email_id ON email_link_clicks(email_id);

-- Enable RLS
ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_retry_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_delivery_log
CREATE POLICY "Users can manage company email delivery logs"
  ON email_delivery_log
  FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

-- RLS Policies for email_retry_queue
CREATE POLICY "Users can manage company email retry queue"
  ON email_retry_queue
  FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

-- RLS Policies for email_tracking_pixels
CREATE POLICY "Users can read company email tracking"
  ON email_tracking_pixels
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

CREATE POLICY "System can insert email tracking pixels"
  ON email_tracking_pixels
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

-- RLS Policies for email_link_clicks
CREATE POLICY "Users can read company email link clicks"
  ON email_link_clicks
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

CREATE POLICY "System can insert email link clicks"
  ON email_link_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

-- Helper functions for email tracking
CREATE OR REPLACE FUNCTION increment_campaign_stat(
  email_id_param text,
  stat_column text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update email campaign stats based on email_id
  IF stat_column = 'opened_count' THEN
    UPDATE email_campaigns 
    SET opened_count = opened_count + 1
    WHERE id IN (
      SELECT campaign_id FROM email_delivery_log 
      WHERE email_id = email_id_param
    );
  ELSIF stat_column = 'clicked_count' THEN
    UPDATE email_campaigns 
    SET clicked_count = clicked_count + 1
    WHERE id IN (
      SELECT campaign_id FROM email_delivery_log 
      WHERE email_id = email_id_param
    );
  END IF;
END;
$$;

-- Function to get daily email count for rate limiting
CREATE OR REPLACE FUNCTION get_daily_email_count(company_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_count integer;
BEGIN
  SELECT COALESCE(SUM(sent_count), 0)
  INTO email_count
  FROM email_campaigns
  WHERE company_id = company_id_param
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN email_count;
END;
$$;

-- Add updated_at trigger for email_retry_queue
CREATE TRIGGER update_email_retry_queue_updated_at
  BEFORE UPDATE ON email_retry_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();