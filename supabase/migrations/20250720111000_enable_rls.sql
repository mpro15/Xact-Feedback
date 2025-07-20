-- Enable RLS for all main tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_logins ENABLE ROW LEVEL SECURITY;
-- Add other tables here if needed
-- END OF FILE
