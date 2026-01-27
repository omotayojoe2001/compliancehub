-- Fix 1: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_obligations_user_id ON tax_obligations(user_id);

-- Fix 2: Revoke excessive permissions from anon role
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon;

-- Fix 3: Grant only necessary permissions to anon (read-only access)
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON company_profiles TO anon;
-- Remove other SELECT grants if anon shouldn't access sensitive data

-- Fix 4: Ensure authenticated users have appropriate access
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON company_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_obligations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reminder_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;