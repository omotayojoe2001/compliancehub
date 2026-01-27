-- Fix subscription inconsistency - Ensure single FREE plan
-- User ID: f879bc6f-8ea9-47eb-8ff9-4495df531a53

BEGIN TRANSACTION;

-- 1. Check current subscriptions
SELECT * FROM subscriptions 
WHERE user_id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';

-- 2. Delete ALL existing subscriptions
DELETE FROM subscriptions 
WHERE user_id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';

-- 3. Create single FREE subscription
INSERT INTO subscriptions (
    user_id, 
    plan_type, 
    status, 
    amount
)
VALUES (
    'f879bc6f-8ea9-47eb-8ff9-4495df531a53',
    'free',
    'active',
    0
);

-- 4. Verify final state
SELECT 
    plan_type,
    status,
    amount,
    created_at
FROM subscriptions 
WHERE user_id = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';

COMMIT;