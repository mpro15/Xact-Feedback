-- Manual Test Data Creation Script for Xact-Feedback
-- This script creates a test company and admin user for manual testing

-- Step 1: Create Test Company
INSERT INTO companies (
    id,
    name,
    domain,
    logo_url,
    primary_color,
    secondary_color,
    settings,
    subscription_plan,
    subscription_active,
    credits,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_pass,
    smtp_secure,
    created_at,
    updated_at
) VALUES (
    'test-company-12345',
    'Acme Testing Corp',
    'acme-testing.com',
    'https://via.placeholder.com/150x150/2563EB/FFFFFF?text=ACME',
    '#2563EB',
    '#059669',
    '{"email_notifications": true, "daily_limit": 100}',
    'premium',
    true,
    1000,
    'smtp.gmail.com',
    587,
    'test@acme-testing.com',
    'test_password_123',
    true,
    NOW(),
    NOW()
);

-- Step 2: Create Admin User (this would typically be handled by Supabase Auth)
-- Note: The user ID should match a Supabase Auth user ID
INSERT INTO users (
    id,
    company_id,
    email,
    name,
    role,
    is_onboarded,
    phone,
    department,
    bio,
    timezone,
    profile_image_url,
    last_login,
    created_at,
    updated_at
) VALUES (
    'admin-user-12345',
    'test-company-12345',
    'admin@acme-testing.com',
    'Test Admin User',
    'admin',
    true,
    '+1-555-0123',
    'Human Resources',
    'Test admin user for manual testing of the Xact-Feedback application',
    'UTC',
    'https://via.placeholder.com/100x100/059669/FFFFFF?text=TA',
    NOW(),
    NOW(),
    NOW()
);

-- Step 3: Create Sample Candidates for Testing
INSERT INTO candidates (
    id,
    company_id,
    name,
    email,
    position,
    rejection_stage,
    rejection_reason,
    applied_date,
    feedback_status,
    email_opens,
    email_clicks,
    course_enrollments,
    reapplied,
    created_by,
    created_at,
    updated_at
) VALUES 
(
    'candidate-001',
    'test-company-12345',
    'John Smith',
    'john.smith@example.com',
    'Senior Frontend Developer',
    'Technical Interview',
    'Lack of React experience',
    '2025-01-01',
    'not_sent',
    0,
    0,
    0,
    false,
    'admin-user-12345',
    NOW(),
    NOW()
),
(
    'candidate-002',
    'test-company-12345',
    'Sarah Johnson',
    'sarah.johnson@example.com',
    'Backend Engineer',
    'Phone Screen',
    'Insufficient system design knowledge',
    '2025-01-02',
    'not_sent',
    0,
    0,
    0,
    false,
    'admin-user-12345',
    NOW(),
    NOW()
),
(
    'candidate-003',
    'test-company-12345',
    'Mike Davis',
    'mike.davis@example.com',
    'Full Stack Developer',
    'Final Round',
    'Team fit concerns',
    '2025-01-03',
    'draft',
    0,
    0,
    0,
    false,
    'admin-user-12345',
    NOW(),
    NOW()
);

-- Step 4: Create Credits Balance Record
INSERT INTO credits_balance (
    company_id,
    credits,
    created_at,
    updated_at
) VALUES (
    'test-company-12345',
    1000,
    NOW(),
    NOW()
) ON CONFLICT (company_id) DO UPDATE SET
    credits = 1000,
    updated_at = NOW();

-- Display the created records
SELECT 'Company Created:' as info;
SELECT id, name, domain, subscription_plan, credits FROM companies WHERE id = 'test-company-12345';

SELECT 'Admin User Created:' as info;
SELECT id, email, name, role, is_onboarded FROM users WHERE id = 'admin-user-12345';

SELECT 'Sample Candidates Created:' as info;
SELECT id, name, email, position, rejection_stage FROM candidates WHERE company_id = 'test-company-12345';

-- Instructions for manual testing:
/*
MANUAL TESTING INSTRUCTIONS:

1. Company Details:
   - Company ID: test-company-12345
   - Company Name: Acme Testing Corp
   - Domain: acme-testing.com
   - Subscription: Premium (active)
   - Credits: 1000

2. Admin User Credentials:
   - User ID: admin-user-12345
   - Email: admin@acme-testing.com
   - Role: admin
   - Status: Onboarded

3. To test the application:
   a. You'll need to create a Supabase Auth user with email: admin@acme-testing.com
   b. Update the user ID in the users table to match the Supabase Auth user ID
   c. Use the admin credentials to log into the application
   d. Test creating feedback for the sample candidates
   e. Test email campaigns and tracking features

4. Sample test data includes:
   - 3 sample candidates with different rejection stages
   - Company with SMTP configuration
   - Credits balance for testing paid features

5. Clean up after testing:
   DELETE FROM candidates WHERE company_id = 'test-company-12345';
   DELETE FROM users WHERE company_id = 'test-company-12345';
   DELETE FROM companies WHERE id = 'test-company-12345';
   DELETE FROM credits_balance WHERE company_id = 'test-company-12345';
*/
