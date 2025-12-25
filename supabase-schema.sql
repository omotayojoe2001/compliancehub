-- Business profiles table
CREATE TABLE profiles (
  id uuid references auth.users(id) PRIMARY KEY,
  business_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  cac_date date,
  vat_status boolean DEFAULT false,
  paye_status boolean DEFAULT false,
  plan text DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'annual')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);