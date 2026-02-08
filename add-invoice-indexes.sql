-- Add indexes to speed up invoice queries

-- Index for invoice_items.invoice_id (used in RLS policies and joins)
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Index for invoices.user_id (used in RLS policies)
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- Composite index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
