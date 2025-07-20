-- Add isOnboarded column to users table for onboarding flow
ALTER TABLE users ADD COLUMN isOnboarded boolean DEFAULT false;
-- END OF FILE
