const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDM2NzI5NCwiZXhwIjoyMDQ5OTQzMjk0fQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createContentTable() {
  try {
    const defaultContent = {
      siteInfo: {
        companyName: "ComplianceHub",
        tagline: "Your Tax Compliance Partner", 
        description: "Simplifying tax compliance for Nigerian businesses",
        phone: "+234 800 000 0000",
        email: "info@compliancehub.ng",
        address: "Lagos, Nigeria"
      },
      pricing: {
        plans: {
          free: {
            name: "Free",
            monthlyPrice: 0,
            annualPrice: 0,
            features: ["View compliance guides", "Basic tax information", "No reminders"]
          },
          basic: {
            name: "Basic", 
            monthlyPrice: 1250,
            annualPrice: 15000,
            features: ["1 Business Profile", "Email Reminders", "Tax Calculator Access", "Filing Guides", "Up to 3 tax obligations"]
          },
          pro: {
            name: "Pro",
            monthlyPrice: 4167,
            annualPrice: 50000,
            features: ["Up to 5 Business Profiles", "WhatsApp Reminders", "Email Reminders", "Advanced Tax Calculator", "Filing Guides", "Unlimited tax obligations", "Priority Support"]
          },
          enterprise: {
            name: "Enterprise",
            monthlyPrice: 12500,
            annualPrice: 150000,
            features: ["Unlimited Business Profiles", "WhatsApp Reminders", "Email Reminders", "Advanced Tax Calculator", "API Access", "Multi-user Access", "Dedicated Account Manager", "Custom Integrations"]
          }
        },
        filingCharges: {
          vat: 2500,
          paye: 3000,
          cit: 5000,
          wht: 2000,
          filing_service: 10000
        }
      },
      footer: {
        aboutText: "ComplianceHub helps Nigerian businesses stay compliant with tax regulations through automated reminders, expert guidance, and seamless filing services.",
        quickLinks: ["Dashboard", "Tax Calculator", "Guides", "Support"],
        socialLinks: {
          facebook: "https://facebook.com/compliancehub",
          twitter: "https://twitter.com/compliancehub", 
          linkedin: "https://linkedin.com/company/compliancehub"
        }
      }
    };

    const { error: insertError } = await supabase
      .from('site_content')
      .upsert({
        id: 1,
        content: defaultContent
      });

    if (insertError) {
      console.error('Error inserting content:', insertError);
    } else {
      console.log('Content table populated successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createContentTable();