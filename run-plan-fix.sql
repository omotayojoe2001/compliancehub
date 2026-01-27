-- Execute this to fix your plan structure
-- Run this in your Supabase SQL editor

-- First, drop the existing constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Clean up invalid plan types before adding constraint
UPDATE subscriptions 
SET plan_type = 'free'
WHERE plan_type NOT IN ('free', 'basic', 'pro', 'enterprise');

-- Now add the constraint after data is clean
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise'));

-- Ensure all users have a subscription record
INSERT INTO subscriptions (user_id, plan_type, status, amount)
SELECT 
    id,
    'free',
    'active',
    0
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM subscriptions WHERE user_id IS NOT NULL);

-- Verify final state
SELECT 
    plan_type,
    status,
    COUNT(*) as count,
    COUNT(paystack_customer_code) as with_paystack
FROM subscriptions 
GROUP BY plan_type, status
ORDER BY plan_type;