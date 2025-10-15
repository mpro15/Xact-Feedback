-- Simple Test Data Creation for Xact-Feedback
-- Run this script in Supabase SQL Editor or via supabase db reset --with-seed

BEGIN;

-- Generate unique IDs for this test session
-- You can replace these with your own UUIDs if needed
DO $$
DECLARE
    test_company_id UUID := gen_random_uuid();
    test_user_id UUID := gen_random_uuid();
    candidate_1_id UUID := gen_random_uuid();
    candidate_2_id UUID := gen_random_uuid();
    candidate_3_id UUID := gen_random_uuid();
BEGIN
    -- Create test company
    INSERT INTO companies (
        id, name, domain, primary_color, secondary_color, 
        subscription_plan, subscription_active, created_at, updated_at
    ) VALUES (
        test_company_id,
        'Test Company Ltd',
        'test-company.com',
        '#2563EB',
        '#059669',
        'premium',
        true,
        NOW(),
        NOW()
    );

    -- Create admin user
    INSERT INTO users (
        id, company_id, email, name, role, is_onboarded,
        phone, department, timezone, created_at, updated_at
    ) VALUES (
        test_user_id,
        test_company_id,
        'admin@test-company.com',
        'Test Admin',
        'admin',
        true,
        '+1-555-0100',
        'HR',
        'UTC',
        NOW(),
        NOW()
    );

    -- Create sample candidates
    INSERT INTO candidates (
        id, company_id, name, email, position, rejection_stage,
        rejection_reason, applied_date, feedback_status, created_by,
        created_at, updated_at
    ) VALUES 
    (
        candidate_1_id,
        test_company_id,
        'Alice Johnson',
        'alice.johnson@email.com',
        'Software Engineer',
        'Technical Interview',
        'Need more experience with React',
        CURRENT_DATE - INTERVAL '5 days',
        'not_sent',
        test_user_id,
        NOW(),
        NOW()
    ),
    (
        candidate_2_id,
        test_company_id,
        'Bob Smith',
        'bob.smith@email.com',
        'Backend Developer',
        'System Design',
        'Limited scalability knowledge',
        CURRENT_DATE - INTERVAL '3 days',
        'not_sent',
        test_user_id,
        NOW(),
        NOW()
    ),
    (
        candidate_3_id,
        test_company_id,
        'Carol Davis',
        'carol.davis@email.com',
        'Frontend Developer',
        'Culture Fit',
        'Not aligned with team values',
        CURRENT_DATE - INTERVAL '1 day',
        'draft',
        test_user_id,
        NOW(),
        NOW()
    );

    -- Add credits if credits_balance table exists
    BEGIN
        INSERT INTO credits_balance (company_id, credits, created_at, updated_at)
        VALUES (test_company_id, 500, NOW(), NOW());
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'credits_balance table does not exist, skipping...';
    END;

    -- Add SMTP configuration if columns exist
    BEGIN
        UPDATE companies SET 
            smtp_host = 'smtp.test-company.com',
            smtp_port = 587,
            smtp_user = 'noreply@test-company.com',
            smtp_pass = 'smtp_password_123',
            smtp_secure = true
        WHERE id = test_company_id;
    EXCEPTION 
        WHEN undefined_column THEN
            RAISE NOTICE 'SMTP columns do not exist, skipping...';
    END;

    -- Display the created data
    RAISE NOTICE '=== TEST DATA CREATED ===';
    RAISE NOTICE 'Company ID: %', test_company_id;
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Admin Email: admin@test-company.com';
    RAISE NOTICE 'Company: Test Company Ltd';
    RAISE NOTICE 'Sample Candidates: 3 created';
    RAISE NOTICE '========================';
END $$;

COMMIT;

-- Display created data
SELECT 
    'COMPANY' as type,
    id::text as identifier,
    name as details,
    subscription_plan as extra
FROM companies 
WHERE name = 'Test Company Ltd'

UNION ALL

SELECT 
    'USER' as type,
    id::text as identifier,
    name || ' (' || email || ')' as details,
    role as extra
FROM users 
WHERE email = 'admin@test-company.com'

UNION ALL

SELECT 
    'CANDIDATES' as type,
    COUNT(*)::text as identifier,
    'Sample candidates created' as details,
    feedback_status as extra
FROM candidates c
JOIN users u ON c.created_by = u.id
WHERE u.email = 'admin@test-company.com'
GROUP BY feedback_status;

-- Show instructions
SELECT '
=== MANUAL TESTING INSTRUCTIONS ===

1. Use the displayed Company ID and User ID above
2. Create a Supabase Auth user with email: admin@test-company.com
3. Update the users table to use the Auth user ID:
   UPDATE users SET id = ''[AUTH_USER_ID]'' WHERE email = ''admin@test-company.com'';
4. Log in with admin@test-company.com credentials
5. Test feedback generation for the sample candidates

=== CLEANUP AFTER TESTING ===
To remove test data:
DELETE FROM candidates WHERE created_by IN (SELECT id FROM users WHERE email = ''admin@test-company.com'');
DELETE FROM users WHERE email = ''admin@test-company.com'';
DELETE FROM companies WHERE name = ''Test Company Ltd'';

' as instructions;
