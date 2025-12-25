import { Building2, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { RecentReminders } from "@/components/dashboard/RecentReminders";
import { AddTaxObligation } from "@/components/dashboard/AddTaxObligation";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";
import { useProfile } from "@/hooks/useProfile";
import { usePlanRestrictions } from "@/hooks/usePlanRestrictions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  console.log('🏠 Dashboard component RENDERING...');
  
  const { profile, loading } = useProfile();
  const { plan, limits, getObligationLimitMessage } = usePlanRestrictions();
  const navigate = useNavigate();

  console.log('🏠 Dashboard state check:', {
    hasProfile: !!profile,
    profileBusinessName: profile?.business_name,
    loading,
    plan,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    console.log('🏠 Dashboard showing LOADING state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
          <p className="mt-1 text-xs text-gray-400">Debug: Profile loading in progress</p>
        </div>
      </DashboardLayout>
    );
  }

  console.log('🏠 Dashboard rendering MAIN CONTENT');
  const showUpgradePrompt = plan === 'free' || limits.maxObligations === 0;

  return (
    <DashboardLayout>
      <WelcomePopup />
      <div className="space-y-6">
        {/* Page Header */}
        <HelpWrapper
          helpTitle="What is this page?"
          helpContent="This is your main screen. It answers one simple question: 'Am I safe right now or not?' You can see if any taxes are due soon and if the system is working for you."
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your compliance status
            </p>
          </div>
        </HelpWrapper>

        {/* Plan Restrictions Alert */}
        {showUpgradePrompt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800">⚠️ No Active Subscription</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {getObligationLimitMessage()}
                </p>
              </div>
              <Button onClick={() => navigate('/subscription')} className="bg-yellow-600 hover:bg-yellow-700">
                Subscribe Now
              </Button>
            </div>
          </div>
        )}

        {/* Plan Limits Info */}
        {!showUpgradePrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📊 {getObligationLimitMessage()} | 
              {limits.hasWhatsAppReminders ? '📱 WhatsApp + ' : ''}📧 Email reminders
              {limits.hasAdvancedCalculator ? ' | 🧮 Advanced calculator' : ''}
            </p>
          </div>
        )}

        {/* Alert Banner - Only show if there are actual obligations */}
        <HelpWrapper
          helpTitle="Important Warnings"
          helpContent="When you see a red or yellow warning like this, it means a tax deadline is coming soon. This is the most important thing to pay attention to!"
        >
          {/* Remove hardcoded alert - will be populated by UpcomingObligations component */}
        </HelpWrapper>

        {/* Summary Cards */}
        <HelpWrapper
          helpTitle="Quick Info About You"
          helpContent="These boxes show: 1) Your business name, 2) If you paid your subscription, 3) What tax is due next, 4) If anything is overdue. Think of it like a quick health check."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Business"
              value={profile?.business_name || "Loading..."}
              description={`Phone: ${profile?.phone || "N/A"}`}
              icon={<Building2 className="h-5 w-5" />}
            />
            <SummaryCard
              title="Subscription"
              value={profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1) || "Basic"}
              description={profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
              variant={profile?.subscription_status === 'active' ? 'success' : 'error'}
              icon={<CreditCard className="h-5 w-5" />}
            />
            <SummaryCard
              title="Next Due"
              value="None"
              description="Add tax periods below"
              icon={<Calendar className="h-5 w-5" />}
            />
            <SummaryCard
              title="Overdue"
              value="0"
              description="All up to date"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>
        </HelpWrapper>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <HelpWrapper
              helpTitle="Add Your Tax Periods"
              helpContent="Only add tax periods you actually need to file. For example, if you had business activity in December 2024, add 'VAT - December 2024' here."
            >
              <AddTaxObligation />
            </HelpWrapper>
            
            <HelpWrapper
              helpTitle="What's Coming Up"
              helpContent="This shows all your upcoming tax deadlines. The system watches these dates for you and will send you WhatsApp and email reminders."
            >
              <UpcomingObligations />
            </HelpWrapper>
          </div>
          
          <HelpWrapper
            helpTitle="Proof the System Works"
            helpContent="This shows you all the reminders we've sent you. This proves the system is actually working and watching your deadlines."
          >
            <RecentReminders />
          </HelpWrapper>
        </div>
      </div>
    </DashboardLayout>
  );
}
