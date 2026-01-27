-- Diagnose subscription display issues
-- Check what data exists vs what frontend might expect

-- Check all active subscriptions with user details
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.plan_type,
    s.status,
    s.amount,
    s.paystack_customer_code,
    s.paystack_subscription_code,
    s.next_payment_date,
    s.created_at,
    s.updated_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;

-- Check if there are multiple active subscriptions per user (this could cause display issues)
SELECT 
    user_id,
    COUNT(*) as active_subscription_count
FROM subscriptions 
WHERE status = 'active'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Check subscription data structure that frontend might expect
SELECT DISTINCT
    plan_type,
    status,
    CASE 
        WHEN paystack_customer_code IS NULL THEN 'Missing paystack_customer_code'
        ELSE 'Has paystack_customer_code'
    END as paystack_status
FROM subscriptions
WHERE status = 'active';