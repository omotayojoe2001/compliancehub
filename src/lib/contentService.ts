import { supabase } from './supabase';

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
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 1)
        .single();

      if (error || !data) {
        console.log('No content found, using defaults');
        return defaultContent;
      }

      return data.content as SiteContent;
    } catch (error) {
      console.error('Error fetching content:', error);
      return defaultContent;
    }
  },

  async updateContent(content: SiteContent): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          id: 1,
          content: content,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating content:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      return false;
    }
  }
};