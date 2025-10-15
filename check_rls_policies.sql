-- Check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check for circular references in RLS policies
SELECT 
  p.schemaname,
  p.tablename,
  p.policyname,
  p.qual,
  p.with_check
FROM pg_policies p
WHERE p.tablename = 'users' 
  AND (p.qual LIKE '%users%' OR p.with_check LIKE '%users%');
