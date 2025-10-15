-- Complete RLS Policy Fix and Database Reset
-- This migration will fix all RLS recursion issues and establish proper policies

-- First, drop any existing problematic policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing RLS policies on users table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
    
    -- Drop all existing RLS policies on companies table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.companies';
    END LOOP;
    
    -- Drop all existing RLS policies on candidates table
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'candidates' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.candidates';
    END LOOP;
END $$;

-- Create simple, non-recursive RLS policies for users table
-- Users can only see and modify their own data
CREATE POLICY "users_own_data_select" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_data_update" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_own_data_insert" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create simple policies for companies table
-- Users can view their company's data
CREATE POLICY "companies_member_select" ON public.companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = companies.id
        )
    );

-- Only admins can update company data
CREATE POLICY "companies_admin_update" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = companies.id
            AND users.role IN ('admin', 'owner')
        )
    );

-- Create policies for candidates table  
-- Users can access candidates from their company
CREATE POLICY "candidates_company_access" ON public.candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = candidates.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = candidates.company_id
        )
    );

-- Create policies for feedback_reports table
CREATE POLICY "feedback_reports_company_access" ON public.feedback_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.candidates c
            JOIN public.users u ON u.company_id = c.company_id
            WHERE u.id = auth.uid() 
            AND c.id = feedback_reports.candidate_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.candidates c
            JOIN public.users u ON u.company_id = c.company_id
            WHERE u.id = auth.uid() 
            AND c.id = feedback_reports.candidate_id
        )
    );

-- Create policies for email_campaigns table
CREATE POLICY "email_campaigns_company_access" ON public.email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = email_campaigns.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.company_id = email_campaigns.company_id
        )
    );

-- Ensure RLS is enabled on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback_reports') THEN
        ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_campaigns') THEN
        ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
        ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for analytics_events
        DROP POLICY IF EXISTS "analytics_events_company_access" ON public.analytics_events;
        CREATE POLICY "analytics_events_company_access" ON public.analytics_events
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND (
                        users.company_id = analytics_events.company_id 
                        OR users.id = analytics_events.user_id
                    )
                )
            );
    END IF;
END $$;
