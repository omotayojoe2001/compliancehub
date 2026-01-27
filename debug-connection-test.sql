-- Simple connection and table access test
-- Run these queries one by one to identify where the timeout occurs

-- 1. Test basic connection
SELECT NOW() as current_time;

-- 2. Test table existence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tax_obligations', 'reminder_logs');

-- 3. Test simple count queries (should be fast)
SELECT 'tax_obligations' as table_name, COUNT(*) as row_count FROM tax_obligations
UNION ALL
SELECT 'reminder_logs' as table_name, COUNT(*) as row_count FROM reminder_logs;

-- 4. Test with user filter (this might timeout if RLS is the issue)
-- Replace 'your-user-id' with actual user ID
SELECT COUNT(*) FROM tax_obligations WHERE user_id = 'your-user-id';
SELECT COUNT(*) FROM reminder_logs WHERE user_id = 'your-user-id';