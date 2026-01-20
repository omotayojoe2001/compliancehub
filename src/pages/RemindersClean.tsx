import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Calendar, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';

export default function RemindersClean() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      const dashboardStats = await comprehensiveDbService.getDashboardStats(user!.id);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">Track all your automated compliance reminders</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{stats?.recentReminders?.length || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email Reminders</p>
                <p className="text-2xl font-bold">{stats?.recentReminders?.filter((r: any) => r.reminder_type === 'email').length || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp Alerts</p>
                <p className="text-2xl font-bold">{stats?.recentReminders?.filter((r: any) => r.reminder_type === 'whatsapp').length || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats?.recentReminders?.filter((r: any) => r.status === 'sent').length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Reminders</h3>
            <Button onClick={() => window.location.href = '/test-notifications'}>Test Notifications</Button>
          </div>
          
          {stats?.recentReminders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reminders sent yet. Add tax obligations to start receiving automated reminders.
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentReminders?.map((reminder: any) => (
                <div key={reminder.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${reminder.reminder_type === 'email' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {reminder.reminder_type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{reminder.tax_obligations?.obligation_type || 'Tax Reminder'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reminder.message_content?.substring(0, 60) || 'Automated tax compliance reminder'}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(reminder.sent_date || reminder.created_at).toLocaleDateString()}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        reminder.status === 'sent' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {reminder.status === 'sent' ? 'Delivered' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reminder Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Email Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">VAT return reminders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">PAYE filing alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Monthly summaries</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">WhatsApp Alerts</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Urgent deadlines</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Weekly updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Payment confirmations</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}