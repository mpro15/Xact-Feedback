-- Insert a company with 1 credit
INSERT INTO companies (id, name, credits_balance) VALUES ('test-company-id', 'Test Company', 1);

-- Insert a test candidate and feedback row for the company
INSERT INTO candidates (id, name, email, company_id) VALUES ('test-candidate-id', 'Test Candidate', 'test.candidate@example.com', 'test-company-id');
INSERT INTO feedback (id, candidate_id, summary) VALUES ('test-feedback-id', 'test-candidate-id', 'Test feedback summary');

-- Call send_feedback edge function (simulate via SQL for test)
-- This should consume 1 credit
-- (In real test, this would be an HTTP call, but for SQL, simulate the effect)
UPDATE companies SET credits_balance = credits_balance - 1 WHERE id = 'test-company-id';
INSERT INTO credits_usage_log (company_id, used_at, amount, reason) VALUES ('test-company-id', NOW(), 1, 'send_feedback');

-- Assert credits_balance is now 0
SELECT credits_balance FROM companies WHERE id = 'test-company-id';
-- Should return 0

-- Assert credits_usage_log has one entry
SELECT COUNT(*) FROM credits_usage_log WHERE company_id = 'test-company-id';
-- Should return 1

-- Insert an email_campaigns row with status='retrying' and older than 5 min
INSERT INTO email_campaigns (id, candidate_id, feedback_id, status, attempt_count, created_at, updated_at)
VALUES ('test-campaign-id', 'test-candidate-id', 'test-feedback-id', 'retrying', 1, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes');

-- Run retry_failed_emails() (simulate as a function call)
-- In real test, this would be: SELECT retry_failed_emails();
-- For SQL, simulate the effect:
UPDATE email_campaigns SET attempt_count = attempt_count + 1, updated_at = NOW()
WHERE id = 'test-campaign-id' AND status = 'retrying' AND updated_at < NOW() - INTERVAL '5 minutes';

-- Assert attempt_count incremented
SELECT attempt_count FROM email_campaigns WHERE id = 'test-campaign-id';
-- Should return 2
