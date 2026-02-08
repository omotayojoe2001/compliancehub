-- COMPREHENSIVE DIAGNOSTIC AND FIX
-- Run this to identify and fix the enterprise plan issue

-- ============================================
-- PART 1: DIAGNOSTIC - Find the root cause
-- ============================================

-- 1. Find all users with "joshua" or "omotayo" in email
SELECT 
    'USER INFO' as section,
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
ORDER BY created_at DESC;

-- 2. Check their subscriptions
SELECT 
    'SUBSCRIPTION INFO' as section,
    s.id,
    s.user_id,
    u.email,
    s.plan_type,
    s.status,
    s.amount,
    s.created_at as subscription_created,
    s.updated_at as subscription_updated
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%'
ORDER BY s.created_at DESC;

-- 3. Check their company profiles count
SELECT 
    'COMPANY COUNT' as section,
    u.email,
    COUNT(cp.id) as total_companies,
    array_agg(cp.company_name) as company_names
FROM auth.users u
LEFT JOIN company_profiles cp ON u.id = cp.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%'
GROUP BY u.id, u.email;

-- 4. Check for duplicate or conflicting subscriptions
SELECT 
    'DUPLICATE CHECK' as section,
    user_id,
    COUNT(*) as subscription_count,
    array_agg(plan_type) as all_plans,
    array_agg(status) as all_statuses
FROM subscriptions
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
)
GROUP BY user_id
HAVING COUNT(*) > 1;

-- ============================================
-- PART 2: THE FIX
-- ============================================

-- Fix 1: Ensure subscriptions table has unique constraint on user_id
DO $$
BEGIN
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_user_id_unique'
    ) THEN
        -- First, remove any duplicate subscriptions (keep the most recent)
        DELETE FROM subscriptions s1
        WHERE EXISTS (
            SELECT 1 FROM subscriptions s2
            WHERE s2.user_id = s1.user_id
            AND s2.created_at > s1.created_at
        );
        
        -- Now add the unique constraint
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
        
        RAISE NOTICE 'Added unique constraint on subscriptions.user_id';
    END IF;
END $$;

-- Fix 2: Set enterprise plan for the user
DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT;
    existing_plan TEXT;
BEGIN
    -- Find the user
    SELECT id, email INTO target_user_id, target_email
    FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email containing joshua or omotayo';
    END IF;
    
    RAISE NOTICE 'Processing user: % (ID: %)', target_email, target_user_id;
    
    -- Check existing plan
    SELECT plan_type INTO existing_plan
    FROM subscriptions
    WHERE user_id = target_user_id AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE 'Current plan: %', COALESCE(existing_plan, 'NONE');
    
    -- Upsert enterprise subscription
    INSERT INTO subscriptions (
        user_id,
        plan_type,
        status,
        amount,
        created_at,
        updated_at
    ) VALUES (
        target_user_id,
        'enterprise',
        'active',
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        plan_type = 'enterprise',
        status = 'active',
        updated_at = NOW()
    WHERE subscriptions.user_id = target_user_id;
    
    RAISE NOTICE 'Enterprise subscription set successfully!';
    
END $$;

-- ============================================
-- PART 3: VERIFICATION
-- ============================================

-- Verify the fix worked
SELECT 
    'VERIFICATION' as section,
    u.email,
    u.id as user_id,
    s.plan_type,
    s.status,
    s.updated_at,
    (SELECT COUNT(*) FROM company_profiles WHERE user_id = u.id) as company_count,
    CASE 
        WHEN s.plan_type = 'enterprise' THEN '✓ FIXED - Enterprise plan active'
        WHEN s.plan_type IS NULL THEN '✗ ERROR - No subscription found'
        ELSE '✗ ERROR - Wrong plan: ' || s.plan_type
    END as fix_status
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';
