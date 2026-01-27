-- Filing Requests Table
CREATE TABLE IF NOT EXISTS filing_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  
  -- Request Details
  filing_type VARCHAR(50) NOT NULL DEFAULT 'tax_filing', -- tax_filing, vat_filing, etc
  filing_period VARCHAR(20) NOT NULL, -- e.g., "2024-01", "Q1-2024"
  amount DECIMAL(15,2) NOT NULL DEFAULT 10000.00, -- Filing fee in Naira
  
  -- Payment Details
  payment_reference VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Request Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, cancelled
  admin_notes TEXT,
  
  -- Data Snapshot (JSON of all relevant data at time of request)
  profile_data JSONB,
  transactions_data JSONB,
  cashbook_summary JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filing_requests_user_id ON filing_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_filing_requests_status ON filing_requests(status);
CREATE INDEX IF NOT EXISTS idx_filing_requests_payment_status ON filing_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_filing_requests_created_at ON filing_requests(created_at);

-- RLS Policies
ALTER TABLE filing_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own filing requests
CREATE POLICY "Users can view own filing requests" ON filing_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create filing requests
CREATE POLICY "Users can create filing requests" ON filing_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own filing requests (for payment updates)
CREATE POLICY "Users can update own filing requests" ON filing_requests
  FOR UPDATE USING (auth.uid() = user_id);