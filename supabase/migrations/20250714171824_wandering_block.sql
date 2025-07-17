/*
  # Sample Data for Multi-tenant Xact Feedback Platform
  
  This migration creates sample companies, users, and candidates for testing
*/

-- Insert sample companies
INSERT INTO companies (id, name, domain, logo_url, primary_color, secondary_color, subscription_plan) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Inc.', 'techcorp.com', null, '#2563EB', '#059669', 'enterprise'),
('550e8400-e29b-41d4-a716-446655440002', 'StartupXYZ', 'startupxyz.com', null, '#7C3AED', '#F59E0B', 'professional'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions Ltd', 'globalsolutions.com', null, '#DC2626', '#059669', 'starter');

-- Insert sample users
INSERT INTO users (id, company_id, email, name, role, is_onboarded) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'john.smith@techcorp.com', 'John Smith', 'admin', true),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@techcorp.com', 'Sarah Johnson', 'recruiter', true),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'mike.wilson@startupxyz.com', 'Mike Wilson', 'admin', true),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'emma.davis@globalsolutions.com', 'Emma Davis', 'manager', true);

-- Insert user profiles
INSERT INTO user_profiles (user_id, phone, department, job_title, bio, timezone) VALUES
('550e8400-e29b-41d4-a716-446655440011', '+1-555-0123', 'Human Resources', 'HR Director', 'Experienced HR professional focused on improving candidate experience', 'America/New_York'),
('550e8400-e29b-41d4-a716-446655440012', '+1-555-0124', 'Human Resources', 'Senior Recruiter', 'Passionate about connecting talent with opportunities', 'America/New_York'),
('550e8400-e29b-41d4-a716-446655440013', '+1-555-0125', 'Operations', 'Co-founder & COO', 'Building the future of work through innovative solutions', 'America/Los_Angeles'),
('550e8400-e29b-41d4-a716-446655440014', '+44-20-7946-0958', 'Talent Acquisition', 'Talent Manager', 'Global talent acquisition specialist', 'Europe/London');

-- Insert sample candidates for TechCorp
INSERT INTO candidates (company_id, name, email, position, rejection_stage, rejection_reason, applied_date, feedback_status, email_opens, email_clicks, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice.johnson@email.com', 'Senior Frontend Developer', 'Technical Interview', 'Insufficient React experience', '2024-01-15', 'sent', 2, 1, '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440001', 'Bob Smith', 'bob.smith@email.com', 'Backend Developer', 'Final Interview', 'Cultural fit concerns', '2024-01-14', 'sent', 1, 0, '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440001', 'Carol Davis', 'carol.davis@email.com', 'Product Manager', 'Phone Screen', 'Lack of product management experience', '2024-01-13', 'draft', 0, 0, '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440001', 'David Kim', 'david.kim@email.com', 'Data Scientist', 'Resume Screening', 'Missing required ML skills', '2024-01-12', 'not_sent', 0, 0, '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440001', 'Eva Martinez', 'eva.martinez@email.com', 'UX Designer', 'Portfolio Review', 'Portfolio did not meet requirements', '2024-01-11', 'sent', 3, 2, '550e8400-e29b-41d4-a716-446655440012');

-- Insert sample candidates for StartupXYZ
INSERT INTO candidates (company_id, name, email, position, rejection_stage, rejection_reason, applied_date, feedback_status, email_opens, email_clicks, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Frank Wilson', 'frank.wilson@email.com', 'Full Stack Developer', 'Technical Interview', 'Weak system design skills', '2024-01-10', 'sent', 1, 1, '550e8400-e29b-41d4-a716-446655440013'),
('550e8400-e29b-41d4-a716-446655440002', 'Grace Lee', 'grace.lee@email.com', 'Marketing Manager', 'Final Interview', 'Experience not aligned with startup environment', '2024-01-09', 'draft', 0, 0, '550e8400-e29b-41d4-a716-446655440013');

-- Insert sample notifications
INSERT INTO notifications (user_id, company_id, type, title, message, read) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'success', 'Feedback Sent', 'Successfully sent feedback to 5 candidates', false),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'info', 'Weekly Report Available', 'Your weekly candidate feedback analytics report is ready', false),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'warning', 'Email Limit Reached', 'You have reached 80% of your daily email limit', true),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'success', 'Integration Connected', 'Successfully connected to Greenhouse ATS', false);

-- Insert sample integrations
INSERT INTO integrations (company_id, type, provider, config, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ats', 'workday', '{"api_key": "encrypted_key_123", "webhook_url": "https://api.xactfeedback.com/webhooks/workday"}', true, '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440001', 'email', 'sendgrid', '{"api_key": "encrypted_sendgrid_key", "from_email": "hr@techcorp.com"}', true, '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440002', 'ats', 'greenhouse', '{"api_key": "encrypted_greenhouse_key"}', true, '550e8400-e29b-41d4-a716-446655440013');

-- Insert sample analytics events
INSERT INTO analytics_events (company_id, user_id, event_type, event_data) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'feedback_sent', '{"candidate_id": "candidate_123", "email": "alice.johnson@email.com"}'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'email_opened', '{"candidate_id": "candidate_123", "timestamp": "2024-01-15T10:30:00Z"}'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'pdf_downloaded', '{"report_type": "sample", "user_agent": "Mozilla/5.0"}');