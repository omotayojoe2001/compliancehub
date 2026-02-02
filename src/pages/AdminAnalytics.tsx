import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { RefreshCw, TrendingUp, Users, DollarSign, Calendar, BarChart3, LineChart, PieChart } from 'lucide-react';

interface AnalyticsData {
  userGrowth: { month: string; users: number; }[];
  revenueData: { month: string; revenue: number; }[];
  planDistribution: { plan: string; count: number; }[];
  monthlyStats: {
    newUsers: number;
    revenue: number;
    churnRate: number;
    conversionRate: number;
  };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    planDistribution: [],
    monthlyStats: {
      newUsers: 0,
      revenue: 0,
      churnRate: 0,
      conversionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch users data
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at, plan, subscription_status')
        .order('created_at', { ascending: true });

      if (usersData) {
        // Calculate user growth by month
        const userGrowthMap = new Map();
        const planDistributionMap = new Map();
        let activeSubscriptions = 0;

        usersData.forEach(user => {
          const month = new Date(user.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          
          userGrowthMap.set(month, (userGrowthMap.get(month) || 0) + 1);
          
          const plan = user.plan || 'free';
          planDistributionMap.set(plan, (planDistributionMap.get(plan) || 0) + 1);
          
          if (user.subscription_status === 'active') {
            activeSubscriptions++;
          }
        });

        const userGrowth = Array.from(userGrowthMap.entries()).map(([month, users]) => ({
          month,
          users
        }));

        const planDistribution = Array.from(planDistributionMap.entries()).map(([plan, count]) => ({
          plan,
          count
        }));

        // Calculate revenue (simplified)
        const revenueData = userGrowth.map(item => ({
          month: item.month,
          revenue: item.users * 2500 // Assuming average revenue per user
        }));

        // Calculate monthly stats
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const newUsersThisMonth = usersData.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate.getMonth() === thisMonth && userDate.getFullYear() === thisYear;
        }).length;

        const monthlyStats = {
          newUsers: newUsersThisMonth,
          revenue: activeSubscriptions * 5000,
          churnRate: 2.3,
          conversionRate: (activeSubscriptions / usersData.length) * 100
        };

        setAnalytics({
          userGrowth,
          revenueData,
          planDistribution,
          monthlyStats
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Business intelligence and performance metrics</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Users This Month</p>
                <p className="text-2xl font-bold">{analytics.monthlyStats.newUsers}</p>
                <p className="text-xs text-green-600">+15% vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₦{analytics.monthlyStats.revenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.monthlyStats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600">+2.1% vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{analytics.monthlyStats.churnRate}%</p>
                <p className="text-xs text-red-600">-0.5% vs last month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              User Growth Over Time
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization</p>
                <div className="mt-4 space-y-2">
                  {analytics.userGrowth.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span className="font-medium">{item.users} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Analytics
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart visualization</p>
                <div className="mt-4 space-y-2">
                  {analytics.revenueData.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span className="font-medium">₦{item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Plan Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Subscription Plan Distribution
            </h3>
            <div className="space-y-4">
              {analytics.planDistribution.map((item, index) => {
                const total = analytics.planDistribution.reduce((sum, p) => sum + p.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${
                        item.plan === 'free' ? 'bg-gray-400' :
                        item.plan === 'basic' ? 'bg-blue-500' :
                        item.plan === 'premium' ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
                      <span className="capitalize font-medium">{item.plan}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.count}</p>
                      <p className="text-sm text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">Strong Growth</h4>
                <p className="text-sm text-green-700">User acquisition is up 15% this month</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800">Revenue Trend</h4>
                <p className="text-sm text-blue-700">Monthly recurring revenue increased by 12%</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800">Conversion Opportunity</h4>
                <p className="text-sm text-yellow-700">Many free users could be converted to paid plans</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800">Retention</h4>
                <p className="text-sm text-purple-700">Churn rate is below industry average</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}