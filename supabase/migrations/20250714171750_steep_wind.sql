/*
  # Multi-tenant Schema for Xact Feedback Platform

  1. New Tables
    - `companies` - Company/tenant information
    - `users` - User accounts with company association
    - `candidates` - Candidate data per company
    - `feedback_reports` - Generated feedback reports
    - `email_campaigns` - Email campaign tracking
    - `notifications` - User-specific notifications
    - `integrations` - Company integration settings
    - `analytics_events` - Event tracking for analytics
    - `user_profiles` - Extended user profile information

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - User-specific data access policies

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for multi-tenant queries
*/

-- Companies table (tenants)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#2563EB',
  secondary_color text DEFAULT '#059669',
  settings jsonb DEFAULT '{}',
  subscription_plan text DEFAULT 'starter',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table with company association
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter', 'manager')),
  avatar_url text,
  is_onboarded boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  phone text,
  department text,
  job_title text,
  bio text,
  timezone text DEFAULT 'UTC',
  email_notifications boolean DEFAULT true,
  weekly_reports boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  position text NOT NULL,
  rejection_stage text NOT NULL,
  rejection_reason text,
  applied_date date NOT NULL,
  feedback_status text DEFAULT 'not_sent' CHECK (feedback_status IN ('not_sent', 'draft', 'sent')),
  email_opens integer DEFAULT 0,
  email_clicks integer DEFAULT 0,
  course_enrollments integer DEFAULT 0,
  reapplied boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback reports table
CREATE TABLE IF NOT EXISTS feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  pdf_url text,
  generated_by uuid REFERENCES users(id),
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_id text,
  recipients_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_by uuid REFERENCES users(id),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications table (user-specific)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ats', 'email', 'learning', 'webhook')),
  provider text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  candidate_id uuid REFERENCES candidates(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation

-- Companies policies
CREATE POLICY "Users can read own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Users policies
CREATE POLICY "Users can read company users"
  ON users FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- User profiles policies
CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Candidates policies
CREATE POLICY "Users can manage company candidates"
  ON candidates FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Feedback reports policies
CREATE POLICY "Users can manage company feedback reports"
  ON feedback_reports FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Email campaigns policies
CREATE POLICY "Users can manage company email campaigns"
  ON email_campaigns FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Integrations policies
CREATE POLICY "Users can manage company integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Analytics events policies
CREATE POLICY "Users can read company analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_analytics_events_company_id ON analytics_events(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_candidate_id ON feedback_reports(candidate_id);
CREATE INDEX IF NOT EXISTS idx_integrations_company_type ON integrations(company_id, type);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();