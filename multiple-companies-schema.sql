-- Support Multiple Business Profiles Per User
-- This allows one user to manage multiple companies

-- Add company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT,
  tin TEXT,
  cac_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for company_profiles
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company profiles" ON company_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company profiles" ON company_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profiles" ON company_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profiles" ON company_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add company_id to existing tables to link them to specific companies
ALTER TABLE tax_obligations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE reminder_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;
ALTER TABLE cashbook_entries ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_is_active ON company_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_obligations_company_id ON tax_obligations(company_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_company_id ON reminder_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_cashbook_entries_company_id ON cashbook_entries(company_id);

-- Function to ensure only one primary company per user
CREATE OR REPLACE FUNCTION ensure_single_primary_company()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    -- Set all other companies for this user to non-primary
    UPDATE company_profiles 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for primary company constraint
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_company ON company_profiles;
CREATE TRIGGER trigger_ensure_single_primary_company
  BEFORE INSERT OR UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_company();

-- Update existing user_profiles to reference primary company
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_company_id UUID REFERENCES company_profiles(id);

-- Migrate existing data: Create company profiles from user profiles
INSERT INTO company_profiles (user_id, company_name, business_type, tin, cac_number, address, phone, is_primary)
SELECT 
  id as user_id,
  COALESCE(business_name, 'My Business') as company_name,
  business_type,
  tin,
  cac_number,
  address,
  phone,
  true as is_primary
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM company_profiles WHERE is_primary = true)
ON CONFLICT DO NOTHING;

-- Update user_profiles with primary_company_id
UPDATE user_profiles 
SET primary_company_id = (
  SELECT id FROM company_profiles 
  WHERE company_profiles.user_id = user_profiles.id 
  AND is_primary = true 
  LIMIT 1
)
WHERE primary_company_id IS NULL;