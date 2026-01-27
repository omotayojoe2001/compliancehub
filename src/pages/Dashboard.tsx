import { Building2, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { RecentReminders } from "@/components/dashboard/RecentReminders";
import { AddTaxObligation } from "@/components/dashboard/AddTaxObligation";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";
import { useProfileSimple } from "@/hooks/useProfileSimple";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { supabaseService } from "@/lib/supabaseService";
import DebugPanel from "@/components/DebugPanel";

export default function Dashboard() {
  console.group('🏠 DASHBOARD DEBUG - Component Render');
  console.log('📊 Dashboard rendering at:', new Date().toISOString());
  
  // Use proper profile hook to fetch real data from database
  const { profile, loading } = useProfileSimple();
  const { planType, isActive, loading: subscriptionLoading } = useSubscription();
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [obligations, setObligations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    nextDue: 'None',
    nextDueDescription: 'Add tax periods below',
    overdueCount: 0,
    overdueDescription: 'All up to date'
  });

  // Load obligations when company changes
  useEffect(() => {
    if (user?.id) {
      // Load obligations even if no company is selected yet
      loadObligations();
    }
  }, [user?.id, currentCompany?.id]);

  const loadObligations = async () => {
    if (!user?.id) return;
    
    try {
      const data = await supabaseService.getObligations(user.id, currentCompany?.id);
      setObligations(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('❌ Failed to load obligations:', error);
      setObligations([]);
      calculateStats([]);
    }
  };

  const calculateStats = (obligationData: any[]) => {
    const now = new Date();
    let nextDue = 'None';
    let nextDueDescription = 'Add tax periods below';
    let overdueCount = 0;
    
    if (obligationData.length > 0) {
      // Find overdue obligations
      const overdue = obligationData.filter(o => {
        const dueDate = new Date(o.next_due_date);
        return dueDate < now && o.payment_status !== 'paid';
      });
      overdueCount = overdue.length;
      
      // Find next due obligation
      const upcoming = obligationData
        .filter(o => {
          const dueDate = new Date(o.next_due_date);
          return dueDate >= now && o.payment_status !== 'paid';
        })
        .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
      
      if (upcoming.length > 0) {
        const nextObligation = upcoming[0];
        nextDue = `${nextObligation.obligation_type}`;
        nextDueDescription = new Date(nextObligation.next_due_date).toLocaleDateString();
      }
    }
    
    setDashboardStats({
      nextDue,
      nextDueDescription,
      overdueCount,
      overdueDescription: overdueCount > 0 ? `${overdueCount} overdue` : 'All up to date'
    });
  };

  console.log('🏠 Dashboard state check:', {
    timestamp: new Date().toISOString(),
    user: {
      id: user?.id,
      email: user?.email
    },
    profile: {
      hasProfile: !!profile,
      businessName: profile?.business_name,
      plan: profile?.plan,
      subscriptionStatus: profile?.subscription_status
    },
    company: {
      hasCurrentCompany: !!currentCompany,
      companyName: currentCompany?.name,
      companyId: currentCompany?.id,
      companyTin: currentCompany?.tin,
      isPrimary: currentCompany?.isPrimary
    },
    dashboard: {
      obligationsCount: obligations.length,
      nextDue: dashboardStats.nextDue,
      overdueCount: dashboardStats.overdueCount,
      loading: false
    }
  });

  // Force no loading state - but allow brief loading for profile
  if (loading && !profile) {
    console.log('🔄 Dashboard showing LOADING state');
    console.groupEnd();
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  console.log('✅ Dashboard rendering MAIN CONTENT');
  console.groupEnd();
  const showUpgradePrompt = !isActive || planType === 'free';

  return (
    <DashboardLayout>
      <WelcomePopup />
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your compliance status
          </p>
        </div>

        {/* Plan Restrictions Alert */}
        {showUpgradePrompt && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">🚀 Unlock WhatsApp Reminders</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Get instant WhatsApp alerts for tax deadlines + unlimited tracking. Never miss another deadline!
                </p>
              </div>
              <Button onClick={() => navigate('/subscription')} className="bg-blue-600 hover:bg-blue-700">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Plan Limits Info */}
        {!showUpgradePrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📊 {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Active | 
              📧 Email reminders | 🧮 Advanced calculator
            </p>
          </div>
        )}

        {/* Alert Banner - Only show if there are actual obligations */}
        {/* Remove hardcoded alert - will be populated by UpcomingObligations component */}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Business"
              value={currentCompany?.name || profile?.business_name || "Loading..."}
              description={`TIN: ${currentCompany?.tin || "Not set"}`}
              icon={<Building2 className="h-5 w-5" />}
            />
            <SummaryCard
              title="Subscription"
              value={planType ? (planType.charAt(0).toUpperCase() + planType.slice(1)) : "No Plan"}
              description={isActive ? 'Active' : 'Inactive'}
              variant={isActive ? 'success' : 'error'}
              icon={<CreditCard className="h-5 w-5" />}
            />
            <SummaryCard
              title="Next Due"
              value={dashboardStats.nextDue}
              description={dashboardStats.nextDueDescription}
              icon={<Calendar className="h-5 w-5" />}
            />
            <SummaryCard
              title="Overdue"
              value={dashboardStats.overdueCount.toString()}
              description={dashboardStats.overdueDescription}
              variant={dashboardStats.overdueCount > 0 ? 'error' : 'default'}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <AddTaxObligation />
            
            <UpcomingObligations />
          </div>
          
          <RecentReminders />
        </div>
      </div>
      
      {/* Debug Panel - Only visible in development */}
      <DebugPanel />
    </DashboardLayout>
  );
}
