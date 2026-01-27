-- Check exact table names vs expected names
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'activity_logs',
        'calculator_templates',
        'calculator_usage', 
        'cashbook_entries',
        'company_profiles',
        'expenses',
        'guide_bookmarks',
        'guide_progress', 
        'invoice_items',
        'invoices',
        'notification_settings',
        'payments',
        'profiles',
        'reminder_logs',
        'subscriptions',
        'tax_calculations',
        'tax_obligations',
        'user_profiles'
    ]) AS expected_name
),
actual_tables AS (
    SELECT table_name AS actual_name
    FROM information_schema.tables 
    WHERE table_schema = 'public'
)
SELECT 
    'EXPECTED_VS_ACTUAL' as section,
    e.expected_name,
    CASE 
        WHEN a.actual_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status,
    a.actual_name as actual_name_found
FROM expected_tables e
LEFT JOIN actual_tables a ON e.expected_name = a.actual_name
UNION ALL
SELECT 
    'EXTRA_TABLES' as section,
    a.actual_name as expected_name,
    'EXTRA' as status,
    a.actual_name as actual_name_found
FROM actual_tables a
LEFT JOIN expected_tables e ON a.actual_name = e.expected_name
WHERE e.expected_name IS NULL
ORDER BY section, expected_name;