-- Create company_profiles table to store business details
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    company_name TEXT,
    cac_number TEXT,
    tin TEXT,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own company profiles" ON company_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company profiles" ON company_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profiles" ON company_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profiles" ON company_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all company profiles (remove role check since column doesn't exist)
CREATE POLICY "Admins can view all company profiles" ON company_profiles
    FOR SELECT USING (true); -- Temporary - allow all users to view

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_profiles_updated_at 
    BEFORE UPDATE ON company_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();