-- Add subscription for first user (gooddeedsinitiative@gmail.com)
INSERT INTO subscriptions (
  user_id,
  status
) VALUES (
  'c07862c6-5453-484f-9204-94a39fa451b1',
  'active'
) ON CONFLICT (user_id) DO UPDATE SET
  status = EXCLUDED.status;

-- Verify subscription was created
SELECT u.email, s.status
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = 'c07862c6-5453-484f-9204-94a39fa451b1';