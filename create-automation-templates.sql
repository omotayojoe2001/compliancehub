-- Create automation_templates table
CREATE TABLE IF NOT EXISTS automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  send_via_email BOOLEAN DEFAULT false,
  send_via_whatsapp BOOLEAN DEFAULT false,
  trigger_event TEXT NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  days_before_due INTEGER,
  email_subject TEXT,
  email_body TEXT,
  whatsapp_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default automation templates
INSERT INTO automation_templates (automation_type, name, description, send_via_email, send_via_whatsapp, trigger_event, delay_minutes, email_subject, email_body, whatsapp_message, is_active) VALUES
('welcome', 'Welcome Message', 'Sent after user confirms email', true, true, 'email_confirmed', 0, 
'Welcome to TaxandCompliance T&C!', 
'Hi {{business_name}},

Welcome to TaxandCompliance T&C! We''re excited to help you manage your tax compliance.

Get started by:
1. Adding your tax obligations
2. Setting up reminders
3. Exploring our tax calculator

Login to your dashboard: https://www.taxandcompliance.com.ng/dashboard

Best regards,
TaxandCompliance T&C Team',
'🎉 Welcome to TaxandCompliance T&C!

Hi {{business_name}}, we''re excited to help you manage your tax compliance.

Get started now by logging into your dashboard!',
true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Anyone can read automation templates"
ON automation_templates
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage automation templates"
ON automation_templates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
