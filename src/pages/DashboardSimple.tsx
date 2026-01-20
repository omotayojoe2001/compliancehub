import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Bell, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';

export default function DashboardSimple() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await comprehensiveDbService.getDashboardStats(user!.id);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to ComplianceHub</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Obligations</p>
                <p className="text-xl font-bold">{stats?.totalObligations || 0}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats?.pendingObligations || 0}</p>
              </div>
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{stats?.completedObligations || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">{stats?.overdueObligations || 0}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reminders ({stats?.recentReminders?.length || 0})</h3>
            <div className="space-y-3">
              {stats?.recentReminders?.length > 0 ? (
                stats.recentReminders.slice(0, 3).map((reminder: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{reminder.tax_obligations?.obligation_type || 'Tax Reminder'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reminder.sent_date || reminder.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent reminders</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Income</span>
                <span className="text-sm font-medium text-green-600">
                  ₦{(stats?.totalIncome || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Expenses</span>
                <span className="text-sm font-medium text-red-600">
                  ₦{(stats?.totalExpenses || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">Net Profit</span>
                <span className={`text-sm font-bold ${
                  (stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₦{(stats?.netProfit || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}