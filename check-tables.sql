-- Query to check all tables in the database
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Alternative query to get more details about tables
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Query to count rows in each table (run individually)
-- SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
-- UNION ALL
-- SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
-- UNION ALL  
-- SELECT 'tax_obligations' as table_name, COUNT(*) as row_count FROM tax_obligations
-- UNION ALL
-- SELECT 'user_tax_obligations' as table_name, COUNT(*) as row_count FROM user_tax_obligations
-- UNION ALL
-- SELECT 'reminder_logs' as table_name, COUNT(*) as row_count FROM reminder_logs
-- UNION ALL
-- SELECT 'user_reminder_logs' as table_name, COUNT(*) as row_count FROM user_reminder_logs
-- UNION ALL
-- SELECT 'subscriptions' as table_name, COUNT(*) as row_count FROM subscriptions;