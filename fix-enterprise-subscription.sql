-- Check subscription for the enterprise user
SELECT id, user_id, plan_type, plan, status, created_at 
FROM subscriptions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%joshua%' OR email LIKE '%omotayo%'
)
ORDER BY created_at DESC;

-- If no subscription exists, create one for enterprise user
-- Replace 'USER_ID_HERE' with the actual user ID
INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end)
VALUES (
  'USER_ID_HERE',
  'enterprise',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
)
ON CONFLICT (user_id) DO UPDATE
SET plan_type = 'enterprise',
    status = 'active',
    current_period_end = NOW() + INTERVAL '1 year';

-- Verify the fix
SELECT u.email, s.plan_type, s.status 
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email LIKE '%joshua%' OR u.email LIKE '%omotayo%';
