import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, X, TrendingDown, TrendingUp, Shield, Calculator, Mail, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { paymentService } from "@/lib/paymentService";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  newPlan: string;
  isDowngrade: boolean;
  planDetails: any;
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onClose, onConfirm, currentPlan, newPlan, isDowngrade, planDetails }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold flex items-center gap-3">
            {isDowngrade ? (
              <>
                <div className="p-2 bg-red-100 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-red-700">Confirm Downgrade</span>
              </>
            ) : (
              <>
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-green-700">Confirm Upgrade</span>
              </>
            )}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plan Change Summary */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              You are <span className="font-semibold">{isDowngrade ? 'downgrading' : 'upgrading'}</span> from
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentPlan}
              </span>
              <div className="p-1 bg-gray-200 rounded-full">
                {isDowngrade ? (
                  <TrendingDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {newPlan}
              </span>
            </div>
          </div>
          
          {/* Lost Features Warning */}
          {isDowngrade && planDetails.lostFeatures?.length > 0 && (
            <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-bold text-red-800">You will lose access to:</h4>
              </div>
              <ul className="space-y-2">
                {planDetails.lostFeatures.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-red-700">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <p className="text-xs text-red-800 font-medium">
                    This means fewer reminders and reduced functionality!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* New Features */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">You will have access to:</h4>
            </div>
            <ul className="space-y-2">
              {planDetails.features?.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                  <div className="p-1 bg-green-200 rounded-full">
                    {feature.includes('calculator') ? (
                      <Calculator className="h-3 w-3 text-green-600" />
                    ) : feature.includes('email') || feature.includes('Email') ? (
                      <Mail className="h-3 w-3 text-green-600" />
                    ) : feature.includes('obligation') ? (
                      <Users className="h-3 w-3 text-green-600" />
                    ) : (
                      <Check className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Price Information */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">New Pricing</h4>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-900">{planDetails.price}</span>
              <span className="text-sm text-blue-700 ml-1">{planDetails.period}</span>
            </div>
          </div>

          {/* Final Warning for Downgrades */}
          {isDowngrade && (
            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">
                    Are you sure you want to downgrade?
                  </p>
                  <p className="text-xs text-yellow-700">
                    This will reduce your service level and may affect your tax compliance reminders.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className={`flex-1 ${isDowngrade ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isDowngrade ? (
              <>
                <TrendingDown className="h-4 w-4 mr-2" />
                Yes, Downgrade
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Yes, Upgrade
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Subscription() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Plan hierarchy for determining upgrades/downgrades
  const planHierarchy = {
    test100: 1,
    test200: 2,
    basic: 3,
    pro: 4,
    annual: 5
  };

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

  const handlePlanSelection = (plan: any) => {
    if (!profile?.plan) {
      // No current plan, proceed directly
      handleUpgrade(plan.planKey);
      return;
    }
    
    const currentLevel = planHierarchy[profile.plan as keyof typeof planHierarchy] || 0;
    const newLevel = planHierarchy[plan.planKey as keyof typeof planHierarchy] || 0;
    const isDowngrade = newLevel < currentLevel;
    
    // Set up confirmation modal
    setSelectedPlan({
      ...plan,
      isDowngrade,
      lostFeatures: isDowngrade ? getLostFeatures(profile.plan, plan.planKey) : []
    });
    setShowConfirmation(true);
  };

  const getLostFeatures = (currentPlan: string, newPlan: string) => {
    const features: { [key: string]: string[] } = {
      annual: ['Multi-user access', 'API access', 'Custom integrations', 'Dedicated account manager'],
      pro: ['Unlimited obligations', 'WhatsApp reminders', 'Advanced calculator', 'Priority support'],
      basic: ['Up to 3 obligations', 'Basic calculator', 'Email support'],
      test200: ['2 obligations tracked'],
      test100: ['1 obligation tracked']
    };
    
    const currentFeatures = features[currentPlan] || [];
    const newFeatures = features[newPlan] || [];
    
    return currentFeatures.filter(feature => !newFeatures.includes(feature));
  };

  const confirmPlanChange = () => {
    setShowConfirmation(false);
    if (selectedPlan) {
      handleUpgrade(selectedPlan.planKey);
    }
  };

  const handleUpgrade = async (planType: 'test100' | 'test200' | 'basic' | 'pro' | 'annual') => {
    if (!user || !profile) return;
    
    setLoading(planType);
    
    try {
      console.log('🔄 Starting subscription process for:', planType);
      console.log('👤 User:', user.email);
      console.log('🏢 Business:', profile.business_name);
      
      const amount = paymentService.getPlanPrice(planType);
      console.log('💰 Amount:', amount);
      
      await paymentService.initializePayment({
        email: user.email || '',
        amount,
        plan: planType,
        businessName: profile.business_name
      });
      
      console.log('✅ Payment initialized successfully');
      
      // Payment successful - refresh profile and page
      setTimeout(() => {
        console.log('🔄 Reloading page to reflect changes');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={confirmPlanChange}
          currentPlan={getPlanDisplayName(profile?.plan || '')}
          newPlan={selectedPlan?.name || ''}
          isDowngrade={selectedPlan?.isDowngrade || false}
          planDetails={selectedPlan || {}}
        />

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
                      onClick={() => handlePlanSelection(plan)}
                      disabled={loading === plan.planKey}
                    >
                      {loading === plan.planKey ? 'Processing...' : 
                       `${profile?.plan && planHierarchy[plan.planKey] < planHierarchy[profile.plan as keyof typeof planHierarchy] ? 'Downgrade to' : 'Upgrade to'} ${plan.name}`}
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