import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { paymentService } from "@/lib/paymentService";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";
import { supabaseService } from "@/lib/supabaseService";

export default function Subscription() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  // Get plan display name
  const getPlanDisplayName = (planKey: string) => {
    const planNames = {
      test200: 'Test ₦200',
      basic: 'Basic',
      pro: 'Professional', 
      enterprise: 'Enterprise'
    };
    return planNames[planKey as keyof typeof planNames] || planKey;
  };

  // Get actual subscription data instead of profile data
  const [actualSubscription, setActualSubscription] = useState<any>(null);
  
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionData();
    }
  }, [user?.id]);
  
  const loadSubscriptionData = async () => {
    if (!user?.id) return;
    
    try {
      const subscription = await supabaseService.getSubscription(user.id);
      setActualSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

const plans = [
  {
    name: "Test ₦200",
    annualPrice: "₦2,400",
    monthlyPrice: "₦200",
    period: "/year",
    monthlyPeriod: "/month",
    features: [
      "Testing the system",
      "2 obligations tracked",
      "Email reminders only",
    ],
    current: actualSubscription?.plan_type === 'test200',
    planKey: 'test200' as const,
  },
  {
    name: "Basic",
    annualPrice: "₦15,000",
    monthlyPrice: "₦1,250",
    period: "/year",
    monthlyPeriod: "/month",
    features: [
      "1 Business Profile",
      "WhatsApp Reminders",
      "Email Reminders",
      "Tax Calculator Access",
      "Filing Guides",
    ],
    current: actualSubscription?.plan_type === 'basic',
    planKey: 'basic' as const,
  },
  {
    name: "Pro",
    annualPrice: "₦50,000",
    monthlyPrice: "₦4,167",
    period: "/year",
    monthlyPeriod: "/month",
    features: [
      "Up to 5 Business Profiles",
      "Priority WhatsApp Reminders",
      "Email Reminders",
      "Tax Calculator Access",
      "Filing Guides",
      "Annual Summary Reports",
    ],
    current: actualSubscription?.plan_type === 'pro',
    planKey: 'pro' as const,
  },
  {
    name: "Enterprise",
    annualPrice: "₦150,000",
    monthlyPrice: "₦12,500",
    period: "/year",
    monthlyPeriod: "/month",
    features: [
      "Unlimited Business Profiles",
      "Priority Support",
      "Custom Integrations",
      "Dedicated Account Manager",
      "Advanced Analytics",
      "API Access",
    ],
    current: actualSubscription?.plan_type === 'enterprise',
    planKey: 'enterprise' as const,
  },
];

  const handleUpgrade = async (planType: 'test200' | 'basic' | 'pro' | 'enterprise') => {
    if (!user || !profile) return;
    
    setLoading(planType);
    
    try {
      const amount = paymentService.getPlanPrice(planType);
      
      await paymentService.initializePayment({
        email: user.email || '',
        amount,
        plan: planType,
        businessName: profile.business_name
      });
      
      // Payment successful - refresh profile and page
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(null);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <HelpWrapper
          helpTitle="Why do I need to pay?"
          helpContent="This app costs money to run - we need to send WhatsApp messages, emails, and keep the system running 24/7. If you don't pay, the reminders stop working. It's like paying for electricity - no payment, no power."
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">Your Subscription</h1>
            <p className="text-sm text-muted-foreground">
              Keep your reminders working by staying subscribed
            </p>
          </div>
        </HelpWrapper>

        {/* Current Status */}
        <HelpWrapper
          helpTitle="Your Current Status"
          helpContent="This shows: 1) What plan you're on, 2) If it's working (Active) or stopped (Inactive), 3) When you need to pay again. If it says 'Inactive', your reminders have stopped!"
        >
          <div className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your Plan
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {actualSubscription?.plan_type ? getPlanDisplayName(actualSubscription.plan_type) : 'No Plan'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Are Reminders Working?
                </p>
                <p className={`text-sm font-medium ${
                  actualSubscription?.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {actualSubscription?.status === 'active' ? '✓ Yes, Active' : '❌ No, Inactive'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next Payment Due
                </p>
                <p className="text-sm font-medium text-foreground">
                  {actualSubscription?.status === 'active' ? 'Next year' : 'No payment scheduled'}
                </p>
              </div>
            </div>
          </div>
        </HelpWrapper>

        {/* Plans Grid */}
        <HelpWrapper
          helpTitle="Choose Your Plan"
          helpContent="Different plans give you different features. The more you pay, the more reminders and features you get. If you stop paying, ALL reminders stop - the system won't work for free."
        >
          {/* Billing Toggle */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save up to 25%
              </span>
            )}
          </div>
          
          <div className="grid gap-4 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "border bg-card p-6",
                  plan.current ? "border-green-500 bg-green-50" : "border-border"
                )}
              >
                {plan.current && (
                  <div className="mb-4 inline-block border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    ✓ This is your plan
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-semibold text-foreground">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isAnnual ? plan.period : plan.monthlyPeriod}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed annually
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      This is your current plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.name === "Annual" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleUpgrade(plan.planKey)}
                      disabled={loading === plan.planKey}
                    >
                      {loading === plan.planKey ? 'Processing...' : 
                       `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </HelpWrapper>
        
        {/* Important Warning */}
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Important:</strong> If you stop paying, the reminders stop working immediately. 
            The system will NOT send you WhatsApp messages or emails about your tax deadlines. 
            You'll be on your own to remember everything!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
