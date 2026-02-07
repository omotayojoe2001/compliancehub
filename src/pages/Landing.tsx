import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { SimpleVATCalculator } from "@/components/SimpleVATCalculator";
import { contentService } from "@/lib/contentService";
import {
  Bell,
  Calculator,
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Shield,
  Clock,
  Building2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "Get WhatsApp and email alerts before every deadline. Never miss a CAC, VAT, or PAYE filing again.",
  },
  {
    icon: FileText,
    title: "Clear Guidance",
    description:
      "Simple, step-by-step instructions on what to file and how. We explain, you file on official government portals.",
  },
  {
    icon: Calculator,
    title: "Tax Calculator",
    description:
      "Estimate your self-assessment tax instantly using official Nigeria LIRS rates and formulas.",
  },
  {
    icon: Shield,
    title: "Stay Informed",
    description:
      "Get organised with deadlines and requirements. Reduce anxiety about compliance, but you handle the actual filing.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Register Your Business",
    description:
      "Enter your business details, CAC date, VAT and PAYE status. Takes less than 2 minutes.",
  },
  {
    step: "02",
    title: "Choose Your Plan",
    description:
      "Select Basic (₦15,000/year), Pro (₦50,000/year), or Enterprise (₦150,000/year) based on your needs.",
  },
  {
    step: "03",
    title: "Receive Reminders",
    description:
      "Get timely WhatsApp and email reminders before every deadline with clear action steps.",
  },
];

