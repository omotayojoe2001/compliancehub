-- Add client_name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Update existing records to use business_name as client_name if null
UPDATE profiles SET client_name = business_name WHERE client_name IS NULL;

-- Check the updated structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;