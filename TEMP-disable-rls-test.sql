-- TEMPORARY: Disable RLS to test if that's the bottleneck
-- Run this, test invoice loading speed, then re-enable with the next script

ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
