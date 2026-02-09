-- CRITICAL: Add indexes to fix slow queries (4+ seconds for 0 records is unacceptable)

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_created ON invoices(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- Invoice items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Tax obligations indexes
CREATE INDEX IF NOT EXISTS idx_tax_obligations_user_id ON tax_obligations(user_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Company profiles indexes
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);

-- ANALYZE tables to update statistics
ANALYZE invoices;
ANALYZE invoice_items;
ANALYZE tax_obligations;
ANALYZE subscriptions;
ANALYZE company_profiles;
