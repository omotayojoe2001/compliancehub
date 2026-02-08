-- DIAGNOSTIC SCRIPT: Enterprise Plan Issue
-- This script checks why an enterprise user sees "free plan" error

-- Step 1: Check all subscriptions for the user
SELECT 
  id,
  user_id,
  plan_type,
  plan,
  status,
  created_at,
  updated_at
FROM subscriptions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%joshua%' OR email LIKE '%omotayo%'
)
ORDER BY created_at DESC;

-- Step 2: Check if there's a 'plan' column (might be missing)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check user profiles
SELECT 
  id,
  user_id,
  business_name,
  first_name,
  last_name,
  email
FROM user_profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%joshua%' OR email LIKE '%omotayo%'
);

-- Step 4: Check company profiles count
SELECT 
  user_id,
  COUNT(*) as company_count,
  array_agg(company_name) as companies
FROM company_profiles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%joshua%' OR email LIKE '%omotayo%'
)
GROUP BY user_id;

-- Step 5: Check for any active subscriptions
SELECT 
  u.email,
  s.plan_type,
  s.status,
  s.created_at
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email LIKE '%joshua%' OR u.email LIKE '%omotayo%'
ORDER BY s.created_at DESC;
