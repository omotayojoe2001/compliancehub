-- SUBSCRIPTION ACCESS CONTROL: Direct approach to avoid trigger conflicts
-- FREE: 0 profiles, BASIC: 1 profile, PRO: 5 profiles, ENTERPRISE: unlimited

-- Step 1: Mark expired subscriptions
UPDATE subscriptions SET status = 'expired' WHERE status = 'active' AND next_payment_date < NOW();

-- Step 2: Deactivate ALL profiles first
UPDATE company_profiles SET is_active = false;


CREATE TEMP TABLE allowed_profiles (id UUID PRIMARY KEY);

INSERT INTO allowed_profiles (id)
SELECT cp.id
FROM (
    SELECT cp.id,
           ROW_NUMBER() OVER (PARTITION BY cp.user_id ORDER BY cp.is_primary DESC, cp.created_at ASC) as rn
    FROM company_profiles cp
    JOIN subscriptions s ON cp.user_id = s.user_id
    WHERE s.plan_type = 'basic' AND s.status = 'active'
      AND (s.paystack_subscription_code IS NOT NULL AND s.paystack_subscription_code != '')
) sub
WHERE sub.rn = 1;

INSERT INTO allowed_profiles (id)
SELECT cp.id
FROM (
    SELECT cp.id,
           ROW_NUMBER() OVER (PARTITION BY cp.user_id ORDER BY cp.is_primary DESC, cp.created_at ASC) as rn
    FROM company_profiles cp
    JOIN subscriptions s ON cp.user_id = s.user_id
    WHERE s.plan_type = 'pro' AND s.status = 'active'
      AND (s.paystack_subscription_code IS NOT NULL AND s.paystack_subscription_code != '')
) sub
WHERE sub.rn <= 5;

INSERT INTO allowed_profiles (id)
SELECT cp.id
FROM company_profiles cp
JOIN subscriptions s ON cp.user_id = s.user_id
WHERE s.plan_type = 'enterprise' AND s.status = 'active';

UPDATE company_profiles SET is_active = true WHERE id IN (SELECT id FROM allowed_profiles);

DROP TABLE allowed_profiles;

SELECT u.email, s.plan_type, COUNT(cp.id) as active_profiles
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN company_profiles cp ON u.id = cp.user_id AND cp.is_active = true
GROUP BY u.email, s.plan_type
ORDER BY u.email;