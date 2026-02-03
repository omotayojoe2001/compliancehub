-- Create tax_rates table for admin management
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tax_type VARCHAR(50) NOT NULL,
    rate_name VARCHAR(100) NOT NULL,
    rate_percentage DECIMAL(5,2) NOT NULL CHECK (rate_percentage >= 0 AND rate_percentage <= 100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tax rates
INSERT INTO tax_rates (tax_type, rate_name, rate_percentage, description, is_active) VALUES
('VAT', 'Standard VAT', 7.5, 'Value Added Tax', true),
('PAYE', 'PAYE Tax', 24.0, 'Pay As You Earn (Maximum Rate)', true),
('CIT', 'Company Income Tax', 30.0, 'Company Income Tax', true),
('WHT_PROFESSIONAL', 'Professional Services', 5.0, 'Withholding Tax - Professional Services', true),
('WHT_DIVIDEND', 'Dividend', 10.0, 'Withholding Tax - Dividend', true),
('WHT_CONSTRUCTION', 'Construction', 2.5, 'Withholding Tax - Construction', true),
('CGT', 'Capital Gains Tax', 10.0, 'Capital Gains Tax', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Add role column to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create policy for admin access only
CREATE POLICY "Admin can manage tax rates" ON tax_rates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Create policy for public read access (for calculators)
CREATE POLICY "Public can read active tax rates" ON tax_rates
    FOR SELECT USING (is_active = true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tax_rates_type ON tax_rates(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active);