const pricing = [
  {
    name: "Basic",
    monthlyPrice: "₦1,250",
    annualPrice: "₦15,000",
    period: "/month",
    annualPeriod: "/year",
    description: "Perfect for single business owners",
    features: [
      "1 Business Profile",
      "WhatsApp Reminders",
      "Email Reminders",
      "Tax Calculator Access",
      "Filing Guides",
    ],
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: "₦4,167",
    annualPrice: "₦50,000",
    period: "/month",
    annualPeriod: "/year",
    description: "For agencies and multi-business owners",
    features: [
      "Up to 5 Business Profiles",
      "Priority WhatsApp Reminders",
      "Email Reminders",
      "Tax Calculator Access",
      "Filing Guides",
      "Digital Cashbook",
      "E-invoice",
      "Annual Summary Reports",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "₦12,500",
    annualPrice: "₦150,000",
    period: "/month",
    annualPeriod: "/year",
    description: "For large organizations",
    features: [
      "Unlimited Business Profiles",
      "Priority Support",
      "Custom Integrations",
      "Dedicated Account Manager",
      "Advanced Analytics",
      "API Access",
      "Digital Cashbook",
      "E-invoice",
      "Everything in Pro and Basic",
    ],
    popular: false,
  },
];

const targetAudience = [
  "SMEs & Startups",
  "Freelancers with CAC",
  "Traders & Exporters",
  "Digital Agencies",
  "E-commerce Sellers",
];

export default function Landing() {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    console.log('🏠 LANDING DEBUG - Starting fetchContent');
    try {
      const data = await contentService.getContent();
      console.log('🏠 LANDING DEBUG - Raw data received:', data);
      console.log('🏠 LANDING DEBUG - Enterprise price:', data?.pricing?.plans?.enterprise?.annualPrice);
      setContent(data);
    } catch (error) {
      console.error('🏠 LANDING DEBUG - Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use dynamic content or fallback to defaults
  const features = content?.features || [
    {
      title: "Automated Reminders",
      description: "Get WhatsApp and email alerts before every deadline. Never miss a CAC, VAT, or PAYE filing again.",
    },
    {
      title: "Clear Guidance",
      description: "Simple, step-by-step instructions on what to file and how. We explain, you file on official government portals.",
    },
    {
      title: "Tax Calculator",
      description: "Estimate your self-assessment tax instantly using official Nigeria LIRS rates and formulas.",
    },
    {
      title: "Stay Informed",
      description: "Get organised with deadlines and requirements. Reduce anxiety about compliance, but you handle the actual filing.",
    },
  ];

  const howItWorks = content?.howItWorks || [
    {
      step: "01",
      title: "Register Your Business",
      description: "Enter your business details, CAC date, VAT and PAYE status. Takes less than 2 minutes.",
    },
    {
      step: "02",
      title: "Choose Your Plan",
      description: "Select Basic (₦15,000/year), Pro (₦50,000/year), or Enterprise (₦150,000/year) based on your needs.",
    },
    {
      step: "03",
      title: "Receive Reminders",
      description: "Get timely WhatsApp and email reminders before every deadline with clear action steps.",
    },
  ];

  const pricing = (content?.pricing?.plans && 
                   content.pricing.plans.basic?.name &&
                   content.pricing.plans.pro?.name &&
                   content.pricing.plans.enterprise?.name &&
                   content.pricing.plans.basic?.annualPrice !== undefined &&
                   content.pricing.plans.pro?.annualPrice !== undefined &&
                   content.pricing.plans.enterprise?.annualPrice !== undefined) ? [
    {
      name: content.pricing.plans.basic.name,
      monthlyPrice: `₦${content.pricing.plans.basic.monthlyPrice.toLocaleString()}`,
      annualPrice: `₦${content.pricing.plans.basic.annualPrice.toLocaleString()}`,
      period: "/month",
      annualPeriod: "/year",
      description: "Perfect for single business owners",
      features: content.pricing.plans.basic.features,
      popular: false,
    },
    {
      name: content.pricing.plans.pro.name,
      monthlyPrice: `₦${content.pricing.plans.pro.monthlyPrice.toLocaleString()}`,
      annualPrice: `₦${content.pricing.plans.pro.annualPrice.toLocaleString()}`,
      period: "/month",
      annualPeriod: "/year",
      description: "For agencies and multi-business owners",
      features: content.pricing.plans.pro.features,
      popular: true,
    },
    {
      name: content.pricing.plans.enterprise.name,
      monthlyPrice: `₦${content.pricing.plans.enterprise.monthlyPrice.toLocaleString()}`,
      annualPrice: `₦${content.pricing.plans.enterprise.annualPrice.toLocaleString()}`,
      period: "/month",
      annualPeriod: "/year",
      description: "For large organizations",
      features: content.pricing.plans.enterprise.features,
      popular: false,
    },
  ] : [
    {
      name: "Basic",
      monthlyPrice: "₦1,250",
      annualPrice: "₦15,000",
      period: "/month",
      annualPeriod: "/year",
      description: "Perfect for single business owners",
      features: ["1 Business Profile", "WhatsApp Reminders", "Email Reminders", "Tax Calculator Access", "Filing Guides"],
      popular: false,
    },
    {
      name: "Pro",
      monthlyPrice: "₦4,167",
      annualPrice: "₦50,000",
      period: "/month",
      annualPeriod: "/year",
      description: "For agencies and multi-business owners",
      features: ["Up to 5 Business Profiles", "Priority WhatsApp Reminders", "Email Reminders", "Tax Calculator Access", "Filing Guides", "Digital Cashbook", "E-invoice", "Annual Summary Reports"],
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: "₦12,500",
      annualPrice: "₦150,000",
      period: "/month",
      annualPeriod: "/year",
      description: "For large organizations",
      features: ["Unlimited Business Profiles", "Priority Support", "Custom Integrations", "Dedicated Account Manager", "Advanced Analytics", "API Access", "Digital Cashbook", "E-invoice", "Everything in Pro and Basic"],
      popular: false,
    },
  ];

  const targetAudience = content?.targetAudience || [
    "SMEs & Startups",
    "Freelancers with CAC",
    "Traders & Exporters",
    "Digital Agencies",
    "E-commerce Sellers",
  ];

  const siteInfo = content?.siteInfo || {
    companyName: "TaxandCompliance T&C",
    tagline: "Your Tax Compliance Partner",
    description: "Simplifying tax compliance for Nigerian businesses",
    phone: "+234 800 000 0000",
    email: "hello@taxandcompliance.ng",
    address: "Lagos, Nigeria"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {siteInfo.companyName}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#calculator"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Calculator
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-secondary py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl">
              {siteInfo.tagline || "Taxes Can Be Confusing... Deadlines Even More So"}
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              {siteInfo.description || "We help you stay on top of them with clear reminders, simple explanations, and easy-to-understand estimates, so nothing catches you by surprise."}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/register')}>
                Try It Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href="#calculator">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Tax Calculator
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              We help you stay organised and informed. Filings and payments are done directly on official government portals.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="border-b border-border py-8">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {targetAudience.map((audience) => (
              <span
                key={audience}
                className="border border-border bg-card px-4 py-2 text-sm text-foreground"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Everything You Need to Stay Organised
            </h2>
            <p className="text-sm text-muted-foreground">
              We don't file for you... but we make sure you never forget, never guess, and never walk in blind.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="border border-border bg-card p-6"
              >
                {[Bell, FileText, Calculator, Shield][index] && 
                  React.createElement([Bell, FileText, Calculator, Shield][index], { className: "mb-4 h-8 w-8 text-primary" })
                }
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-border bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              How It Works
            </h2>
            <p className="text-sm text-muted-foreground">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-primary bg-primary/10 text-lg font-semibold text-primary">
                  {item.step}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-muted-foreground">
              Affordable compliance assistance. Less than what you pay an accountant.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This service provides reminders and guidance only. You are responsible for actual tax filings and payments through official government portals. We are not liable for penalties resulting from missed deadlines or incorrect filings.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative border bg-card p-6 ${
                  plan.popular
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-4 bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.annualPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.annualPeriod}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed annually
                  </p>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section id="calculator" className="border-b border-border bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Free Tax Calculator
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Get quick tax estimates for planning purposes. Our calculator uses official LIRS rates but results are estimates only. Always verify with a qualified tax professional or official FIRS resources for actual filing.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Accurate CRA calculation
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Progressive tax bands applied
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Instant results
                </li>
              </ul>
              <Button onClick={() => navigate('/login')}>
                Open Full Calculator
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <SimpleVATCalculator />
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Reminders Where You Are
            </h2>
            <p className="text-sm text-muted-foreground">
              Get notified via WhatsApp and Email
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 border border-border bg-card p-6">
              <MessageSquare className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  WhatsApp Alerts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Instant notifications on your phone. Get general guidance and reminders. For specific tax advice, consult a qualified professional.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 border border-border bg-card p-6">
              <Mail className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  Email Reminders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detailed emails with step-by-step guides and links to filing
                  portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border bg-primary py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-primary-foreground">
            Stop Worrying About Deadlines
          </h2>
          <p className="mb-8 text-sm text-primary-foreground/80">
            Join hundreds of Nigerian businesses staying compliant effortlessly.
          </p>
          <Link to="/register">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-5">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {siteInfo.companyName}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {content?.footer?.aboutText || "Automated compliance reminders for Nigerian businesses."}
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    to="/tax-calculator"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Tax Calculator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    CAC Filing Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    VAT Filing Steps
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    PAYE Deadlines
                  </a>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Terms and Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                Official Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.nrs.gov.ng/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    NRS - Nigeria Revenue Service
                  </a>
                </li>
                <li>
                  <a
                    href="https://cac.gov.ng/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    CAC - Corporate Affairs Commission
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                Contact
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">
                  {siteInfo.email}
                </li>
                <li className="text-sm text-muted-foreground">
                  {siteInfo.address}
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteInfo.companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
