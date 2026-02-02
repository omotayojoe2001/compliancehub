-- Add bank account details columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN invoices.bank_name IS 'Bank name for payment instructions on invoice';
COMMENT ON COLUMN invoices.bank_account_name IS 'Account holder name for payment instructions';
COMMENT ON COLUMN invoices.bank_account_number IS 'Account number for payment instructions';