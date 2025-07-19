-- Migration: Scheduled retry for email_campaigns with status 'retrying'

-- Function to process email retries
CREATE OR REPLACE FUNCTION process_email_campaign_retries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  backoff INTERVAL := INTERVAL '5 minutes';
BEGIN
  FOR r IN SELECT * FROM email_campaigns
    WHERE status = 'retrying'
      AND attempt_count < 3
      AND (last_attempt IS NULL OR last_attempt < now() - backoff)
  LOOP
    -- Call internal email sender (replace with your function or RPC)
    PERFORM send_feedback(r.candidate_id, r.feedback_id);
    -- Increment attempt_count and update status
    UPDATE email_campaigns
      SET attempt_count = attempt_count + 1,
          last_attempt = now(),
          status = CASE WHEN attempt_count + 1 >= 3 THEN 'failed' ELSE 'retrying' END
      WHERE id = r.id;
  END LOOP;
END;
$$;

-- Schedule with pg_cron every 5 minutes
SELECT cron.schedule('email_campaigns_retry', '*/5 * * * *', $$CALL process_email_campaign_retries();$$);
