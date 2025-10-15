-- Direct RLS Policy Fix for Infinite Recursion
-- This script will be applied directly to resolve RLS issues

-- First, check what tables exist and fix only those
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Only fix RLS for tables that actually exist
    
    -- Fix users table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Drop all existing RLS policies on users table
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
        END LOOP;
        
        -- Create simple, non-recursive RLS policies for users table
        CREATE POLICY "users_own_data_select" ON public.users
            FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "users_own_data_update" ON public.users
            FOR UPDATE USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);

        CREATE POLICY "users_own_data_insert" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix companies table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        -- Drop all existing RLS policies on companies table
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.companies';
        END LOOP;
        
        -- Create simple policies for companies table
        CREATE POLICY "companies_member_select" ON public.companies
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.company_id = companies.id
                )
            );

        CREATE POLICY "companies_admin_update" ON public.companies
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.company_id = companies.id
                    AND users.role IN ('admin', 'owner')
                )
            );
            
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix candidates table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'candidates') THEN
        -- Drop all existing RLS policies on candidates table
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'candidates' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.candidates';
        END LOOP;
        
        -- Create policies for candidates table  
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
            
        ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix feedback_reports table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback_reports') THEN
        -- Drop all existing RLS policies
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'feedback_reports' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.feedback_reports';
        END LOOP;
        
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
            
        ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix email_campaigns table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_campaigns') THEN
        -- Drop all existing RLS policies
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'email_campaigns' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.email_campaigns';
        END LOOP;
        
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
            
        ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Fix analytics_events table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
        -- Drop all existing RLS policies
        FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'analytics_events' AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.analytics_events';
        END LOOP;
        
        -- Create policy for analytics_events
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
            
        ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
    END IF;

END $$;