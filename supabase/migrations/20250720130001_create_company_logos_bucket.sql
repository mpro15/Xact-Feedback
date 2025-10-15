-- Create storage bucket for company logos
-- Check if bucket exists first and create if it doesn't
DO $$
BEGIN
  -- The bucket already exists based on database dump, so we just ensure it's configured properly
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'company-logos'
  ) THEN
    -- Try to create the bucket using the proper function signature
    INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
    VALUES ('company-logos', 'company-logos', true, now(), now());
  END IF;
END $$;
