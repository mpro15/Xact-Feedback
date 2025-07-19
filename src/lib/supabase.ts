// Remove Supabase client initialization from this file
// import { createClient } from '@supabase/supabase-js';

// Supabase client is now only exported from supabaseClient.ts
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Company {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  settings: any;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  name: string;
  role: 'admin' | 'recruiter' | 'manager';
  avatar_url?: string;
  is_onboarded: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  phone?: string;
  department?: string;
  job_title?: string;
  bio?: string;
  timezone: string;
  email_notifications: boolean;
  weekly_reports: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  company_id: string;
  name: string;
  email: string;
  position: string;
  rejection_stage: string;
  rejection_reason?: string;
  applied_date: string;
  feedback_status: 'not_sent' | 'draft' | 'sent';
  email_opens: number;
  email_clicks: number;
  course_enrollments: number;
  reapplied: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  expires_at?: string;
  created_at: string;
}