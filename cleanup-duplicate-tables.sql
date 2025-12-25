-- CLEANUP SCRIPT: Remove duplicate tables and standardize schema
-- Run this to clean up your database and use only one consistent schema

-- First, check if there's any data in the user_* tables that needs to be migrated
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'user_tax_obligations' as table_name, COUNT(*) as row_count FROM user_tax_obligations
UNION ALL
SELECT 'user_reminder_logs' as table_name, COUNT(*) as row_count FROM user_reminder_logs;

-- If the above shows 0 rows in all user_* tables, run the cleanup:
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS user_tax_obligations CASCADE;
-- DROP TABLE IF EXISTS user_reminder_logs CASCADE;

-- After cleanup, you'll have these 4 tables:
-- 1. profiles
-- 2. tax_obligations
-- 3. reminder_logs  
-- 4. subscriptions