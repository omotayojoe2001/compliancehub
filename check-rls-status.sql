-- Check current RLS status and policies
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'company_profiles', 'tax_obligations', 'reminder_logs', 'cashbook_entries', 'invoices')
ORDER BY tablename;

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if we can see any data with service role (bypass RLS)
-- This will show if data exists but is blocked by RLS