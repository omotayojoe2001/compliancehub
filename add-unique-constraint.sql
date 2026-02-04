-- Add unique constraint to user_id column in existing company_profiles table
ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);