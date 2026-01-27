-- EMERGENCY: Remove plan column from profiles table completely
-- This ensures the system only uses subscription table for plan information

-- First, check if the column exists in profiles table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'plan'
    ) THEN
        -- Remove the plan column from profiles table
        ALTER TABLE profiles DROP COLUMN plan;
        RAISE NOTICE 'Plan column removed from profiles table';
    ELSE
        RAISE NOTICE 'Plan column does not exist in profiles table';
    END IF;
END $$;

-- Also check and remove from user_profiles table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'plan'
    ) THEN
        -- Remove the plan column from user_profiles table
        ALTER TABLE user_profiles DROP COLUMN plan;
        RAISE NOTICE 'Plan column removed from user_profiles table';
    ELSE
        RAISE NOTICE 'Plan column does not exist in user_profiles table';
    END IF;
END $$;

-- Verify the columns are removed
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'user_profiles')
AND column_name = 'plan';

-- Show current structure of profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show current structure of subscriptions table to confirm it has plan info
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;