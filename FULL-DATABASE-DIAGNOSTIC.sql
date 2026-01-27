-- FULL DATABASE DIAGNOSTIC - Find the root cause of app disconnection
-- Run this to see EVERYTHING in your database

-- 1. CHECK DATABASE CONNECTION
SELECT 'DATABASE CONNECTION TEST' as test, current_database() as database_name, current_user as user_name, now() as timestamp;

-- 2. LIST ALL TABLES IN DATABASE
SELECT 'ALL TABLES IN DATABASE:' as info;
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. CHECK ALL COLUMNS IN EACH TABLE
SELECT 'TABLE STRUCTURES:' as info;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 4. COUNT RECORDS IN ALL TABLES
SELECT 'RECORD COUNTS:' as info;
SELECT 
    schemaname,
    tablename, 
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. SHOW ALL DATA FROM EACH TABLE (LIMITED)
SELECT 'USER_PROFILES DATA:' as info;
SELECT * FROM user_profiles LIMIT 10;

SELECT 'COMPANY_PROFILES DATA:' as info;
SELECT * FROM company_profiles LIMIT 10;

SELECT 'SUBSCRIPTIONS DATA:' as info;
SELECT * FROM subscriptions LIMIT 10;

SELECT 'TAX_OBLIGATIONS DATA:' as info;
SELECT * FROM tax_obligations LIMIT 10;

SELECT 'REMINDER_LOGS DATA:' as info;
SELECT * FROM reminder_logs LIMIT 10;

-- 6. CHECK FOR FOREIGN KEY RELATIONSHIPS
SELECT 'FOREIGN KEY CONSTRAINTS:' as info;
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';

-- 7. CHECK FOR INDEXES
SELECT 'INDEXES:' as info;
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. CHECK DATABASE PERMISSIONS
SELECT 'DATABASE PERMISSIONS:' as info;
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
ORDER BY grantee, table_name;

-- 9. SHOW ANY ERRORS OR ISSUES
SELECT 'RECENT DATABASE ACTIVITY:' as info;
SELECT query, state, query_start, state_change
FROM pg_stat_activity 
WHERE datname = current_database()
AND state IS NOT NULL
ORDER BY query_start DESC
LIMIT 5;