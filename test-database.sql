-- TEST SCRIPT - Run this after the emergency fix to verify everything works
-- This will show you if all tables exist and have data

-- Check if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('user_profiles'),
        ('company_profiles'),
        ('subscriptions'),
        ('tax_obligations'),
        ('reminder_logs')
) AS required_tables(table_name);

-- Check data in each table
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'company_profiles', COUNT(*) FROM company_profiles
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'tax_obligations', COUNT(*) FROM tax_obligations
UNION ALL
SELECT 'reminder_logs', COUNT(*) FROM reminder_logs;

-- Show sample data
SELECT 'USER PROFILES:' as info;
-- Check if plan column exists before selecting it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'plan') THEN
        RAISE NOTICE 'Plan column exists - showing data with plan';
    ELSE
        RAISE NOTICE 'Plan column missing - run EMERGENCY-PLAN-COLUMN-FIX.sql first!';
    END IF;
END $$;

-- Try to select with plan column, fallback if it doesn't exist
SELECT 
    id, 
    business_name, 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'plan') 
        THEN plan 
        ELSE 'MISSING_COLUMN' 
    END as plan,
    created_at 
FROM user_profiles LIMIT 5;

SELECT 'COMPANY PROFILES:' as info;
SELECT id, company_name, tin, is_primary FROM company_profiles LIMIT 5;

SELECT 'SUBSCRIPTIONS:' as info;
SELECT user_id, status FROM subscriptions LIMIT 5;