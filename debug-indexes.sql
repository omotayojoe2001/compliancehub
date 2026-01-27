-- Check indexes on tables that are timing out
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('tax_obligations', 'reminder_logs', 'user_profiles', 'company_profiles', 'subscriptions')
ORDER BY tablename, indexname;

-- Check if user_id columns have indexes (critical for performance)
SELECT 
    t.table_name,
    c.column_name,
    CASE 
        WHEN i.indexname IS NOT NULL THEN 'INDEXED'
        ELSE 'NOT INDEXED'
    END as index_status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_indexes i ON t.table_name = i.tablename AND c.column_name = ANY(string_to_array(replace(replace(i.indexdef, '(', ''), ')', ''), ', '))
WHERE t.table_schema = 'public' 
AND t.table_name IN ('tax_obligations', 'reminder_logs', 'user_profiles', 'company_profiles', 'subscriptions')
AND c.column_name LIKE '%user_id%'
ORDER BY t.table_name, c.column_name;