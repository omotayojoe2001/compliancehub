-- Check RLS policies that might be causing timeouts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tax_obligations', 'reminder_logs', 'user_profiles', 'company_profiles', 'subscriptions')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tax_obligations', 'reminder_logs', 'user_profiles', 'company_profiles', 'subscriptions')
ORDER BY tablename;

-- Check table permissions
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('tax_obligations', 'reminder_logs', 'user_profiles', 'company_profiles', 'subscriptions')
ORDER BY table_name, grantee;