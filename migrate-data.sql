-- MIGRATION SCRIPT: Move data from user_* tables to main tables
-- Run these commands in order:

-- 1. Migrate user_profiles to profiles (2 rows)
INSERT INTO profiles (id, business_name, phone, email, plan, subscription_status, created_at)
SELECT id, business_name, phone, email, plan, subscription_status, created_at
FROM user_profiles
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  plan = EXCLUDED.plan,
  subscription_status = EXCLUDED.subscription_status;

-- 2. Migrate user_tax_obligations to tax_obligations (9 rows)
INSERT INTO tax_obligations (id, user_id, obligation_type, next_due_date, tax_period, is_active, created_at)
SELECT id, user_id, tax_type as obligation_type, due_date as next_due_date, tax_period, 
       CASE WHEN status = 'pending' THEN true ELSE false END as is_active, created_at
FROM user_tax_obligations
ON CONFLICT (id) DO NOTHING;

-- 3. Verify migration worked
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'tax_obligations' as table_name, COUNT(*) as row_count FROM tax_obligations;

-- 4. After verifying data is migrated, clean up duplicate tables:
-- DROP TABLE user_profiles CASCADE;
-- DROP TABLE user_tax_obligations CASCADE; 
-- DROP TABLE user_reminder_logs CASCADE;