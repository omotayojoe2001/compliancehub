-- EMERGENCY FIX - Run this immediately in Supabase SQL Editor
-- This completely disables all security and creates missing tables

-- 1. Disable ALL RLS on ALL tables
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tax_obligations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reminder_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies (ignore errors)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- 3. Create missing tables with minimal structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT DEFAULT 'Your Business',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL DEFAULT 'Default Company',
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    obligation_type TEXT NOT NULL,
    next_due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    reminder_type TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Grant FULL access to everyone
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 5. Insert default data for current user
INSERT INTO user_profiles (id, business_name) 
SELECT auth.uid(), 'Your Business' 
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name;

INSERT INTO company_profiles (user_id, company_name, is_primary)
SELECT auth.uid(), 'Default Company', true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;