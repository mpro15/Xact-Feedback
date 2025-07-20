-- Table to log support agent logins
CREATE TABLE IF NOT EXISTS support_logins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    company_id uuid NOT NULL,
    login_time timestamptz NOT NULL,
    location text,
    logout_time timestamptz
);

-- Policy: allow support agents to insert their own login events
DROP POLICY IF EXISTS "Allow support agent insert" ON support_logins;
CREATE POLICY "Allow support agent insert"
ON support_logins
FOR INSERT
WITH CHECK (email = auth.email());

-- Policy: allow support agents to select their own login events
DROP POLICY IF EXISTS "Allow support agent select" ON support_logins;
CREATE POLICY "Allow support agent select"
ON support_logins
FOR SELECT
USING (email = auth.email());

-- Policy: allow support agents to update their own logout_time
DROP POLICY IF EXISTS "Allow support agent update" ON support_logins;
CREATE POLICY "Allow support agent update"
ON support_logins
FOR UPDATE
USING (email = auth.email());

-- Enable RLS
ALTER TABLE support_logins ENABLE ROW LEVEL SECURITY;

-- END OF FILE
