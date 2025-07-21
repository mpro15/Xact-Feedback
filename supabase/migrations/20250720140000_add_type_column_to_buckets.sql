-- Add missing 'type' column to storage buckets and buckets_analytics tables

-- Add 'type' column to storage.buckets
ALTER TABLE buckets ADD COLUMN IF NOT EXISTS type text;
-- Populate existing rows and enforce not null
UPDATE buckets SET type = 'storage' WHERE type IS NULL;
ALTER TABLE buckets ALTER COLUMN type SET NOT NULL;
ALTER TABLE buckets ALTER COLUMN type SET DEFAULT 'storage';

-- Add 'type' column to storage.buckets_analytics
ALTER TABLE buckets_analytics ADD COLUMN IF NOT EXISTS type text;
-- Populate existing rows and enforce not null
UPDATE buckets_analytics SET type = 'storage' WHERE type IS NULL;
ALTER TABLE buckets_analytics ALTER COLUMN type SET NOT NULL;
ALTER TABLE buckets_analytics ALTER COLUMN type SET DEFAULT 'storage';
