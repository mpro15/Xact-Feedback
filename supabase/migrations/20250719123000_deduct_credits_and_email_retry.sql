-- Function: deduct_credits(p_company_id UUID, p_amount INT, p_feature TEXT, p_description TEXT, p_user_id UUID)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_company_id UUID,
  p_amount INT,
  p_feature TEXT,
  p_description TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE companies
    SET credits = credits - p_amount
    WHERE id = p_company_id;

  INSERT INTO credit_transactions(company_id, amount, feature, description, user_id, created_at)
    VALUES (p_company_id, p_amount, p_feature, p_description, p_user_id, now());
END;
$$ LANGUAGE plpgsql;

-- Table for credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  amount int NOT NULL,
  feature text,
  description text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Add credits column to companies if not exists
ALTER TABLE companies ADD COLUMN IF NOT EXISTS credits int DEFAULT 0;

-- Add attempt_count and last_attempt_at to email_campaigns if not exists
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS attempt_count int DEFAULT 0;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz DEFAULT now();

-- Add SMTP columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_host text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_port int;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_user text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_pass text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT false;

-- pg_cron job: retry failed email campaigns every 5 minutes
SELECT cron.schedule('retry_email_campaigns', '*/5 * * * *', $$
  DO $$
  DECLARE
    r RECORD;
    backoff INTERVAL;
  BEGIN
    FOR r IN SELECT * FROM email_campaigns WHERE status = 'retrying' AND attempt_count < 3 LOOP
      backoff := (2 ^ r.attempt_count) * INTERVAL '1 minute';
      IF now() - r.last_attempt_at >= backoff THEN
        -- Call send_feedback function (assume HTTP call via postgres extension or custom function)
        PERFORM send_feedback(r.candidate_id, r.feedback_id);
        UPDATE email_campaigns
          SET attempt_count = attempt_count + 1,
              last_attempt_at = now(),
              status = CASE WHEN attempt_count + 1 >= 3 THEN 'failed' ELSE 'retrying' END
          WHERE id = r.id;
      END IF;
    END LOOP;
  END;
  $$
$$);
