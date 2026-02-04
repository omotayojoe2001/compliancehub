import { supabaseService } from './supabaseService';

interface SiteContent {
  siteInfo: {
    companyName: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  pricing: {
    plans: {
      free: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      basic: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      pro: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
      enterprise: { name: string; monthlyPrice: number; annualPrice: number; features: string[]; };
    };
    filingCharges: {
      vat: number;
      paye: number;
      cit: number;
      wht: number;
      filing_service: number;
    };
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  howItWorks: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  targetAudience: string[];
  footer: {
    aboutText: string;
    quickLinks: string[];
    socialLinks: {
      facebook: string;
      twitter: string;
      linkedin: string;
    };
  };
}

const defaultContent: SiteContent = {
  siteInfo: {
    companyName: 'TaxandCompliance T&C',
    tagline: 'Your Tax Compliance Partner',
    description: 'Simplifying tax compliance for Nigerian businesses',
    phone: '+234 800 000 0000',
    email: 'hello@taxandcompliance.ng',
    address: 'Lagos, Nigeria'
  },
  pricing: {
    plans: {
      free: {
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
        features: ['View compliance guides', 'Basic tax information', 'No reminders']
      },
      basic: {
        name: 'Basic',
        monthlyPrice: 1250,
        annualPrice: 15000,
        features: ['1 Business Profile', 'Email Reminders', 'Tax Calculator Access', 'Filing Guides', 'Up to 3 tax obligations']
      },
      pro: {
        name: 'Pro',
        monthlyPrice: 4167,
        annualPrice: 50000,
        features: ['Up to 5 Business Profiles', 'WhatsApp Reminders', 'Email Reminders', 'Advanced Tax Calculator', 'Filing Guides', 'Unlimited tax obligations', 'Priority Support']
      },
      enterprise: {
        name: 'Enterprise',
        monthlyPrice: 12500,
        annualPrice: 150000,
        features: ['Unlimited Business Profiles', 'WhatsApp Reminders', 'Email Reminders', 'Advanced Tax Calculator', 'API Access', 'Multi-user Access', 'Dedicated Account Manager', 'Custom Integrations']
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
  features: [
    {
      title: 'Automated Reminders',
      description: 'Get WhatsApp and email alerts before every deadline. Never miss a CAC, VAT, or PAYE filing again.'
    },
    {
      title: 'Clear Guidance',
      description: 'Simple, step-by-step instructions on what to file and how. We explain, you file on official government portals.'
    },
    {
      title: 'Tax Calculator',
      description: 'Estimate your self-assessment tax instantly using official Nigeria LIRS rates and formulas.'
    },
    {
      title: 'Stay Informed',
      description: 'Get organised with deadlines and requirements. Reduce anxiety about compliance, but you handle the actual filing.'
    }
  ],
  howItWorks: [
    {
      step: '01',
      title: 'Register Your Business',
      description: 'Enter your business details, CAC date, VAT and PAYE status. Takes less than 2 minutes.'
    },
    {
      step: '02',
      title: 'Choose Your Plan',
      description: 'Select Basic (₦15,000/year), Pro (₦50,000/year), or Enterprise (₦150,000/year) based on your needs.'
    },
    {
      step: '03',
      title: 'Receive Reminders',
      description: 'Get timely WhatsApp and email reminders before every deadline with clear action steps.'
    }
  ],
  targetAudience: [
    'SMEs & Startups',
    'Freelancers with CAC',
    'Traders & Exporters',
    'Digital Agencies',
    'E-commerce Sellers'
  ],
  footer: {
    aboutText: 'Automated compliance reminders for Nigerian businesses.',
    quickLinks: ['Dashboard', 'Tax Calculator', 'Guides', 'Support'],
    socialLinks: {
      facebook: 'https://facebook.com/compliancehub',
      twitter: 'https://twitter.com/compliancehub',
      linkedin: 'https://linkedin.com/company/compliancehub'
    }
  }
};

export const contentService = {
  async getContent(): Promise<SiteContent> {
    console.log('💾 CONTENT SERVICE DEBUG - Starting getContent');
    try {
      const url = `${supabaseService.supabaseUrl}/rest/v1/site_content?id=eq.1&select=content`;
      console.log('💾 CONTENT SERVICE DEBUG - Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('💾 CONTENT SERVICE DEBUG - Response status:', response.status);
      
      if (!response.ok) {
        console.log('💾 CONTENT SERVICE DEBUG - Response not OK, using defaults');
        return defaultContent;
      }

      const data = await response.json();
      console.log('💾 CONTENT SERVICE DEBUG - Response data:', data);
      
      if (!data || data.length === 0) {
        console.log('💾 CONTENT SERVICE DEBUG - No data found, using defaults');
        return defaultContent;
      }

      console.log('💾 CONTENT SERVICE DEBUG - Returning content:', data[0].content);
      // JSONB returns proper object, no parsing needed
      return data[0].content as SiteContent;
    } catch (error) {
      console.error('💾 CONTENT SERVICE DEBUG - Error fetching content:', error);
      return defaultContent;
    }
  },

  async updateContent(content: SiteContent): Promise<boolean> {
    console.log('💾 CONTENT SERVICE DEBUG - Starting updateContent with:', content);
    try {
      const url = `${supabaseService.supabaseUrl}/rest/v1/site_content`;
      console.log('💾 CONTENT SERVICE DEBUG - Updating at URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: 1,
          content: content, // Don't double-stringify - JSONB handles this
          updated_at: new Date().toISOString()
        })
      });

      console.log('💾 CONTENT SERVICE DEBUG - Update response status:', response.status);
      
      if (!response.ok) {
        console.error('💾 CONTENT SERVICE DEBUG - Error updating content:', response.statusText);
        return false;
      }

      console.log('💾 CONTENT SERVICE DEBUG - Update successful');
      return true;
    } catch (error) {
      console.error('💾 CONTENT SERVICE DEBUG - Error updating content:', error);
      return false;
    }
  }
};