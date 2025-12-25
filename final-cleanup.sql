-- FINAL CLEANUP: Remove duplicate tables
-- Data has been successfully migrated, now remove the duplicates

DROP TABLE user_profiles CASCADE;
DROP TABLE user_tax_obligations CASCADE; 
DROP TABLE user_reminder_logs CASCADE;

-- Verify cleanup - should show only 4 tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;