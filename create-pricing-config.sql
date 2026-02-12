-- Create pricing_config table for admin-managed prices
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT UNIQUE NOT NULL,
  price_kobo INTEGER NOT NULL, -- Price in kobo (₦1 = 100 kobo)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default prices
INSERT INTO pricing_config (service_name, price_kobo, description) VALUES
('filing_service', 1000000, 'Professional tax filing service fee')
ON CONFLICT (service_name) DO NOTHING;

-- Enable RLS
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Anyone can read pricing"
ON pricing_config
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update (restrict to admin later)
CREATE POLICY "Authenticated users can update pricing"
ON pricing_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
