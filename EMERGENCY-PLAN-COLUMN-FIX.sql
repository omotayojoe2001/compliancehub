-- EMERGENCY FIX: Add missing 'plan' column to user_profiles table
-- Run this IMMEDIATELY in Supabase SQL Editor

-- Add the plan column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Update any existing records to have a plan
UPDATE user_profiles SET plan = 'free' WHERE plan IS NULL;

-- Verify the fix worked
SELECT 'PLAN COLUMN ADDED SUCCESSFULLY!' as status;
SELECT id, business_name, plan, created_at FROM user_profiles LIMIT 3;