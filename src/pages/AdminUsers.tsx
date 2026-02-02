import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Search, Eye, Ban, Trash2, RefreshCw, Download } from 'lucide-react';

interface User {
  id: string;
  email: string;
  business_name: string;
  plan: string;
  subscription_status: string;
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  company_size?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get users from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      if (profilesData) {
        // Get subscription data separately
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select('user_id, plan_type, status, created_at')
          .order('created_at', { ascending: false });

        // Create subscription map
        const subscriptionMap = new Map();
        subscriptionsData?.forEach(sub => {
          if (!subscriptionMap.has(sub.user_id)) {
            subscriptionMap.set(sub.user_id, sub);
          }
        });

        const usersWithCorrectData = profilesData.map(profile => {
          const subscription = subscriptionMap.get(profile.id);
          
          return {
            id: profile.id,
            email: profile.email || 'No email',
            business_name: profile.business_name || '',
            plan: subscription?.plan_type || 'free',
            subscription_status: subscription?.status || 'inactive',
            created_at: profile.created_at,
            last_sign_in_at: null, // Will show 'Never'
            phone: profile.phone || '',
            company_size: profile.company_size || ''
          };
        });
        
        setUsers(usersWithCorrectData);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('user_id', userId);
    
    if (!error) {
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (!error) {
        fetchUsers();
      }
    }
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
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage all system users and their subscriptions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
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
                      <Badge variant={user.plan === 'free' ? 'secondary' : 
                        user.plan === 'basic' ? 'default' : 
                        user.plan === 'premium' ? 'default' : 'secondary'}>
                        {(user.plan || 'free').charAt(0).toUpperCase() + (user.plan || 'free').slice(1)}
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
                      <p className="text-sm">
                        {user.last_sign_in_at ? 
                          new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Never'
                        }
                      </p>
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
                                    <Input value={selectedUser.business_name || ''} readOnly />
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
      </div>
    </AdminLayout>
  );
}