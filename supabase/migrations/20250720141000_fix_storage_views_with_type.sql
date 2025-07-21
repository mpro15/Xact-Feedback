-- Drop and recreate storage views to include 'type' column for buckets and buckets_analytics

-- Recreate 'buckets' view
DROP VIEW IF EXISTS buckets;
CREATE VIEW buckets AS
SELECT
  id,
  name,
  type,
  public,
  owner,
  created_at,
  updated_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- Recreate 'buckets_analytics' view
DROP VIEW IF EXISTS buckets_analytics;
CREATE VIEW buckets_analytics AS
SELECT
  id,
  id AS name,
  type,
  NULL::boolean AS public,
  NULL::uuid AS owner,
  created_at,
  updated_at,
  NULL::integer AS file_size_limit,
  NULL::text[] AS allowed_mime_types
FROM storage.buckets_analytics;
