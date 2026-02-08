-- COMPREHENSIVE FIX: Enterprise Plan Issue
-- This script ensures enterprise users have proper plan_type set

-- Step 1: Find the user (Joshua Omotayo)
DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT;
BEGIN
    -- Find user by email pattern
    SELECT id, email INTO target_user_id, target_email
    FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User not found. Please check the email.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user: % (ID: %)', target_email, target_user_id;
    
    -- Step 2: Check current subscription
    RAISE NOTICE 'Current subscription status:';
    PERFORM id, plan_type, status, created_at 
    FROM subscriptions 
    WHERE user_id = target_user_id;
    
    -- Step 3: Upsert enterprise subscription
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
        updated_at = NOW();
    
    RAISE NOTICE 'Enterprise subscription set successfully!';
    
    -- Step 4: Verify the fix
    RAISE NOTICE 'Verification:';
    PERFORM 
        u.email,
        s.plan_type,
        s.status,
        s.updated_at
    FROM auth.users u
    LEFT JOIN subscriptions s ON u.id = s.user_id
    WHERE u.id = target_user_id;
    
END $$;

-- Final verification query
SELECT 
    u.email,
    u.id as user_id,
    s.plan_type,
    s.status,
    s.amount,
    s.created_at,
    s.updated_at,
    (SELECT COUNT(*) FROM company_profiles WHERE user_id = u.id) as company_count
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';
