import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SimpleVATCalculator } from "@/components/SimpleVATCalculator";
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
    title: "Step-by-Step Guides",
    description:
      "Simple, clear instructions on what to file and how. No more confusion about compliance requirements.",
  },
  {
    icon: Calculator,
    title: "Tax Calculator",
    description:
      "Estimate your self-assessment tax instantly using official Nigeria NRS rates and formulas.",
  },
  {
    icon: Shield,
    title: "Avoid Penalties",
    description:
      "Stay ahead of deadlines and avoid costly fines. Peace of mind for your business.",
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
      "Select Basic or Pro based on your needs. Affordable pricing starting at ₦3,000/month.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              ComplianceHub
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
              Never Miss a Tax Deadline Again
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              WhatsApp + Email compliance reminders for Nigerian businesses.
              Get alerts before CAC, VAT, and PAYE deadlines with step-by-step
              filing guides.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/register')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href="#calculator">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Tax Calculator
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Starting at ₦15,000/year. Cancel anytime.
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
              Everything You Need to Stay Compliant
            </h2>
            <p className="text-sm text-muted-foreground">
              Cheap insurance against costly penalties
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-border bg-card p-6"
              >
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
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
              Less than what you pay an accountant. More peace of mind.
            </p>
            
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
                Estimate your Nigeria self-assessment tax instantly. Our
                calculator uses official NRS rates including Consolidated
                Relief Allowance (CRA) and progressive tax bands.
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
              <Link to="/tax-calculator">
                <Button>
                  Open Full Calculator
                  <Calculator className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
                  Instant notifications on your phone. Reply to get help or ask
                  questions.
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
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  ComplianceHub
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automated compliance reminders for Nigerian businesses.
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
                Contact
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">
                  hello@compliancehub.ng
                </li>
                <li className="text-sm text-muted-foreground">
                  Lagos, Nigeria
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} ComplianceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
