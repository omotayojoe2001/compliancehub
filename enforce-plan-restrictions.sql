-- Enforce plan restrictions for ALL users
-- Fix subscription inconsistencies and apply proper limits

BEGIN TRANSACTION;

-- 1. Clean up duplicate subscriptions (keep only latest per user)
DELETE FROM subscriptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM subscriptions
    ORDER BY user_id, created_at DESC
);

-- 2. Set default FREE plan for users without subscriptions
INSERT INTO subscriptions (user_id, plan_type, status, amount)
SELECT 
    u.id,
    'free',
    'active',
    0
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE s.id IS NULL;

-- 3. Show all users with their plan restrictions
SELECT 
    u.email,
    s.plan_type,
    s.status,
    s.amount,
    CASE 
        WHEN s.plan_type = 'free' THEN 'View only - no active profiles'
        WHEN s.plan_type = 'basic' THEN 'Up to 1 company profile'
        WHEN s.plan_type = 'pro' THEN 'Up to 5 company profiles'
        WHEN s.plan_type = 'enterprise' THEN 'Unlimited'
        ELSE 'No plan assigned'
    END as company_profile_limit,
    CASE 
        WHEN s.plan_type = 'free' THEN 'View only - no active obligations'
        WHEN s.plan_type = 'basic' THEN 'Up to 3 tax obligations'
        WHEN s.plan_type IN ('pro', 'enterprise') THEN 'Unlimited'
        ELSE 'No plan assigned'
    END as tax_obligation_limit
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
ORDER BY u.created_at;

COMMIT;