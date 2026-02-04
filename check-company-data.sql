-- Check what's in the companies table (this is likely where your switchable profiles are)
SELECT * FROM companies WHERE user_id = 'c07862c6-5453-484f-9204-94a39fa451b1';

-- Check what's left in company_profiles
SELECT * FROM company_profiles WHERE user_id = 'c07862c6-5453-484f-9204-94a39fa451b1';

-- Check profiles table
SELECT * FROM profiles WHERE id = 'c07862c6-5453-484f-9204-94a39fa451b1';

-- Check if there are any other tables that might contain company data
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%compan%';

-- Check for any backup or audit tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%backup%' OR table_name LIKE '%audit%' OR table_name LIKE '%log%');