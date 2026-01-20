import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Shield, CreditCard, Building, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService, UserProfile } from '@/lib/comprehensiveDbService';

export default function SettingsClean() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    address: '',
    tin: '',
    business_type: '',
    notification_preferences: {
      email: true,
      whatsapp: true,
      sms: false
    },
    security_preferences: {
      two_factor: false,
      login_alerts: true
    }
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const profileData = await comprehensiveDbService.getUserProfile(user!.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          business_name: profileData.business_name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          tin: profileData.tin || '',
          business_type: profileData.business_type || '',
          notification_preferences: profileData.notification_preferences || {
            email: true,
            whatsapp: true,
            sms: false
          },
          security_preferences: profileData.security_preferences || {
            two_factor: false,
            login_alerts: true
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    setSaved(false);
    
    try {
      await comprehensiveDbService.updateUserProfile(user.id, formData);
      await comprehensiveDbService.logActivity(user.id, 'profile_updated', 'User updated profile settings');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationPref = (type: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: enabled
      }
    }));
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Account Information</h3>
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Saved successfully!</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full border border-border rounded-md px-3 py-2 bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Used for WhatsApp notifications</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Business Type</label>
                <select 
                  value={formData.business_type}
                  onChange={(e) => updateFormData('business_type', e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2"
                >
                  <option value="">Select business type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited_company">Limited Company</option>
                  <option value="ngo">NGO/Non-Profit</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={formData.business_name}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  placeholder="Your business name"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tax ID (TIN)</label>
                <input 
                  type="text" 
                  value={formData.tin}
                  onChange={(e) => updateFormData('tin', e.target.value)}
                  placeholder="12345678-0001"
                  className="w-full border border-border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="Your business address"
                  className="w-full border border-border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="mt-6"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.notification_preferences.email}
                    onChange={(e) => updateNotificationPref('email', e.target.checked)}
                    className="rounded" 
                  />
                  <span className="text-sm">Tax deadline reminders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Monthly compliance summaries</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Product updates and news</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp Alerts
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.notification_preferences.whatsapp}
                    onChange={(e) => updateNotificationPref('whatsapp', e.target.checked)}
                    className="rounded" 
                  />
                  <span className="text-sm">Urgent deadline alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Weekly status updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Payment confirmations</span>
                </label>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="mt-6"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notification Settings'
            )}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium">Login Sessions</h4>
                <p className="text-sm text-muted-foreground">Manage your active sessions</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download all your account data</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600">Export</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600">Delete</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}