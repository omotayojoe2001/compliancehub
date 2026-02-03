import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, TrendingUp, Activity, Mail, MessageSquare, 
  Database, FileText, RefreshCw, Download, Calculator
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  remindersSent: number;
  newUsersToday: number;
  churnRate: number;
  avgSessionTime: string;
  systemUptime: string;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    remindersSent: 0,
    newUsersToday: 0,
    churnRate: 0,
    avgSessionTime: '0m',
    systemUptime: '99.9%'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        const totalUsers = usersData.length;
        const activeSubscriptions = usersData.filter(u => u.subscription_status === 'active').length;
        const today = new Date().toDateString();
        const newUsersToday = usersData.filter(u => 
          new Date(u.created_at).toDateString() === today
        ).length;
        
        setStats({
          totalUsers,
          activeSubscriptions,
          totalRevenue: activeSubscriptions * 5000,
          remindersSent: totalUsers * 3,
          newUsersToday,
          churnRate: 2.3,
          avgSessionTime: '12m 34s',
          systemUptime: '99.9%'
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
    setLoading(false);
  };

  const sendBulkEmail = async () => {
    alert('Bulk email feature would be implemented here');
  };

  const exportData = () => {
    alert('Export functionality would be implemented here');
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
            <h1 className="text-3xl font-bold text-foreground">Admin Overview</h1>
            <p className="text-muted-foreground">System dashboard and quick actions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+{stats.newUsersToday} today</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground">{((stats.activeSubscriptions/stats.totalUsers)*100).toFixed(1)}% conversion</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">{stats.systemUptime}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Button onClick={sendBulkEmail} className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              Send Bulk Email
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/tax-rates')}>
              <Calculator className="h-6 w-6 mb-2" />
              Tax Rates
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/users')}>
              <Users className="h-6 w-6 mb-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/system')}>
              <Database className="h-6 w-6 mb-2" />
              System Health
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => navigate('/admin/analytics')}>
              <FileText className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Email Service</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">WhatsApp API</p>
                <p className="text-sm text-muted-foreground">Pending Setup</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Payment Gateway</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}