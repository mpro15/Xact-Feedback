-- Fix RLS Infinite Recursion Issues
-- This script will remove circular RLS policies and create simplified, safe policies

-- First, disable RLS temporarily to fix the policies
BEGIN;

-- Drop all existing RLS policies on users table that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to view own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.users;

-- Create simplified, non-recursive RLS policies for users table
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix companies table policies
DROP POLICY IF EXISTS "Companies are viewable by company members" ON public.companies;
DROP POLICY IF EXISTS "Companies can be updated by admins" ON public.companies;

-- Create simplified company policies
CREATE POLICY "companies_select_by_members" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "companies_update_by_admins" ON public.companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- Fix candidates table policies
DROP POLICY IF EXISTS "Candidates are viewable by company members" ON public.candidates;
DROP POLICY IF EXISTS "Candidates can be managed by company members" ON public.candidates;

CREATE POLICY "candidates_select_by_company" ON public.candidates
    FOR SELECT USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "candidates_all_by_company" ON public.candidates
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Fix feedback table policies
DROP POLICY IF EXISTS "Feedback is viewable by company members" ON public.feedback;
DROP POLICY IF EXISTS "Feedback can be created by company members" ON public.feedback;

CREATE POLICY "feedback_select_by_company" ON public.feedback
    FOR SELECT USING (
        candidate_id IN (
            SELECT c.id 
            FROM public.candidates c
            JOIN public.users u ON u.company_id = c.company_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "feedback_insert_by_company" ON public.feedback
    FOR INSERT WITH CHECK (
        candidate_id IN (
            SELECT c.id 
            FROM public.candidates c
            JOIN public.users u ON u.company_id = c.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Fix email_campaigns table policies
DROP POLICY IF EXISTS "Email campaigns are viewable by company members" ON public.email_campaigns;

CREATE POLICY "email_campaigns_by_company" ON public.email_campaigns
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Ensure RLS is enabled on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

COMMIT;
