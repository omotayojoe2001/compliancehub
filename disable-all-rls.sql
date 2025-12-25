-- Disable RLS on existing tables only
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tax_obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can insert own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can update own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can delete own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- Grant full access to anon and authenticated roles
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON tax_obligations TO anon, authenticated;
GRANT ALL ON subscriptions TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;