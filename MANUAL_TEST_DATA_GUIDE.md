# Manual Test Data Creation Guide

Since the automated scripts are being blocked by Row Level Security (RLS) policies, here's a step-by-step guide to manually create test data for the Xact-Feedback application.

## Option 1: Using Supabase Dashboard (Recommended)

### Step 1: Create Test Company

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `jeyrciyahbkgjoqikapw`
3. Go to `Table Editor` → `companies`
4. Click `Insert` → `Insert row`
5. Fill in the following data:

```
id: [Click "Generate UUID"]
name: Manual Test Company
domain: manual-test.example.com
primary_color: #2563EB
secondary_color: #059669
subscription_plan: premium
subscription_active: true
created_at: [Auto-filled]
updated_at: [Auto-filled]
```

6. Click `Save`
7. **Copy the generated Company ID** - you'll need it for the next steps

### Step 2: Create Admin User

1. In Table Editor, go to `users` table
2. Click `Insert` → `Insert row`
3. Fill in the following data:

```
id: [Click "Generate UUID"]
company_id: [Paste the Company ID from Step 1]
email: admin@manual-test.example.com
name: Manual Test Admin
role: admin
is_onboarded: true
phone: +1-555-0123
department: Testing
timezone: UTC
created_at: [Auto-filled]
updated_at: [Auto-filled]
```

4. Click `Save`
5. **Copy the generated User ID** - you'll need it for authentication setup

### Step 3: Create Sample Candidates

1. In Table Editor, go to `candidates` table
2. Create 3 sample candidates by clicking `Insert` → `Insert row` for each:

**Candidate 1:**
```
id: [Generate UUID]
company_id: [Your Company ID]
name: Alice Johnson
email: alice.johnson@example.com
position: Software Engineer
rejection_stage: Technical Interview
rejection_reason: Needs more React experience
applied_date: 2025-08-12
feedback_status: not_sent
created_by: [Your User ID]
```

**Candidate 2:**
```
id: [Generate UUID]
company_id: [Your Company ID]
name: Bob Smith
email: bob.smith@example.com
position: Backend Developer
rejection_stage: System Design
rejection_reason: Limited scalability knowledge
applied_date: 2025-08-13
feedback_status: not_sent
created_by: [Your User ID]
```

**Candidate 3:**
```
id: [Generate UUID]
company_id: [Your Company ID]
name: Carol Davis
email: carol.davis@example.com
position: Frontend Developer
rejection_stage: Culture Fit
rejection_reason: Not aligned with team values
applied_date: 2025-08-14
feedback_status: draft
created_by: [Your User ID]
```

### Step 4: Create Authentication User

1. Go to `Authentication` → `Users` in your Supabase Dashboard
2. Click `Add user` → `Create new user`
3. Fill in:
   - Email: `admin@manual-test.example.com`
   - Password: Choose a secure password (e.g., `TestAdmin123!`)
4. Click `Create user`
5. **Copy the new Auth User ID** from the users list

### Step 5: Link Authentication to Profile

1. Go to `SQL Editor` in Supabase Dashboard
2. Run this SQL query (replace `[AUTH_USER_ID]` with the actual ID from Step 4):

```sql
UPDATE users 
SET id = '[AUTH_USER_ID]' 
WHERE email = 'admin@manual-test.example.com';
```

## Option 2: Using SQL Script (Alternative)

If you have admin access to the database, you can run this SQL script directly:

```sql
-- Replace these UUIDs with your own generated ones
BEGIN;

-- Insert test company
INSERT INTO companies (
    id, name, domain, primary_color, secondary_color, 
    subscription_plan, subscription_active, created_at, updated_at
) VALUES (
    'YOUR_COMPANY_UUID_HERE',
    'Manual Test Company',
    'manual-test.example.com',
    '#2563EB',
    '#059669',
    'premium',
    true,
    NOW(),
    NOW()
);

-- Insert admin user
INSERT INTO users (
    id, company_id, email, name, role, is_onboarded,
    phone, department, timezone, created_at, updated_at
) VALUES (
    'YOUR_USER_UUID_HERE',
    'YOUR_COMPANY_UUID_HERE',
    'admin@manual-test.example.com',
    'Manual Test Admin',
    'admin',
    true,
    '+1-555-0123',
    'Testing',
    'UTC',
    NOW(),
    NOW()
);

-- Insert sample candidates
INSERT INTO candidates (
    id, company_id, name, email, position, rejection_stage,
    rejection_reason, applied_date, feedback_status, created_by,
    created_at, updated_at
) VALUES 
(
    gen_random_uuid(),
    'YOUR_COMPANY_UUID_HERE',
    'Alice Johnson',
    'alice.johnson@example.com',
    'Software Engineer',
    'Technical Interview',
    'Needs more React experience',
    '2025-08-12',
    'not_sent',
    'YOUR_USER_UUID_HERE',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'YOUR_COMPANY_UUID_HERE',
    'Bob Smith',
    'bob.smith@example.com',
    'Backend Developer',
    'System Design',
    'Limited scalability knowledge',
    '2025-08-13',
    'not_sent',
    'YOUR_USER_UUID_HERE',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'YOUR_COMPANY_UUID_HERE',
    'Carol Davis',
    'carol.davis@example.com',
    'Frontend Developer',
    'Culture Fit',
    'Not aligned with team values',
    '2025-08-14',
    'draft',
    'YOUR_USER_UUID_HERE',
    NOW(),
    NOW()
);

COMMIT;
```

## Testing the Application

After completing the setup:

1. **Login Test:**
   - Go to your application URL
   - Login with: `admin@manual-test.example.com`
   - Use the password you set in Step 4

2. **Feature Tests:**
   - Navigate to the Candidates page
   - Verify you can see the 3 sample candidates
   - Try generating feedback for a candidate
   - Test other features like email campaigns
   - Check analytics and dashboard functionality

## Cleanup After Testing

When you're done testing, clean up the data:

```sql
-- Delete test data (replace with your Company ID)
DELETE FROM candidates WHERE company_id = 'YOUR_COMPANY_UUID_HERE';
DELETE FROM users WHERE company_id = 'YOUR_COMPANY_UUID_HERE';
DELETE FROM companies WHERE id = 'YOUR_COMPANY_UUID_HERE';
```

Also delete the authentication user from the Supabase Dashboard.

## Troubleshooting

- **RLS Policy Issues:** Make sure you're using the Supabase Dashboard with admin privileges
- **UUID Format:** Always use proper UUID format (generated by Supabase)
- **Foreign Key Constraints:** Ensure company_id and created_by reference valid records
- **Auth Linking:** The user ID in the users table must match the Supabase Auth user ID

## Next Steps

Once you have the test data working:

1. Test all major application features
2. Verify email functionality (if SMTP is configured)
3. Test feedback generation and PDF creation
4. Validate analytics and tracking features
5. Check subscription and billing flows

This manual approach ensures you have complete control over the test data creation process and can work around any RLS policy restrictions.
