-- Fix plan structure to match business requirements
-- Standardize to 4 plans: free, basic, pro, enterprise

-- First, see current state
SELECT plan_type, status, COUNT(*) as count 
FROM subscriptions 
GROUP BY plan_type, status;

-- Fix plan constraints
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise'));

-- Clean up test plans - convert test200 to free
UPDATE subscriptions 
SET plan_type = 'free'
WHERE plan_type = 'test200';

-- Ensure all users have a subscription record
INSERT INTO subscriptions (user_id, plan_type, status, amount)
SELECT 
    id,
    'free',
    'active',
    0
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM subscriptions WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Verify final state
SELECT 
    plan_type,
    status,
    COUNT(*) as count,
    COUNT(paystack_customer_code) as with_paystack
FROM subscriptions 
GROUP BY plan_type, status
ORDER BY plan_type;