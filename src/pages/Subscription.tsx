import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentService } from "@/lib/paymentService";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";
import { supabaseService } from "@/lib/supabaseService";
import { contentService } from "@/lib/contentService";

export default function Subscription() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [actualSubscription, setActualSubscription] = useState<any>(null);
  
  useEffect(() => {
    fetchContent();
    if (user?.id) {
      loadSubscriptionData();
    }
  }, [user?.id]);
  
  const fetchContent = async () => {
    console.log('🔍 SUBSCRIPTION DEBUG - Starting fetchContent');
    try {
      const data = await contentService.getContent();
      console.log('🔍 SUBSCRIPTION DEBUG - Raw data received:', data);
      console.log('🔍 SUBSCRIPTION DEBUG - Enterprise price:', data?.pricing?.plans?.enterprise?.annualPrice);
      setContent(data);
    } catch (error) {
      console.error('🔍 SUBSCRIPTION DEBUG - Error fetching content:', error);
    }
  };
  // Get plan display name
  const getPlanDisplayName = (planKey: string) => {
    const planNames = {
      free: 'Free',
      basic: 'Basic',
      pro: 'Professional', 
      enterprise: 'Enterprise'
    };
    return planNames[planKey as keyof typeof planNames] || planKey;
  };
  
  const loadSubscriptionData = async () => {
    if (!user?.id) return;
    
    try {
      const subscription = await supabaseService.getSubscription(user.id);
      setActualSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  // Use dynamic pricing from content or fallback to defaults
  const plans = (content?.pricing?.plans && 
                 content.pricing.plans.free?.annualPrice !== undefined &&
                 content.pricing.plans.basic?.annualPrice !== undefined &&
                 content.pricing.plans.pro?.annualPrice !== undefined &&
                 content.pricing.plans.enterprise?.annualPrice !== undefined) ? [
    {
      name: "Free",
      annualPrice: `₦${content.pricing.plans.free.annualPrice.toLocaleString()}`,
      monthlyPrice: `₦${content.pricing.plans.free.monthlyPrice.toLocaleString()}`,
      period: "/forever",
      monthlyPeriod: "/forever",
      features: content.pricing.plans.free.features || [
        "View compliance guides",
        "Basic tax information",
        "No reminders",
      ],
      current: actualSubscription?.plan_type === 'free',
      planKey: 'free' as const,
    },
    {
      name: "Basic",
      annualPrice: `₦${content.pricing.plans.basic.annualPrice.toLocaleString()}`,
      monthlyPrice: `₦${content.pricing.plans.basic.monthlyPrice.toLocaleString()}`,
      period: "/year",
      monthlyPeriod: "/month",
      features: content.pricing.plans.basic.features || [
        "1 Business Profile",
        "Email Reminders",
        "Tax Calculator Access",
        "Filing Guides",
        "Up to 3 tax obligations",
      ],
      current: actualSubscription?.plan_type === 'basic',
      planKey: 'basic' as const,
    },
    {
      name: "Pro",
      annualPrice: `₦${content.pricing.plans.pro.annualPrice.toLocaleString()}`,
      monthlyPrice: `₦${content.pricing.plans.pro.monthlyPrice.toLocaleString()}`,
      period: "/year",
      monthlyPeriod: "/month",
      features: content.pricing.plans.pro.features || [
        "Up to 5 Business Profiles",
        "WhatsApp Reminders",
        "Email Reminders",
        "Advanced Tax Calculator",
        "Filing Guides",
        "Unlimited tax obligations",
        "Priority Support",
      ],
      current: actualSubscription?.plan_type === 'pro',
      planKey: 'pro' as const,
    },
    {
      name: "Enterprise",
      annualPrice: `₦${content.pricing.plans.enterprise.annualPrice.toLocaleString()}`,
      monthlyPrice: `₦${content.pricing.plans.enterprise.monthlyPrice.toLocaleString()}`,
      period: "/year",
      monthlyPeriod: "/month",
      features: content.pricing.plans.enterprise.features || [
        "Unlimited Business Profiles",
        "WhatsApp Reminders",
        "Email Reminders",
        "Advanced Tax Calculator",
        "API Access",
        "Multi-user Access",
        "Dedicated Account Manager",
        "Custom Integrations",
      ],
      current: actualSubscription?.plan_type === 'enterprise',
      planKey: 'enterprise' as const,
    },
  ] : [
    // Fallback hardcoded plans
    {
      name: "Free",
      annualPrice: "₦0",
      monthlyPrice: "₦0",
      period: "/forever",
      monthlyPeriod: "/forever",
      features: ["View compliance guides", "Basic tax information", "No reminders"],
      current: actualSubscription?.plan_type === 'free',
      planKey: 'free' as const,
    },
    {
      name: "Basic",
      annualPrice: "₦15,000",
      monthlyPrice: "₦1,250",
      period: "/year",
      monthlyPeriod: "/month",
      features: ["1 Business Profile", "Email Reminders", "Tax Calculator Access"],
      current: actualSubscription?.plan_type === 'basic',
      planKey: 'basic' as const,
    },
    {
      name: "Pro",
      annualPrice: "₦50,000",
      monthlyPrice: "₦4,167",
      period: "/year",
      monthlyPeriod: "/month",
      features: ["Up to 5 Business Profiles", "WhatsApp Reminders", "Priority Support"],
      current: actualSubscription?.plan_type === 'pro',
      planKey: 'pro' as const,
    },
    {
      name: "Enterprise",
      annualPrice: "₦150,000",
      monthlyPrice: "₦12,500",
      period: "/year",
      monthlyPeriod: "/month",
      features: ["Unlimited Business Profiles", "API Access", "Dedicated Account Manager"],
      current: actualSubscription?.plan_type === 'enterprise',
      planKey: 'enterprise' as const,
    },
  ];

  const handleUpgrade = async (planType: 'free' | 'basic' | 'pro' | 'enterprise') => {
    if (!user || !profile) return;
    
    setLoading(planType);
    
    try {
      const amount = await paymentService.getPlanPrice(planType);
      
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
        <div>
          <h1 className="text-lg font-semibold text-foreground">Your Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Keep your reminders working by staying subscribed
          </p>
        </div>

        {/* Current Status */}
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

        {/* Plans Grid */}
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
                    {plan.annualPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Billed annually
                </p>

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
