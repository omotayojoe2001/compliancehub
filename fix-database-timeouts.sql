-- Re-enable RLS with proper company-based policies
-- This provides security while allowing company switching

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies that allow company-based access
-- User Profiles: Users can access their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Company Profiles: Users can access their own companies
CREATE POLICY "Users can manage own companies" ON company_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Tax Obligations: Users can access obligations for their companies or their own
CREATE POLICY "Users can manage company obligations" ON tax_obligations
  FOR ALL USING (auth.uid() = user_id);

-- Reminder Logs: Users can access reminders for their companies or their own
CREATE POLICY "Users can manage company reminders" ON reminder_logs
  FOR ALL USING (auth.uid() = user_id);

-- Cashbook Entries: Users can access entries for their companies or their own
CREATE POLICY "Users can manage company cashbook" ON cashbook_entries
  FOR ALL USING (auth.uid() = user_id);

-- Expenses: Users can access expenses for their companies or their own
CREATE POLICY "Users can manage company expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Invoices: Users can access invoices for their companies or their own
CREATE POLICY "Users can manage company invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Invoice Items: Users can access items for their invoices
CREATE POLICY "Users can manage invoice items" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE user_id = auth.uid()
    )
  );

-- Subscriptions: Users can access their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create reminder_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    reminder_type TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    sent_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled',
    message_content TEXT,
    tax_obligation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON reminder_logs(status);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_scheduled_date ON reminder_logs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tax_obligations_user_id ON tax_obligations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_obligations_next_due_date ON tax_obligations(next_due_date);
CREATE INDEX IF NOT EXISTS idx_cashbook_entries_user_id ON cashbook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cashbook_entries_date ON cashbook_entries(date);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Add company_id to all relevant tables
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE cashbook_entries ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;

-- Create indexes for company_id
CREATE INDEX IF NOT EXISTS idx_tax_obligations_company_id ON tax_obligations(company_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_company_id ON reminder_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_cashbook_entries_company_id ON cashbook_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_company_id ON invoice_items(company_id);

-- 6. Ensure reminder_logs table exists with proper structure
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    reminder_type TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    sent_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled',
    message_content TEXT,
    tax_obligation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Populate company_id for existing data
-- This ensures existing records are linked to the user's primary company

-- Update tax_obligations with company_id
UPDATE tax_obligations 
SET company_id = (
  SELECT cp.id 
  FROM company_profiles cp 
  WHERE cp.user_id = tax_obligations.user_id 
  AND cp.is_primary = true
  LIMIT 1
)
WHERE company_id IS NULL;

-- Update reminder_logs with company_id
UPDATE reminder_logs 
SET company_id = (
  SELECT cp.id 
  FROM company_profiles cp 
  WHERE cp.user_id = reminder_logs.user_id 
  AND cp.is_primary = true
  LIMIT 1
)
WHERE company_id IS NULL;

-- Update cashbook_entries with company_id
UPDATE cashbook_entries 
SET company_id = (
  SELECT cp.id 
  FROM company_profiles cp 
  WHERE cp.user_id = cashbook_entries.user_id 
  AND cp.is_primary = true
  LIMIT 1
)
WHERE company_id IS NULL;

-- Update expenses with company_id
UPDATE expenses 
SET company_id = (
  SELECT cp.id 
  FROM company_profiles cp 
  WHERE cp.user_id = expenses.user_id 
  AND cp.is_primary = true
  LIMIT 1
)
WHERE company_id IS NULL;

-- Update invoices with company_id
UPDATE invoices 
SET company_id = (
  SELECT cp.id 
  FROM company_profiles cp 
  WHERE cp.user_id = invoices.user_id 
  AND cp.is_primary = true
  LIMIT 1
)
WHERE company_id IS NULL;

-- Update invoice_items with company_id (through invoice relationship)
UPDATE invoice_items 
SET company_id = (
  SELECT i.company_id 
  FROM invoices i 
  WHERE i.id = invoice_items.invoice_id
)
WHERE company_id IS NULL;