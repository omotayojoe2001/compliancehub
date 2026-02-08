-- SIMPLE FIX: Set Enterprise Plan for Joshua Omotayo
-- This script fixes the subscription issue with minimal changes

-- Step 1: Check current subscription columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Find Joshua's user ID and current subscription
SELECT 
    u.id as user_id,
    u.email,
    s.id as subscription_id,
    s.plan_type,
    s.status,
    (SELECT COUNT(*) FROM company_profiles WHERE user_id = u.id) as company_count
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';

-- Step 3: Delete any existing subscriptions for this user (to avoid conflicts)
DELETE FROM subscriptions 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
);

-- Step 4: Insert new enterprise subscription
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
FROM auth.users 
WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%';

-- Step 5: Verify the fix
SELECT 
    u.email,
    s.plan_type,
    s.status,
    s.created_at,
    (SELECT COUNT(*) FROM company_profiles WHERE user_id = u.id) as company_count
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';
