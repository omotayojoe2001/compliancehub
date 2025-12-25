import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { paymentService } from "@/lib/paymentService";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";

export default function Subscription() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);

  // Get plan display name
  const getPlanDisplayName = (planKey: string) => {
    const planNames = {
      test100: 'Test ₦100 (plan little)',
      test200: 'Upgrade to more (₦200)',
      basic: 'Basic',
      pro: 'Professional',
      annual: 'Annual'
    };
    return planNames[planKey as keyof typeof planNames] || planKey;
  };

const plans = [
  {
    name: "Test ₦100",
    price: "₦100",
    period: "/month",
    features: [
      "Testing the system",
      "1 obligation tracked",
      "Email reminders only",
    ],
    current: profile?.plan === 'test100',
    planKey: 'test100' as const,
  },
  {
    name: "Test ₦200",
    price: "₦200",
    period: "/month",
    features: [
      "More testing features",
      "2 obligations tracked",
      "Email reminders only",
    ],
    current: profile?.plan === 'test200',
    planKey: 'test200' as const,
  },
  {
    name: "Basic",
    price: "₦3,000",
    period: "/month",
    features: [
      "Up to 3 obligations tracked",
      "Email reminders only",
      "Basic tax calculator",
      "Email support",
    ],
    current: profile?.plan === 'basic',
    planKey: 'basic' as const,
  },
  {
    name: "Pro",
    price: "₦7,000",
    period: "/month",
    features: [
      "Unlimited obligations tracked",
      "Email & WhatsApp reminders",
      "Advanced tax calculator",
      "Reminder logs & history",
      "Priority support",
    ],
    current: profile?.plan === 'pro',
    planKey: 'pro' as const,
  },
  {
    name: "Annual",
    price: "₦30,000",
    period: "/year",
    features: [
      "Everything in Pro",
      "Multi-user access",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
    ],
    current: profile?.plan === 'annual',
    planKey: 'annual' as const,
  },
];

  const handleUpgrade = async (planType: 'test100' | 'test200' | 'basic' | 'pro' | 'annual') => {
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
                  {profile?.plan ? getPlanDisplayName(profile.plan) : 'No Plan'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Are Reminders Working?
                </p>
                <p className={`text-sm font-medium ${
                  profile?.subscription_status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profile?.subscription_status === 'active' ? '✓ Yes, Active' : '❌ No, Inactive'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next Payment Due
                </p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.subscription_status === 'active' ? 'Next month' : 'No payment scheduled'}
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
          <div className="grid gap-4 lg:grid-cols-3">
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
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

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
