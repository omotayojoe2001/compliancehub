-- SAFE VERSION: Check First, Then Fix
-- Run this in parts - verify each step before proceeding

-- ============================================
-- PART 1: READ ONLY - CHECK CURRENT STATE
-- Run this first to see what will be affected
-- ============================================

-- 1A. Find Joshua's account
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
LIMIT 5;

-- 1B. Check Joshua's current subscription(s)
SELECT 
    s.id as subscription_id,
    s.user_id,
    u.email,
    s.plan_type,
    s.status,
    s.amount,
    s.created_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';

-- 1C. Check Joshua's company profiles
SELECT 
    u.email,
    COUNT(cp.id) as company_count,
    array_agg(cp.company_name) as companies
FROM auth.users u
LEFT JOIN company_profiles cp ON u.id = cp.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%'
GROUP BY u.id, u.email;

-- ============================================
-- STOP HERE AND REVIEW THE RESULTS ABOVE
-- Make sure you see Joshua's account
-- Note the current plan_type value
-- ============================================


-- ============================================
-- PART 2: SAFE UPDATE - Only if Part 1 looks correct
-- This only updates Joshua's subscription, nothing else
-- ============================================

-- 2A. Update existing subscription (if one exists)
UPDATE subscriptions 
SET 
    plan_type = 'enterprise',
    status = 'active',
    updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
)
AND status = 'active';

-- 2B. Insert subscription if none exists
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
WHERE (email ILIKE '%joshua%' OR email ILIKE '%omotayo%')
AND id NOT IN (SELECT user_id FROM subscriptions WHERE status = 'active');


-- ============================================
-- PART 3: VERIFY THE FIX
-- ============================================

SELECT 
    u.email,
    s.plan_type,
    s.status,
    s.updated_at,
    (SELECT COUNT(*) FROM company_profiles WHERE user_id = u.id) as company_count
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';
