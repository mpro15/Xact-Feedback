-- Drop redundant isOnboarded column from users table
ALTER TABLE users DROP COLUMN IF EXISTS isonboarded;
