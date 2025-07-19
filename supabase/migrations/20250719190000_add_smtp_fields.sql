-- Add SMTP fields to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_host TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_port INT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_user TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_pass TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT false;
