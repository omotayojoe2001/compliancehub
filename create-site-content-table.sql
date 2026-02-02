-- Create site_content table for content management
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content
INSERT INTO site_content (id, content) VALUES (
  1,
  '{
    "siteInfo": {
      "companyName": "ComplianceHub",
      "tagline": "Your Tax Compliance Partner",
      "description": "Simplifying tax compliance for Nigerian businesses",
      "phone": "+234 800 000 0000",
      "email": "info@compliancehub.ng",
      "address": "Lagos, Nigeria"
    },
    "pricing": {
      "plans": {
        "free": {
          "name": "Free",
          "monthlyPrice": 0,
          "annualPrice": 0,
          "features": ["View compliance guides", "Basic tax information", "No reminders"]
        },
        "basic": {
          "name": "Basic",
          "monthlyPrice": 1250,
          "annualPrice": 15000,
          "features": ["1 Business Profile", "Email Reminders", "Tax Calculator Access", "Filing Guides", "Up to 3 tax obligations"]
        },
        "pro": {
          "name": "Pro",
          "monthlyPrice": 4167,
          "annualPrice": 50000,
          "features": ["Up to 5 Business Profiles", "WhatsApp Reminders", "Email Reminders", "Advanced Tax Calculator", "Filing Guides", "Unlimited tax obligations", "Priority Support"]
        },
        "enterprise": {
          "name": "Enterprise",
          "monthlyPrice": 12500,
          "annualPrice": 150000,
          "features": ["Unlimited Business Profiles", "WhatsApp Reminders", "Email Reminders", "Advanced Tax Calculator", "API Access", "Multi-user Access", "Dedicated Account Manager", "Custom Integrations"]
        }
      },
      "filingCharges": {
        "vat": 2500,
        "paye": 3000,
        "cit": 5000,
        "wht": 2000
      }
    },
    "footer": {
      "aboutText": "ComplianceHub helps Nigerian businesses stay compliant with tax regulations through automated reminders, expert guidance, and seamless filing services.",
      "quickLinks": ["Dashboard", "Tax Calculator", "Guides", "Support"],
      "socialLinks": {
        "facebook": "https://facebook.com/compliancehub",
        "twitter": "https://twitter.com/compliancehub",
        "linkedin": "https://linkedin.com/company/compliancehub"
      }
    }
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_content' AND policyname = 'Admin can manage site content') THEN
    CREATE POLICY "Admin can manage site content" ON site_content FOR ALL USING (true);
  END IF;
END $$;