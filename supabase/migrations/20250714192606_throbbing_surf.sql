/*
  # Add RLS Security Functions and Additional Policies

  1. Security Functions
    - Helper functions for RLS policies
    - Company membership verification
    - Admin role verification

  2. Additional Security Measures
    - Ensure all foreign key constraints are properly set
    - Add additional security policies where needed
    - Create helper functions for common RLS patterns
*/

-- Helper function to check if user belongs to company
CREATE OR REPLACE FUNCTION user_belongs_to_company(target_company_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.company_id = target_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin of company
CREATE OR REPLACE FUNCTION user_is_company_admin(target_company_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.company_id = target_company_id 
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional policy for companies table using helper function
DROP POLICY IF EXISTS "Admins can update own company" ON companies;
CREATE POLICY "Admins can update own company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (user_is_company_admin(id));

-- Ensure all tables have proper CASCADE deletes for data integrity
DO $$
BEGIN
  -- Add missing foreign key constraints with CASCADE if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'candidates_company_id_fkey'
  ) THEN
    ALTER TABLE candidates 
    ADD CONSTRAINT candidates_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'candidates_created_by_fkey'
  ) THEN
    ALTER TABLE candidates 
    ADD CONSTRAINT candidates_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
END $$;

-- Create a view for user company information (useful for debugging)
CREATE OR REPLACE VIEW user_company_info AS
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.role,
  c.id as company_id,
  c.name as company_name,
  c.domain as company_domain
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_company_info TO authenticated;