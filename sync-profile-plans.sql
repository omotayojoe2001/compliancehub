-- Sync profile plans with subscription records for all users
-- This fixes the mismatch between what users paid for vs what's in their profile

UPDATE profiles 
SET plan = subscriptions.plan_type
FROM subscriptions 
WHERE profiles.id = subscriptions.user_id
  AND profiles.plan != subscriptions.plan_type;