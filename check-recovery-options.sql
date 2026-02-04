-- Check if there are any remaining records in company_profiles
SELECT * FROM company_profiles;

-- Check if there are any audit/backup tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%audit%' OR table_name LIKE '%backup%' OR table_name LIKE '%history%');

-- Check if there are any related records in other tables that might help reconstruct
SELECT * FROM tax_obligations WHERE user_id = 'c07862c6-5453-484f-9204-94a39fa451b1';

-- Check cashbook entries for company references
SELECT DISTINCT company_id, user_id FROM cashbook_entries WHERE user_id = 'c07862c6-5453-484f-9204-94a39fa451b1';

-- Check reminder logs for company references  
SELECT DISTINCT company_id, user_id FROM reminder_logs WHERE user_id = 'c07862c6-5453-484f-9204-94a39fa451b1';