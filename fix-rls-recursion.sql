-- Fix RLS infinite recursion by simplifying policies

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Allow access to own row" ON users;
DROP POLICY IF EXISTS "Allow update to own row" ON users;
DROP POLICY IF EXISTS "Users can read own company" ON companies;
DROP POLICY IF EXISTS "Admins can update own company" ON companies;
DROP POLICY IF EXISTS "Users can access own company candidates" ON candidates;
DROP POLICY IF EXISTS "Users can access own company performance metrics" ON performance_metrics;

-- Create simple, non-recursive policies

-- Users table: Allow users to access their own records
CREATE POLICY "users_select_own" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Companies table: Allow access to company if user belongs to it
CREATE POLICY "companies_select" ON companies
    FOR SELECT TO authenticated
    USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Candidates table: Allow access to candidates in user's company
CREATE POLICY "candidates_select" ON candidates
    FOR SELECT TO authenticated
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "candidates_insert" ON candidates
    FOR INSERT TO authenticated
    WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "candidates_update" ON candidates
    FOR UPDATE TO authenticated
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Performance metrics table: Allow access to metrics in user's company
CREATE POLICY "performance_metrics_select" ON performance_metrics
    FOR SELECT TO authenticated
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "performance_metrics_insert" ON performance_metrics
    FOR INSERT TO authenticated
    WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
