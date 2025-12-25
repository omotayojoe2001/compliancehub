-- CHECK ALL DATABASE INFORMATION

-- 1. Check all tables in the database
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check auth.users table (Supabase built-in)
SELECT id, email, email_confirmed_at, created_at, updated_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Check ALL profiles data
SELECT * FROM profiles ORDER BY created_at DESC;

-- 5. Check tax_obligations table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tax_obligations' 
ORDER BY ordinal_position;

-- 6. Check ALL tax_obligations data
SELECT * FROM tax_obligations ORDER BY created_at DESC;

-- 7. Check reminder_logs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reminder_logs' 
ORDER BY ordinal_position;

-- 8. Check ALL reminder_logs data
SELECT * FROM reminder_logs ORDER BY created_at DESC;

-- 9. Check subscriptions table if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- 10. Check ALL subscriptions data if table exists
SELECT * FROM subscriptions ORDER BY created_at DESC;

-- 11. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- 12. Check RLS status for all tables
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public';

-- 13. Count records in each table
SELECT 
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 
  'tax_obligations' as table_name, COUNT(*) as record_count FROM tax_obligations
UNION ALL
SELECT 
  'reminder_logs' as table_name, COUNT(*) as record_count FROM reminder_logs
UNION ALL
SELECT 
  'auth.users' as table_name, COUNT(*) as record_count FROM auth.users;

-- 14. Check specific user data (replace with actual user ID)
-- SELECT * FROM profiles WHERE id = '5fe85118-19ea-4c6a-89f2-5a42d00a7868';
-- SELECT * FROM tax_obligations WHERE user_id = '5fe85118-19ea-4c6a-89f2-5a42d00a7868';
-- SELECT * FROM reminder_logs WHERE user_id = '5fe85118-19ea-4c6a-89f2-5a42d00a7868';