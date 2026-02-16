import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseService } from '@/lib/supabaseService';
import { Users, Search, Mail, Phone, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  business_name: string;
  rc_number: string;
  tin: string;
  business_address: string;
  business_phone: string;
  cac_registration_date: string;
  vat_registered: boolean;
  paye_registered: boolean;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const profilesResponse = await fetch(`${supabaseService.supabaseUrl}/rest/v1/profiles?select=*`, {
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        
        const enrichedUsers = profilesData.map(user => ({
          ...user,
          full_name: user.client_name || user.business_name || 'No Name',
          rc_number: user.rc_number || 'Not provided',
          tin: user.tin || 'Not provided',
          business_address: user.business_address || 'Not provided',
          business_phone: user.phone || 'Not provided',
          email_notifications: false,
          whatsapp_notifications: false
        }));
        
        setUsers(enrichedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${supabaseService.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseService.supabaseKey,
          'Authorization': `Bearer ${supabaseService.supabaseKey}`,
        }
      });
      
      if (response.ok) {
        alert('User deleted successfully');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">View and manage all user profiles</p>
          </div>
          <Badge variant="secondary">{users.length} Total Users</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users List */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">All Users ({filteredUsers.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || 'No Name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.business_name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary">user</Badge>
                      <div className="flex gap-1">
                        {user.email_notifications && <Mail className="h-3 w-3 text-green-600" />}
                        {user.whatsapp_notifications && <Phone className="h-3 w-3 text-green-600" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Details</h2>
            {selectedUser ? (
              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Profile Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name:</span>
                      <span>{selectedUser.full_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge variant="secondary">user</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Name:</span>
                      <span>{selectedUser.business_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RC Number:</span>
                      <span>{selectedUser.rc_number || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TIN:</span>
                      <span>{selectedUser.tin || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Phone:</span>
                      <span>{selectedUser.business_phone || selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Address:</span>
                      <span className="text-right max-w-48 truncate">{selectedUser.business_address || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CAC Date:</span>
                      <span>{selectedUser.cac_registration_date ? new Date(selectedUser.cac_registration_date).toLocaleDateString() : 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Status */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tax Registration Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT Registered:</span>
                      <div className="flex items-center gap-1">
                        {(selectedUser.vat_status === 'yes' || selectedUser.vat_status === true) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>{(selectedUser.vat_status === 'yes' || selectedUser.vat_status === true) ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PAYE Registered:</span>
                      <div className="flex items-center gap-1">
                        {(selectedUser.paye_status === 'yes' || selectedUser.paye_status === true) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>{(selectedUser.paye_status === 'yes' || selectedUser.paye_status === true) ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Notifications:</span>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Disabled (Not Saved)</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WhatsApp Notifications:</span>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Disabled (Not Saved)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => deleteUser(selectedUser.id)}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a user to view their details
              </p>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}