-- Add missing 'type' column to storage buckets and buckets_analytics tables

-- Add 'type' column to storage.buckets (only if the table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    ALTER TABLE storage.buckets ADD COLUMN IF NOT EXISTS type text;
    -- Populate existing rows and enforce not null
    UPDATE storage.buckets SET type = 'storage' WHERE type IS NULL;
    ALTER TABLE storage.buckets ALTER COLUMN type SET NOT NULL;
    ALTER TABLE storage.buckets ALTER COLUMN type SET DEFAULT 'storage';
  END IF;
  
  -- Add 'type' column to storage.buckets_analytics (only if the table exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'buckets_analytics'
  ) THEN
    ALTER TABLE storage.buckets_analytics ADD COLUMN IF NOT EXISTS type text;
  END IF;
END $$;
-- Populate existing rows and enforce not null
UPDATE buckets_analytics SET type = 'storage' WHERE type IS NULL;
ALTER TABLE buckets_analytics ALTER COLUMN type SET NOT NULL;
ALTER TABLE buckets_analytics ALTER COLUMN type SET DEFAULT 'storage';
