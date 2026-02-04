-- Find all tables in the database
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check what's left in company_profiles
SELECT * FROM company_profiles;

-- Check profiles table for your user
SELECT * FROM profiles WHERE id = 'c07862c6-5453-484f-9204-94a39fa451b1';