-- Check if tax_obligations table exists and create it if not
CREATE TABLE IF NOT EXISTS tax_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  obligation_type TEXT NOT NULL,
  tax_period TEXT,
  frequency TEXT CHECK (frequency IN ('monthly', 'quarterly', 'biannually', 'annually', '15months', '18months', '2years', '3years', 'one-time')),
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_due DECIMAL(12,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
  marked_paid_date TIMESTAMP WITH TIME ZONE,
  last_overdue_reminder TIMESTAMP WITH TIME ZONE,
  overdue_reminder_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS amount_due DECIMAL(12,2);
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS tax_period TEXT;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS marked_paid_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS last_overdue_reminder TIMESTAMP WITH TIME ZONE;
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS overdue_reminder_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (drop first if exists)
DROP POLICY IF EXISTS "Users can manage own tax obligations" ON tax_obligations;
CREATE POLICY "Users can manage own tax obligations" ON tax_obligations FOR ALL USING (auth.uid() = user_id);