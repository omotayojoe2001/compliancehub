-- Create site_content table for managing website content
CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage content (for admin)
CREATE POLICY "Authenticated users can manage site content" ON site_content
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default content
INSERT INTO site_content (id, content) VALUES (1, '{
  "siteInfo": {
    "companyName": "TaxandCompliance T&C",
    "tagline": "Your Tax Compliance Partner",
    "description": "Simplifying tax compliance for Nigerian businesses",
    "phone": "+234 800 000 0000",
    "email": "hello@taxandcompliance.ng",
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
      "wht": 2000,
      "filing_service": 10000
    }
  },
  "features": [
    {
      "title": "Automated Reminders",
      "description": "Get WhatsApp and email alerts before every deadline. Never miss a CAC, VAT, or PAYE filing again."
    },
    {
      "title": "Clear Guidance",
      "description": "Simple, step-by-step instructions on what to file and how. We explain, you file on official government portals."
    },
    {
      "title": "Tax Calculator",
      "description": "Estimate your self-assessment tax instantly using official Nigeria LIRS rates and formulas."
    },
    {
      "title": "Stay Informed",
      "description": "Get organised with deadlines and requirements. Reduce anxiety about compliance, but you handle the actual filing."
    }
  ],
  "howItWorks": [
    {
      "step": "01",
      "title": "Register Your Business",
      "description": "Enter your business details, CAC date, VAT and PAYE status. Takes less than 2 minutes."
    },
    {
      "step": "02",
      "title": "Choose Your Plan",
      "description": "Select Basic (₦15,000/year), Pro (₦50,000/year), or Enterprise (₦150,000/year) based on your needs."
    },
    {
      "step": "03",
      "title": "Receive Reminders",
      "description": "Get timely WhatsApp and email reminders before every deadline with clear action steps."
    }
  ],
  "targetAudience": [
    "SMEs & Startups",
    "Freelancers with CAC",
    "Traders & Exporters",
    "Digital Agencies",
    "E-commerce Sellers"
  ],
  "footer": {
    "aboutText": "Automated compliance reminders for Nigerian businesses.",
    "quickLinks": ["Dashboard", "Tax Calculator", "Guides", "Support"],
    "socialLinks": {
      "facebook": "https://facebook.com/compliancehub",
      "twitter": "https://twitter.com/compliancehub",
      "linkedin": "https://linkedin.com/company/compliancehub"
    }
  }
}') ON CONFLICT (id) DO NOTHING;