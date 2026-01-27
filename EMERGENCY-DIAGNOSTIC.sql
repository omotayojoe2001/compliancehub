-- EMERGENCY DIAGNOSTIC - COMPLETE DATABASE ANALYSIS
-- Run this to see EVERYTHING in the database and identify ALL errors

-- =============================================================================
-- SECTION 1: CONNECTION & BASIC INFO
-- =============================================================================

-- Test 1: Connection Test
SELECT 'CONNECTION TEST' as test_name, 'SUCCESS' as status, NOW() as timestamp;

-- Test 2: Database Info
SELECT 
    current_database() as database_name,
    current_user as connected_user,
    version() as postgres_version;

-- =============================================================================
-- SECTION 2: ALL SCHEMAS IN DATABASE
-- =============================================================================

-- Test 3: Show ALL schemas
SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
ORDER BY schema_name;

-- =============================================================================
-- SECTION 3: ALL TABLES IN ALL SCHEMAS
-- =============================================================================

-- Test 4: Show ALL tables in ALL schemas
SELECT 
    table_schema,
    table_name,
    table_type,
    CASE 
        WHEN table_schema = 'public' THEN 'USER TABLE'
        WHEN table_schema IN ('information_schema', 'pg_catalog') THEN 'SYSTEM TABLE'
        ELSE 'OTHER SCHEMA'
    END as table_category
FROM information_schema.tables 
ORDER BY table_schema, table_name;

-- Test 5: Count tables by schema
SELECT 
    table_schema,
    COUNT(*) as table_count
FROM information_schema.tables 
GROUP BY table_schema
ORDER BY table_count DESC;

-- =============================================================================
-- SECTION 4: USER TABLES ONLY (PUBLIC SCHEMA)
-- =============================================================================

-- Test 6: Show only user tables with row counts
SELECT 
    t.table_name,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- =============================================================================
-- SECTION 5: ALL COLUMNS FOR ALL USER TABLES
-- =============================================================================

-- Test 7: Show ALL columns for ALL user tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =============================================================================
-- SECTION 6: CONSTRAINTS AND RELATIONSHIPS
-- =============================================================================

-- Test 8: Show all constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- Test 9: Show foreign key relationships
SELECT 
    kcu.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    rc.constraint_name
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu 
    ON rc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON rc.unique_constraint_name = ccu.constraint_name
WHERE kcu.table_schema = 'public'
ORDER BY kcu.table_name;

-- =============================================================================
-- SECTION 7: INDEXES
-- =============================================================================

-- Test 10: Show all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================================================
-- SECTION 8: CORE TABLE EXISTENCE CHECK
-- =============================================================================

-- Test 11: Check specific core tables
SELECT 
    'user_profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'company_profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_profiles' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'subscriptions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'compliance_frameworks' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_frameworks' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'assessments' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessments' AND table_schema = 'public') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- =============================================================================
-- SECTION 9: SAFE ROW COUNTS (WON'T FAIL IF TABLES DON'T EXIST)
-- =============================================================================

-- Test 12: Safe row counts using dynamic approach
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public')
        THEN 'TABLE EXISTS - Run individual COUNT query'
        ELSE 'TABLE MISSING'
    END as count_status
FROM (VALUES 
    ('user_profiles'),
    ('company_profiles'),
    ('subscriptions'),
    ('compliance_frameworks'),
    ('assessments')
) AS t(table_name);

-- =============================================================================
-- SECTION 10: ERROR DETECTION
-- =============================================================================

-- Test 13: Check for common issues
SELECT 
    'Database Issues Check' as test_category,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') = 0 
        THEN 'ERROR: No user tables found in public schema'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN 'ERROR: user_profiles table missing'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_profiles' AND table_schema = 'public')
        THEN 'ERROR: company_profiles table missing'
        ELSE 'OK: Core tables appear to exist'
    END as diagnosis;

-- =============================================================================
-- SECTION 11: PERMISSIONS CHECK
-- =============================================================================

-- Test 14: Check current user permissions
SELECT 
    schemaname,
    tablename,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================================================
-- END OF DIAGNOSTIC
-- =============================================================================

SELECT 'DIAGNOSTIC COMPLETE' as status, 'Check all results above for issues' as message;