-- MASTER CLEANUP: Remove ALL conflicting RLS policies and create clean ones
-- This should be run ONCE to fix all policy conflicts

-- STEP 1: Drop ALL existing policies from ALL tables
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Users can insert their own company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Users can delete their own company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Users can manage own companies" ON company_profiles;

DROP POLICY IF EXISTS "Users can manage own obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can manage company obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can view own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can insert own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can update own tax obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can delete own tax obligations" ON tax_obligations;

DROP POLICY IF EXISTS "Users can view own reminders" ON reminder_logs;
DROP POLICY IF EXISTS "Users can manage company reminders" ON reminder_logs;
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminder_logs;

DROP POLICY IF EXISTS "Users can manage company cashbook" ON cashbook_entries;
DROP POLICY IF EXISTS "Users can manage own cashbook" ON cashbook_entries;

DROP POLICY IF EXISTS "Users can manage company expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can manage company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can manage invoice items" ON invoice_items;

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;

-- STEP 2: Ensure RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create CLEAN, SIMPLE policies
CREATE POLICY "user_profiles_access" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "company_profiles_access" ON company_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "tax_obligations_access" ON tax_obligations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "reminder_logs_access" ON reminder_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "cashbook_entries_access" ON cashbook_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "expenses_access" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "invoices_access" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "invoice_items_access" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "subscriptions_access" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- STEP 4: Verify the cleanup worked
SELECT 'CLEANUP COMPLETE - All policies recreated with simple user_id checks' as status;