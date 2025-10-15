-- Verify Test Data Creation
-- Run this to check if all test data was created successfully

-- Check auth users
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email LIKE '%testuser%' 
ORDER BY created_at DESC
LIMIT 5;

-- Check companies
SELECT 
    id,
    name,
    domain,
    subscription_plan,
    subscription_active,
    created_by,
    created_at
FROM companies 
WHERE name LIKE '%Test Company%'
ORDER BY created_at DESC
LIMIT 5;

-- Check user profiles
SELECT 
    id,
    user_id,
    job_title,
    phone,
    company_id,
    created_at
FROM user_profiles 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%testuser%'
)
ORDER BY created_at DESC
LIMIT 5;
