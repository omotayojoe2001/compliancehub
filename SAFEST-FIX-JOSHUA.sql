-- SAFEST FIX: Minimal Single Update
-- This is the safest approach for production

-- STEP 1: First, just CHECK what we'll update (READ ONLY)
-- Copy and run this first:

SELECT 
    u.id,
    u.email,
    s.plan_type as current_plan,
    s.status,
    'Will change to: enterprise' as new_plan
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';

-- Review the output above. If it shows Joshua's account, proceed to Step 2.
-- If it shows multiple accounts or wrong account, STOP and let me know.


-- STEP 2: If Step 1 looks correct, run this single UPDATE
-- This only changes plan_type to 'enterprise' for Joshua

UPDATE subscriptions 
SET plan_type = 'enterprise', updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%'
);


-- STEP 3: Verify it worked

SELECT 
    u.email,
    s.plan_type,
    s.status
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email ILIKE '%joshua%' OR u.email ILIKE '%omotayo%';

-- You should see plan_type = 'enterprise'
