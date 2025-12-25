-- Remove the check constraint that's blocking test plan values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add a new constraint that allows test plans
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('free', 'test100', 'test200', 'basic', 'pro', 'annual'));

-- Now sync the profile plan with subscription
UPDATE profiles 
SET plan = subscriptions.plan_type
FROM subscriptions 
WHERE profiles.id = subscriptions.user_id
  AND profiles.plan != subscriptions.plan_type;