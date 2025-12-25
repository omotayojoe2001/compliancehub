-- Manually create subscription record for testing
-- Replace 'your-user-id' with your actual user ID from the profile check

INSERT INTO subscriptions (
  user_id, 
  plan_type, 
  status, 
  paystack_subscription_code, 
  amount, 
  next_payment_date
) VALUES (
  'f879bc6f-8ea9-47eb-8ff9-4495df531a53', -- Your user ID from the logs
  'test100', 
  'active', 
  'test_reference_123', 
  10000, 
  CURRENT_DATE + INTERVAL '30 days'
);