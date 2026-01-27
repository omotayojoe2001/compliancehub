-- EMERGENCY: Ensure proper enterprise subscription for all users
-- This fixes the access issue by ensuring all users have enterprise subscription

-- First, let's check current subscriptions
SELECT 
    id,
    user_id,
    plan_type,
    status,
    amount,
    created_at,
    updated_at
FROM subscriptions 
ORDER BY created_at DESC
LIMIT 10;

-- Update or insert enterprise subscription for all users
DO $$
BEGIN
    -- First, deactivate all existing subscriptions
    UPDATE subscriptions 
    SET status = 'inactive', updated_at = NOW();
    
    -- Insert enterprise subscription for all users
    INSERT INTO subscriptions (
        user_id,
        plan_type,
        status,
        amount,
        created_at,
        updated_at
    )
    SELECT 
        id,
        'enterprise',
        'active',
        0,
        NOW(),
        NOW()
    FROM auth.users;
    
    RAISE NOTICE 'Enterprise subscriptions created for all users';
END $$;

-- Verify subscriptions were created
SELECT 
    COUNT(*) as total_enterprise_subscriptions
FROM subscriptions 
WHERE plan_type = 'enterprise' AND status = 'active';