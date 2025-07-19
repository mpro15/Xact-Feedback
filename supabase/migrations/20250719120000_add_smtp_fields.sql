-- Migration: Add SMTP fields to companies table
ALTER TABLE companies
  ADD COLUMN smtp_host text,
  ADD COLUMN smtp_port integer,
  ADD COLUMN smtp_user text,
  ADD COLUMN smtp_pass text,
  ADD COLUMN smtp_secure boolean;
-- These fields are used for per-company SMTP configuration in feedback delivery
