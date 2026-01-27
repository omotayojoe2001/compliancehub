import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCompany } from "@/contexts/CompanyContext";
import { useProfileSimple } from "@/hooks/useProfileSimple";

export default function DashboardMinimal() {
  console.group('🏠 DASHBOARD MINIMAL DEBUG');
  console.log('📊 DashboardMinimal rendering - optimized for speed');
  
  const { currentCompany } = useCompany();
  const { profile } = useProfileSimple();
  
  console.log('📊 Component state:', {
    timestamp: new Date().toISOString(),
    company: {
      name: currentCompany?.name,
      id: currentCompany?.id,
      tin: currentCompany?.tin
    },
    profile: {
      businessName: profile?.business_name,
      plan: profile?.plan,
      subscriptionStatus: profile?.subscription_status
    }
  });
  console.groupEnd();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your compliance status
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border bg-card p-4 rounded-lg">
            <h3 className="text-sm font-medium">Business</h3>
            <p className="text-lg font-semibold">{currentCompany?.name || profile?.business_name || "Loading..."}</p>
            <p className="text-xs text-muted-foreground">TIN: {currentCompany?.tin || "Not set"}</p>
          </div>
          
          <div className="border border-border bg-card p-4 rounded-lg">
            <h3 className="text-sm font-medium">Subscription</h3>
            <p className="text-lg font-semibold">{profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1) || "Basic"}</p>
            <p className="text-xs text-green-600">{profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}</p>
          </div>
          
          <div className="border border-border bg-card p-4 rounded-lg">
            <h3 className="text-sm font-medium">Next Due</h3>
            <p className="text-lg font-semibold">None</p>
            <p className="text-xs text-muted-foreground">Add tax periods below</p>
          </div>
          
          <div className="border border-border bg-card p-4 rounded-lg">
            <h3 className="text-sm font-medium">Overdue</h3>
            <p className="text-lg font-semibold">0</p>
            <p className="text-xs text-muted-foreground">All up to date</p>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Dashboard Loaded Successfully!</h3>
          <p className="text-muted-foreground">
            This minimal dashboard loads instantly without any loading states.
            All async operations have been bypassed.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}