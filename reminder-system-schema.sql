-- Tax obligations and deadlines
CREATE TABLE tax_obligations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  obligation_type text NOT NULL, -- 'VAT', 'PAYE', 'CAC', 'WHT', 'CIT'
  frequency text NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  next_due_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Reminder logs
CREATE TABLE reminder_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  obligation_id uuid references tax_obligations(id) ON DELETE CASCADE,
  reminder_type text NOT NULL, -- 'email', 'whatsapp'
  scheduled_date timestamp with time zone NOT NULL,
  sent_date timestamp with time zone,
  status text DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  message_content text,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL, -- 'basic', 'pro', 'annual'
  status text DEFAULT 'active', -- 'active', 'inactive', 'cancelled'
  paystack_customer_code text,
  paystack_subscription_code text,
  amount integer NOT NULL, -- in kobo
  next_payment_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own obligations" ON tax_obligations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON reminder_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);