-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL, -- 'welcome', 'tax_reminder', 'subscription_reminder', etc.
  subject TEXT,
  message_body TEXT NOT NULL,
  send_via_email BOOLEAN DEFAULT false,
  send_via_whatsapp BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO message_templates (template_name, template_type, subject, message_body, send_via_email, send_via_whatsapp, is_active) VALUES
('Welcome Message', 'welcome', 'Welcome to TaxandCompliance T&C!', '🎉 Welcome to TaxandCompliance T&C!

Hi {{business_name}}, we''re excited to help you manage your tax compliance.

Get started now by logging into your dashboard!', true, true, true),

('VAT Reminder - 7 Days', 'tax_reminder', 'VAT Filing Due in 7 Days', '📋 VAT Filing Reminder

Hi {{business_name}},

Your VAT filing is due in 7 days on {{due_date}}.

Don''t forget to file on time to avoid penalties!', true, true, true),

('VAT Reminder - 3 Days', 'tax_reminder', 'VAT Filing Due in 3 Days - Urgent', '⚠️ Urgent: VAT Filing Due Soon

Hi {{business_name}},

Your VAT filing is due in just 3 days on {{due_date}}.

Please file as soon as possible!', true, true, true),

('PAYE Reminder - 7 Days', 'tax_reminder', 'PAYE Filing Due in 7 Days', '📋 PAYE Filing Reminder

Hi {{business_name}},

Your PAYE filing is due in 7 days on {{due_date}}.

Don''t forget to file on time!', true, true, true),

('Subscription Expiring', 'subscription_reminder', 'Your Subscription is Expiring Soon', '💳 Subscription Reminder

Hi {{business_name}},

Your subscription will expire on {{expiry_date}}.

Renew now to keep receiving reminders!', true, true, true);

-- Enable RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read templates
CREATE POLICY "Anyone can read templates"
ON message_templates
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify templates (you'll need to add admin check)
CREATE POLICY "Admins can manage templates"
ON message_templates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
