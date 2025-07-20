-- Migration: Refine RLS policies for least privilege
-- Date: 2025-07-20

-- Remove broad SELECT policies
DROP POLICY IF EXISTS "Allow all authenticated select" ON users;
DROP POLICY IF EXISTS "Allow all authenticated select" ON companies;

-- USERS: Only allow access to own row
CREATE POLICY "Allow select own row"
ON users
FOR SELECT
USING (id = auth.uid());

-- COMPANIES: Only allow access to own company (assuming user.company_id)
CREATE POLICY "Allow select own company"
ON companies
FOR SELECT
USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Support/Admin: Allow support users to select all (if needed)
CREATE POLICY "Support can select all"
ON users
FOR SELECT
USING (EXISTS (SELECT 1 FROM support_logins WHERE user_id = auth.uid()));

-- END OF FILE
