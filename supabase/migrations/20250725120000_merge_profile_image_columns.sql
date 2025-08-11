-- Step 1: Merge data from `profile_image` into `profile_image_url`
UPDATE user_profiles
SET profile_image_url = COALESCE(profile_image_url, profile_image);

-- Step 2: Drop the `profile_image` column
ALTER TABLE user_profiles
DROP COLUMN profile_image;

-- Step 3: Ensure `profile_image_url` is used consistently
-- Optionally, rename `profile_image_url` to `profile_image` for clarity
-- ALTER TABLE user_profiles RENAME COLUMN profile_image_url TO profile_image;

-- Ensure `profile_image_url` in the `users` table is linked to the `profile-images` bucket
SELECT *
FROM storage.objects
WHERE bucket_id = 'profile-images';
