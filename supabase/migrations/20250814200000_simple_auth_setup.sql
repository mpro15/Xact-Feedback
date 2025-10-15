-- Simple auth setup for working login flow
-- This creates the minimal required structure

-- Ensure companies table has required columns
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS current_ats text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS monthly_hires text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
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

-- Add company_id to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Enable RLS with simple policies for development
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Simple policies that allow authenticated users access
-- These are development-friendly policies

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON companies;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON companies;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_profiles;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON candidates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON candidates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON candidates;

-- Create simple, broad policies for development
CREATE POLICY "Enable read access for authenticated users" ON companies 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON companies 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON companies 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON users 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON users 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON user_profiles 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON user_profiles 
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON candidates 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON candidates 
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON candidates 
    FOR UPDATE TO authenticated USING (true);
