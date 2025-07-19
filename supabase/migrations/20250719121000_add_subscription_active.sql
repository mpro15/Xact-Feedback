-- Migration: Add subscription_active column to companies table
ALTER TABLE companies
  ADD COLUMN subscription_active boolean DEFAULT false;
-- This column is set to true when payment is captured via Razorpay webhook
