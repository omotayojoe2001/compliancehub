-- EMERGENCY DATABASE RESET AND FIX
-- Run this to completely reset database permissions and ensure data access

-- STEP 1: Drop all complex RLS policies that are causing issues
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own companies" ON company_profiles;
DROP POLICY IF EXISTS "Users can manage company obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can manage company reminders" ON reminder_logs;
DROP POLICY IF EXISTS "Users can manage company cashbook" ON cashbook_entries;
DROP POLICY IF EXISTS "Users can manage company expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;

-- STEP 2: Create SIMPLE RLS policies that only check user_id
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own companies" ON company_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own obligations" ON tax_obligations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders" ON reminder_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cashbook" ON cashbook_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage invoice items" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- STEP 3: Check what data actually exists
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'company_profiles', COUNT(*) FROM company_profiles
UNION ALL
SELECT 'tax_obligations', COUNT(*) FROM tax_obligations
UNION ALL
SELECT 'reminder_logs', COUNT(*) FROM reminder_logs
UNION ALL
SELECT 'cashbook_entries', COUNT(*) FROM cashbook_entries
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices;