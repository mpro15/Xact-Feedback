-- Supabase RLS Policy Fixes for Xact Feedback
-- Date: 2025-07-20

-- USERS TABLE POLICIES
DROP POLICY IF EXISTS "Allow access if user exists" ON users;
DROP POLICY IF EXISTS "Allow access to own row" ON users;
DROP POLICY IF EXISTS "Allow update if user exists" ON users;
DROP POLICY IF EXISTS "Allow update to own row" ON users;
DROP POLICY IF EXISTS "Allow insert if user exists" ON users;
DROP POLICY IF EXISTS "Allow insert to own row" ON users;
DROP POLICY IF EXISTS "Allow delete if user exists" ON users;
DROP POLICY IF EXISTS "Allow delete to own row" ON users;

-- Allow users to SELECT their own row
CREATE POLICY "Allow access to own row"
ON users
FOR SELECT
USING (id = auth.uid());

-- Allow users to UPDATE their own row
CREATE POLICY "Allow update to own row"
ON users
FOR UPDATE
USING (id = auth.uid());

-- Allow users to INSERT their own row (if needed)
CREATE POLICY "Allow insert to own row"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());

-- Allow users to DELETE their own row (if needed)
CREATE POLICY "Allow delete to own row"
ON users
FOR DELETE
USING (id = auth.uid());

-- Allow all authenticated users to SELECT any row (for debugging/support)
CREATE POLICY "Allow all authenticated select"
ON users
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- COMPANIES TABLE POLICIES
DROP POLICY IF EXISTS "Allow access to company if user exists" ON companies;
-- Remove the problematic recursive policy for companies
DROP POLICY IF EXISTS "Allow access to own company" ON companies;

-- Add a broad SELECT policy for companies for debugging/support
CREATE POLICY "Allow all authenticated select"
ON companies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- END OF FILE
