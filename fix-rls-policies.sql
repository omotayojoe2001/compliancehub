-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own obligations" ON tax_obligations;
DROP POLICY IF EXISTS "Users can view own reminders" ON reminder_logs;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

-- Enable RLS (in case it's not enabled)
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies
CREATE POLICY "Users can manage own obligations" ON tax_obligations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON reminder_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);