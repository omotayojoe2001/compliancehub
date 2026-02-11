-- Create automation_templates table for admin-managed automations
CREATE TABLE IF NOT EXISTS automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type TEXT NOT NULL, -- 'welcome', 'followup', 'educational', 'tax_reminder', 'login_notification', 'invoice_notification', 'payment_reminder'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Channels
  send_via_email BOOLEAN DEFAULT true,
  send_via_whatsapp BOOLEAN DEFAULT false,
  
  -- Timing
  trigger_event TEXT NOT NULL, -- 'signup', 'login', 'invoice_created', 'payment_due', 'tax_due'
  delay_minutes INTEGER DEFAULT 0, -- Delay after trigger event (0 = immediate)
  days_before_due INTEGER, -- For reminders (null for non-reminder types)
  
  -- Content
  email_subject TEXT,
  email_body TEXT,
  whatsapp_message TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(automation_type, days_before_due)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_automation_templates_type ON automation_templates(automation_type);
CREATE INDEX IF NOT EXISTS idx_automation_templates_active ON automation_templates(is_active);

-- Insert default automation templates
INSERT INTO automation_templates (automation_type, name, description, send_via_email, send_via_whatsapp, trigger_event, delay_minutes, days_before_due, email_subject, email_body, whatsapp_message, is_active) VALUES

-- Signup sequence
('welcome', 'Welcome Email', 'Sent immediately after user signs up', true, true, 'signup', 0, null,
 'Welcome to TaxandCompliance T&C!', 
 'Hi {{business_name}},\n\nWelcome to TaxandCompliance T&C! We''re excited to help you stay on top of your tax obligations.\n\nGet started by setting up your profile and adding your tax obligations.\n\nBest regards,\nTaxandCompliance T&C Team',
 '🎉 Welcome to TaxandCompliance T&C!\n\nHi {{business_name}}, we''re excited to help you manage your tax compliance.\n\nGet started now!',
 true),

('followup', 'Profile Completion Follow-up', 'Sent if profile is incomplete after signup', true, true, 'signup', 30, null,
 'Complete Your Profile - TaxandCompliance T&C',
 'Hi {{business_name}},\n\nWe noticed you haven''t completed your profile yet. Complete it now to unlock all features:\n\n- Add tax obligations\n- Set up reminders\n- Track deadlines\n\nComplete your profile now!\n\nBest regards,\nTaxandCompliance T&C Team',
 '📋 Complete your profile to unlock all features!\n\nHi {{business_name}}, finish setting up your account to get started with tax reminders.',
 true),

('educational', 'Educational Email', 'Educational content sent after signup', true, false, 'signup', 120, null,
 'Nigerian Tax Compliance Guide',
 'Hi {{business_name}},\n\nHere''s a quick guide to Nigerian tax compliance:\n\n1. VAT - Due 21st of following month\n2. PAYE - Due 10th of following month\n3. WHT - Due 21st of following month\n4. CAC Annual Returns - Due 42 days after anniversary\n\nStay compliant with TaxandCompliance T&C!\n\nBest regards,\nTaxandCompliance T&C Team',
 null,
 true),

-- Tax reminders (VAT)
('tax_reminder', 'VAT Reminder - 7 Days', 'VAT reminder sent 7 days before due date', true, true, 'tax_due', 0, 7,
 'VAT Filing Due in 7 Days',
 'Hi {{business_name}},\n\nReminder: Your VAT filing for {{tax_period}} is due in 7 days ({{due_date}}).\n\nPlease file before the deadline to avoid penalties.\n\nBest regards,\nTaxandCompliance T&C Team',
 '🔔 VAT Reminder\n\nHi {{business_name}}, your VAT filing is due in 7 days ({{due_date}}).\n\nDon''t forget to file on time!',
 true),

('tax_reminder', 'VAT Reminder - 3 Days', 'VAT reminder sent 3 days before due date', true, true, 'tax_due', 0, 3,
 'Important: VAT Filing Due in 3 Days',
 'Hi {{business_name}},\n\nImportant: Your VAT filing for {{tax_period}} is due in 3 days ({{due_date}}).\n\nPlease file immediately to avoid penalties.\n\nBest regards,\nTaxandCompliance T&C Team',
 '⚠️ Important: VAT Due in 3 Days\n\nHi {{business_name}}, your VAT filing is due on {{due_date}}.\n\nFile now to avoid penalties!',
 true),

('tax_reminder', 'VAT Reminder - 1 Day', 'VAT reminder sent 1 day before due date', true, true, 'tax_due', 0, 1,
 'URGENT: VAT Filing Due Tomorrow',
 'Hi {{business_name}},\n\nURGENT: Your VAT filing for {{tax_period}} is due tomorrow ({{due_date}}).\n\nFile immediately to avoid penalties!\n\nBest regards,\nTaxandCompliance T&C Team',
 '🚨 URGENT: VAT Due Tomorrow!\n\nHi {{business_name}}, your VAT filing is due on {{due_date}}.\n\nFile NOW to avoid penalties!',
 true),

-- Login notification
('login_notification', 'Login Notification', 'Sent when user logs in', false, true, 'login', 0, null,
 null,
 null,
 '🔐 Login Alert\n\nHi {{business_name}}, you just logged into your TaxandCompliance T&C account.\n\nIf this wasn''t you, please secure your account immediately.',
 true),

-- Invoice notification
('invoice_notification', 'Invoice Created', 'Sent when invoice is created', false, true, 'invoice_created', 0, null,
 null,
 null,
 '📄 Invoice {{invoice_number}}\n\nDear {{client_name}},\n\nAmount: ₦{{amount}}\nDue Date: {{due_date}}\n\nPlease process payment at your earliest convenience.\n\nThank you!',
 true),

-- Payment reminder
('payment_reminder', 'Payment Reminder - 3 Days', 'Payment reminder sent 3 days before due', true, true, 'payment_due', 0, 3,
 'Payment Reminder - Invoice {{invoice_number}}',
 'Dear {{client_name}},\n\nThis is a reminder that payment for Invoice {{invoice_number}} (₦{{amount}}) is due in 3 days ({{due_date}}).\n\nPlease process payment to avoid late fees.\n\nThank you,\n{{business_name}}',
 '💰 Payment Reminder\n\nDear {{client_name}}, payment for Invoice {{invoice_number}} (₦{{amount}}) is due in 3 days ({{due_date}}).\n\nPlease pay on time.',
 true),

('payment_reminder', 'Payment Reminder - 1 Day', 'Payment reminder sent 1 day before due', true, true, 'payment_due', 0, 1,
 'URGENT: Payment Due Tomorrow - Invoice {{invoice_number}}',
 'Dear {{client_name}},\n\nURGENT: Payment for Invoice {{invoice_number}} (₦{{amount}}) is due tomorrow ({{due_date}}).\n\nPlease process payment immediately to avoid late fees.\n\nThank you,\n{{business_name}}',
 '🚨 Payment Due Tomorrow!\n\nDear {{client_name}}, Invoice {{invoice_number}} (₦{{amount}}) is due on {{due_date}}.\n\nPay now to avoid late fees.',
 true);

-- Enable RLS
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to manage (restrict to admin later)
CREATE POLICY "Authenticated users can manage automation templates"
ON automation_templates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
