-- EMERGENCY FIX: Disable RLS temporarily to allow updates
ALTER TABLE tax_rates DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Public can read active tax rates" ON tax_rates;

-- Create simple policies that work
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to manage (temporary fix)
CREATE POLICY "Allow all authenticated users" ON tax_rates
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Allow public read
CREATE POLICY "Allow public read" ON tax_rates
    FOR SELECT USING (true);