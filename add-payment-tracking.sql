-- Add payment status and overdue tracking columns
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS marked_paid_date TIMESTAMP;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS last_overdue_reminder TIMESTAMP;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS overdue_reminder_count INTEGER DEFAULT 0;

-- Add check constraint for payment status
ALTER TABLE tax_obligations DROP CONSTRAINT IF EXISTS payment_status_check;
ALTER TABLE tax_obligations ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'overdue'));

-- Update existing records to set overdue status for past due dates
UPDATE tax_obligations 
SET payment_status = 'overdue' 
WHERE next_due_date < CURRENT_DATE 
AND payment_status = 'pending' 
AND is_active = true;

-- Create index for efficient overdue queries
CREATE INDEX IF NOT EXISTS idx_tax_obligations_overdue 
ON tax_obligations(payment_status, next_due_date, is_active);