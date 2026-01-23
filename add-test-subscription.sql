-- Check subscriptions table schema first
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- Check current user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Insert subscription with minimal required columns (replace USER_ID_HERE with actual ID)
INSERT INTO subscriptions (
  user_id,
  status
) VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  status = EXCLUDED.status;

-- Verify subscription was created
SELECT u.email, s.status
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC
LIMIT 5;