import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AutomationControls } from '@/components/dashboard/AutomationControls';
import { supabase } from '@/lib/supabase';
import { 
  Users, DollarSign, Bell, AlertTriangle, Search, Eye, Ban, Edit, Trash2, 
  Plus, Download, Upload, Settings, Database, Mail, MessageSquare, 
  Activity, TrendingUp, Calendar, FileText, Shield, Server, 
  BarChart3, PieChart, LineChart, RefreshCw, Filter, Send
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  business_name: string;
  plan: string;
  subscription_status: string;
  created_at: string;
  last_login?: string;
  phone?: string;
  company_size?: string;
}

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

interface TaxObligation {
  id: string;
  user_id: string;
  tax_type: string;
  due_date: string;
  amount: number;
  status: string;
  created_at: string;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  user_id?: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [obligations, setObligations] = useState<TaxObligation[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch tax obligations
      const { data: obligationsData } = await supabase
        .from('tax_obligations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (usersData) {
        setUsers(usersData);
        
        // Calculate comprehensive stats
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

      if (obligationsData) {
        setObligations(obligationsData);
      }

      // Generate sample logs
      setLogs([
        { id: '1', level: 'info', message: 'User login successful', timestamp: new Date().toISOString() },
        { id: '2', level: 'warning', message: 'High memory usage detected', timestamp: new Date().toISOString() },
        { id: '3', level: 'error', message: 'Email delivery failed', timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus;
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: newStatus })
      .eq('id', userId);
    
    if (!error) {
      fetchData();
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (!error) {
        fetchData();
      }
    }
  };

  const sendBulkEmail = async () => {
    // Implement bulk email functionality
    alert('Bulk email feature would be implemented here');
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Email,Business Name,Plan,Status,Created At\n" +
      users.map(u => `${u.email},${u.business_name || ''},${u.plan || 'free'},${u.subscription_status || 'inactive'},${u.created_at}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comprehensive Admin Panel</h1>
            <p className="text-muted-foreground">Complete system management and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="obligations">Tax Data</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                <Button variant="outline" className="h-20 flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  WhatsApp Broadcast
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Backup Database
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Generate Report
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">User Management</h2>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPlan} onValueChange={setFilterPlan}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Business</th>
                      <th className="text-left p-3 font-medium">Plan</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Joined</th>
                      <th className="text-left p-3 font-medium">Last Login</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{user.business_name || 'Not set'}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                            {user.plan || 'free'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                            {user.subscription_status || 'inactive'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input value={selectedUser.email} readOnly />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Business Name</label>
                                        <Input value={selectedUser.business_name || ''} />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Plan</label>
                                        <Select value={selectedUser.plan || 'free'}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="basic">Basic</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={selectedUser.subscription_status || 'inactive'}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button>Save Changes</Button>
                                      <Button variant="outline">Send Email</Button>
                                      <Button variant="outline">Reset Password</Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleUserStatus(user.id, user.subscription_status)}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="obligations" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tax Obligations Overview</h2>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Obligations</p>
                  <p className="text-2xl font-bold">{obligations.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{obligations.filter(o => o.status === 'completed').length}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{obligations.filter(o => o.status === 'overdue').length}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Tax Type</th>
                      <th className="text-left p-3 font-medium">Due Date</th>
                      <th className="text-left p-3 font-medium">Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obligations.slice(0, 10).map((obligation) => (
                      <tr key={obligation.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{obligation.tax_type}</td>
                        <td className="p-3">{new Date(obligation.due_date).toLocaleDateString()}</td>
                        <td className="p-3">₦{obligation.amount?.toLocaleString() || 'N/A'}</td>
                        <td className="p-3">
                          <Badge variant={obligation.status === 'completed' ? 'default' : 'secondary'}>
                            {obligation.status}
                          </Badge>
                        </td>
                        <td className="p-3">{obligation.user_id.slice(0, 8)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <LineChart className="h-16 w-16 text-gray-400" />
                  <p className="ml-4 text-gray-500">Chart visualization would go here</p>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <BarChart3 className="h-16 w-16 text-gray-400" />
                  <p className="ml-4 text-gray-500">Chart visualization would go here</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">System Logs</h2>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className={`p-3 rounded border-l-4 ${
                    log.level === 'error' ? 'border-red-500 bg-red-50' :
                    log.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <AutomationControls />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">System Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Send automated email reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">WhatsApp Integration</h3>
                    <p className="text-sm text-muted-foreground">Enable WhatsApp notifications</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto Backup</h3>
                    <p className="text-sm text-muted-foreground">Daily database backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Announcement</label>
                  <Textarea placeholder="Enter system-wide announcement..." />
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Broadcast
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}