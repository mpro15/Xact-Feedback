-- Fix user_profiles table schema and RLS policies
-- This migration ensures proper database structure for authentication

-- First, check if user_profiles table exists and has correct structure
DO $$
BEGIN
    -- Add company_id column to user_profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
    
    -- Add users table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            company_id UUID REFERENCES companies(id),
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'user',
            is_onboarded BOOLEAN DEFAULT false,
            is_approved BOOLEAN DEFAULT true,
            phone TEXT,
            department TEXT,
            bio TEXT,
            timezone TEXT DEFAULT 'UTC',
            profile_image_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow access to own row" ON users;
DROP POLICY IF EXISTS "Allow update to own row" ON users;
DROP POLICY IF EXISTS "Allow insert to own row" ON users;
DROP POLICY IF EXISTS "Allow delete to own row" ON users;
DROP POLICY IF EXISTS "Users can access all" ON users;
DROP POLICY IF EXISTS "feedback_reports_company_access" ON feedback_reports;

-- Simple, non-recursive policies for users table
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Simple policies for companies table
CREATE POLICY "companies_select_by_creator" ON companies
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "companies_update_by_creator" ON companies
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "companies_insert_own" ON companies
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Simple policies for user_profiles table
CREATE POLICY "user_profiles_select_own" ON user_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert_own" ON user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Simple policies for candidates table
CREATE POLICY "candidates_company_access" ON candidates
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
