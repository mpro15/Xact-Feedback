-- Direct SQL script to insert test data bypassing RLS
-- Run this in Supabase SQL Editor with elevated permissions

-- Generate test data with proper UUIDs
WITH test_data AS (
  SELECT 
    gen_random_uuid() as company_id,
    gen_random_uuid() as user_id,
    gen_random_uuid() as candidate_id_1,
    gen_random_uuid() as candidate_id_2,
    gen_random_uuid() as candidate_id_3
)
INSERT INTO companies (
  id, name, domain, primary_color, secondary_color, 
  subscription_plan, subscription_active, created_at, updated_at
)
SELECT 
  company_id,
  'Manual Testing Company',
  'manual-testing.example.com',
  '#2563EB',
  '#059669',
  'premium',
  true,
  NOW(),
  NOW()
FROM test_data;

-- Get the company ID for the next inserts
WITH test_data AS (
  SELECT id as company_id FROM companies WHERE name = 'Manual Testing Company'
),
user_insert AS (
  INSERT INTO users (
    id, company_id, email, name, role, is_onboarded,
    phone, department, timezone, created_at, updated_at
  )
  SELECT 
    gen_random_uuid(),
    company_id,
    'admin@manual-testing.example.com',
    'Manual Test Admin',
    'admin',
    true,
    '+1-555-TEST',
    'QA Testing',
    'UTC',
    NOW(),
    NOW()
  FROM test_data
  RETURNING id, company_id
)
INSERT INTO candidates (
  id, company_id, name, email, position, rejection_stage,
  rejection_reason, applied_date, feedback_status, created_by,
  created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  ui.company_id,
  candidate_name,
  candidate_email,
  position,
  rejection_stage,
  rejection_reason,
  CURRENT_DATE - INTERVAL '2 days',
  'not_sent',
  ui.id,
  NOW(),
  NOW()
FROM user_insert ui
CROSS JOIN (
  VALUES 
    ('Alice Johnson', 'alice@example.com', 'Software Engineer', 'Technical Interview', 'Need more React experience'),
    ('Bob Smith', 'bob@example.com', 'Backend Developer', 'System Design', 'Limited database knowledge'),
    ('Carol Davis', 'carol@example.com', 'Frontend Developer', 'Culture Fit', 'Not aligned with team values')
) AS candidates_data(candidate_name, candidate_email, position, rejection_stage, rejection_reason);

-- Display created data
SELECT 
  'CREATED TEST DATA' as status,
  c.name as company_name,
  c.id as company_id,
  u.email as admin_email,
  u.id as admin_user_id,
  COUNT(cand.id) as candidate_count
FROM companies c
JOIN users u ON u.company_id = c.id
LEFT JOIN candidates cand ON cand.company_id = c.id
WHERE c.name = 'Manual Testing Company'
GROUP BY c.id, c.name, u.email, u.id;

-- Show manual testing instructions
SELECT '
=== MANUAL TESTING SETUP COMPLETE ===

1. Company Created: Manual Testing Company
2. Admin User: admin@manual-testing.example.com
3. Sample Candidates: 3 created

NEXT STEPS:
1. Create Supabase Auth user with email: admin@manual-testing.example.com
2. Get the Auth user ID from Supabase Auth dashboard
3. Update the users table:
   UPDATE users 
   SET id = [AUTH_USER_ID] 
   WHERE email = ''admin@manual-testing.example.com'';
4. Login to application and test features

CLEANUP AFTER TESTING:
DELETE FROM candidates WHERE company_id IN (SELECT id FROM companies WHERE name = ''Manual Testing Company'');
DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name = ''Manual Testing Company'');
DELETE FROM companies WHERE name = ''Manual Testing Company'';

' as instructions;
