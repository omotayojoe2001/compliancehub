-- Create guides table for how-to guides management
CREATE TABLE IF NOT EXISTS guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    duration VARCHAR(50),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    steps TEXT[] NOT NULL DEFAULT '{}',
    requirements TEXT[] NOT NULL DEFAULT '{}',
    youtube_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE guides ADD COLUMN category VARCHAR(20) DEFAULT 'General';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage guides (for admin)
DO $$ BEGIN
    CREATE POLICY "Authenticated users can manage guides" ON guides
        FOR ALL USING (auth.uid() IS NOT NULL);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Allow public read access for active guides
DO $$ BEGIN
    CREATE POLICY "Public can read active guides" ON guides
        FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Drop and recreate the public read policy to fix access
DROP POLICY IF EXISTS "Public can read active guides" ON guides;
CREATE POLICY "Public can read active guides" ON guides
    FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guides_active ON guides(is_active);
CREATE INDEX IF NOT EXISTS idx_guides_difficulty ON guides(difficulty);
CREATE INDEX IF NOT EXISTS idx_guides_created ON guides(created_at);

-- Insert default guides
INSERT INTO guides (title, description, category, duration, difficulty, steps, requirements, youtube_url) VALUES 
('LIRS VAT Filing Steps', 'Complete step-by-step guide to file your VAT returns with LIRS online', 'VAT', '30-45 minutes', 'beginner', 
 ARRAY['Visit LIRS Online Portal at https://www.lirs.gov.ng', 'Login to Your Account using TIN and password', 'Select VAT Returns from the menu', 'Fill Return Details with monthly VAT information', 'Calculate VAT Payable (Output VAT - Input VAT)', 'Submit and Pay if VAT is due', 'Download Receipt and save confirmation'],
 ARRAY['LIRS TIN (Tax Identification Number)', 'VAT Certificate', 'Monthly sales and purchase records', 'Bank statements', 'Internet connection'],
 'https://www.youtube.com/embed/dQw4w9WgXcQ'),

('CAC Annual Returns Guide', 'How to file your annual returns with Corporate Affairs Commission', 'CAC', '1-2 hours', 'intermediate',
 ARRAY['Prepare Required Documents', 'Visit CAC Portal at https://pre.cac.gov.ng', 'Complete Annual Return Form (CAC 2.1)', 'Upload Financial Statements in PDF format', 'Pay Filing Fee based on company type', 'Submit and Confirm all information'],
 ARRAY['Company incorporation documents', 'Audited financial statements', 'Board resolutions', 'Directors details', 'Shareholders information'],
 NULL),

('PAYE Monthly Remittance', 'Step-by-step guide to remit employee PAYE taxes monthly', 'PAYE', '20-30 minutes', 'beginner',
 ARRAY['Calculate PAYE Deductions from monthly payroll', 'Access LIRS Portal using company TIN', 'Select PAYE Returns for monthly remittance', 'Enter Employee Details with salary and deductions', 'Submit and Pay total PAYE due'],
 ARRAY['Employee payroll records', 'PAYE tax deductions', 'Company TIN', 'Employee TIN numbers'],
 NULL),

('Withholding Tax (WHT) Filing', 'Guide to file withholding tax returns for payments made', 'WHT', '25-35 minutes', 'intermediate',
 ARRAY['Gather all payment vouchers and receipts', 'Calculate total WHT deducted for the month', 'Login to LIRS taxpayer portal', 'Navigate to WHT Returns section', 'Enter payment details and WHT amounts', 'Submit return and make payment if required'],
 ARRAY['Payment vouchers', 'WHT certificates issued', 'Beneficiary TIN numbers', 'Bank payment records'],
 NULL)

ON CONFLICT DO NOTHING;