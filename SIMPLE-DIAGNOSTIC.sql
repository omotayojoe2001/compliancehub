-- SIMPLE DIAGNOSTIC - ALL RESULTS IN ONE VIEW
-- This will show everything in a single result set

WITH database_info AS (
    SELECT 
        'DATABASE_INFO' as section,
        current_database() as detail_name,
        current_user as detail_value,
        1 as sort_order
    UNION ALL
    SELECT 
        'DATABASE_INFO' as section,
        'postgres_version' as detail_name,
        version() as detail_value,
        2 as sort_order
),
schema_info AS (
    SELECT 
        'SCHEMAS' as section,
        schema_name as detail_name,
        schema_owner as detail_value,
        3 as sort_order
    FROM information_schema.schemata 
),
table_info AS (
    SELECT 
        'ALL_TABLES' as section,
        table_schema || '.' || table_name as detail_name,
        table_type as detail_value,
        4 as sort_order
    FROM information_schema.tables 
),
user_tables AS (
    SELECT 
        'USER_TABLES_ONLY' as section,
        table_name as detail_name,
        'EXISTS' as detail_value,
        5 as sort_order
    FROM information_schema.tables 
    WHERE table_schema = 'public'
),
table_columns AS (
    SELECT 
        'TABLE_COLUMNS' as section,
        table_name || '.' || column_name as detail_name,
        data_type || ' (' || COALESCE(is_nullable, 'unknown') || ')' as detail_value,
        6 as sort_order
    FROM information_schema.columns 
    WHERE table_schema = 'public'
),
core_tables_check AS (
    SELECT 
        'CORE_TABLES_STATUS' as section,
        'user_profiles' as detail_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
             THEN 'EXISTS' ELSE 'MISSING' END as detail_value,
        7 as sort_order
    UNION ALL
    SELECT 
        'CORE_TABLES_STATUS' as section,
        'company_profiles' as detail_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_profiles' AND table_schema = 'public') 
             THEN 'EXISTS' ELSE 'MISSING' END as detail_value,
        7 as sort_order
    UNION ALL
    SELECT 
        'CORE_TABLES_STATUS' as section,
        'subscriptions' as detail_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') 
             THEN 'EXISTS' ELSE 'MISSING' END as detail_value,
        7 as sort_order
),
error_check AS (
    SELECT 
        'ERROR_DIAGNOSIS' as section,
        'database_status' as detail_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') = 0 
            THEN 'ERROR: No user tables found'
            WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
            THEN 'ERROR: user_profiles missing'
            ELSE 'OK: Database appears functional'
        END as detail_value,
        8 as sort_order
)
SELECT 
    section,
    detail_name,
    detail_value
FROM (
    SELECT * FROM database_info
    UNION ALL SELECT * FROM schema_info
    UNION ALL SELECT * FROM table_info
    UNION ALL SELECT * FROM user_tables
    UNION ALL SELECT * FROM table_columns
    UNION ALL SELECT * FROM core_tables_check
    UNION ALL SELECT * FROM error_check
) combined
ORDER BY sort_order, section, detail_name;