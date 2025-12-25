-- Fresh database schema for ComplianceHub

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_name TEXT,
  phone TEXT,
  email TEXT,
  plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax obligations table
CREATE TABLE user_tax_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tax_type TEXT NOT NULL,
  tax_period TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder logs table
CREATE TABLE user_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  obligation_id UUID REFERENCES user_tax_obligations(id),
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method TEXT NOT NULL -- 'email' or 'whatsapp'
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own obligations" ON user_tax_obligations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own obligations" ON user_tax_obligations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own obligations" ON user_tax_obligations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminder logs" ON user_reminder_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminder logs" ON user_reminder_logs FOR INSERT WITH CHECK (auth.uid() = user_id);