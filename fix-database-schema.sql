-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users(id) PRIMARY KEY,
  business_name text,
  phone text,
  email text,
  plan text DEFAULT 'basic',
  subscription_status text DEFAULT 'inactive',
  created_at timestamp with time zone DEFAULT now()
);

-- Create tax_obligations table
CREATE TABLE IF NOT EXISTS tax_obligations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id),
  obligation_type text,
  next_due_date timestamp with time zone,
  tax_period text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create reminder_logs table
CREATE TABLE IF NOT EXISTS reminder_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id),
  obligation_id uuid references tax_obligations(id),
  reminder_type text,
  scheduled_date timestamp with time zone,
  sent_date timestamp with time zone,
  status text,
  message_content text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now)
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all" ON tax_obligations FOR ALL USING (true);
CREATE POLICY "Allow all" ON reminder_logs FOR ALL USING (true);