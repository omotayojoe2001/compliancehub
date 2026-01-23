-- Check subscriptions table schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- Check current user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;