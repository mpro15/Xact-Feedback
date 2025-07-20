-- Disable RLS for all main tables to allow unrestricted access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_logins DISABLE ROW LEVEL SECURITY;
-- Add other tables here if needed
-- END OF FILE
