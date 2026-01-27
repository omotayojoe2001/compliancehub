-- DROP ALL POLICIES FIRST
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Then recreate clean policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

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

SELECT 'POLICY RESET COMPLETE' as status;