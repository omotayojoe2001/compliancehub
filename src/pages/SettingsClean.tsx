import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfileHttp } from "@/hooks/useProfileHttp";
import { freshDbService } from "@/lib/freshDbService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsClean() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    client_name: '',
    email: user?.email || '',
    phone: ''
  });
  
  const [businessData, setBusinessData] = useState({
    business_name: '',
    rc_number: '',
    tin: '',
    industry: ''
  });

  const [saving, setSaving] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const profileData = await freshDbService.getProfile(user?.id || '');
      console.log('📋 Loaded profile:', profileData);
      
      if (profileData) {
        setProfile(profileData);
        setProfileData({
          client_name: profileData.client_name || profileData.business_name || '',
          email: user?.email || '',
          phone: profileData.phone || ''
        });
        setBusinessData({
          business_name: profileData.business_name || '',
          rc_number: '',
          tin: '',
          industry: ''
        });
      }
    } catch (error) {
      console.error('📋 Failed to load profile:', error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    console.log('💾 Saving profile data:', profileData);
    try {
      const success = await freshDbService.saveProfile(user?.id || '', {
        client_name: profileData.client_name,
        business_name: businessData.business_name,
        phone: profileData.phone,
        email: profileData.email
      });
      console.log('💾 Save result:', success);
      if (success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('💾 Save error:', error);
      alert('Failed to save profile');
    }
    setSaving(false);
  };

  const handleSaveBusiness = async () => {
    setSaving(true);
    try {
      const success = await freshDbService.saveProfile(user?.id || '', {
        business_name: businessData.business_name
      });
      if (success) {
        alert('Business details updated successfully!');
      } else {
        alert('Failed to save business details');
      }
    } catch (error) {
      alert('Failed to save business details');
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="client_name">Your Full Name</Label>
                <Input
                  id="client_name"
                  value={profileData.client_name}
                  onChange={(e) => setProfileData({...profileData, client_name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
                <p className="text-xs text-muted-foreground mt-1">Required for WhatsApp reminders (must be registered on WhatsApp)</p>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={businessData.business_name}
                  onChange={(e) => setBusinessData({...businessData, business_name: e.target.value})}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label htmlFor="rc_number">RC Number</Label>
                <Input
                  id="rc_number"
                  value={businessData.rc_number}
                  onChange={(e) => setBusinessData({...businessData, rc_number: e.target.value})}
                  placeholder="Enter RC number"
                />
              </div>
              <div>
                <Label htmlFor="tin">TIN</Label>
                <Input
                  id="tin"
                  value={businessData.tin}
                  onChange={(e) => setBusinessData({...businessData, tin: e.target.value})}
                  placeholder="Enter TIN"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <select 
                  id="industry"
                  value={businessData.industry}
                  onChange={(e) => setBusinessData({...businessData, industry: e.target.value})}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Services">Services</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <Button onClick={handleSaveBusiness} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You'll receive tax deadline reminders via email and WhatsApp automatically.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>✅ Email notifications: Enabled</p>
              <p>✅ WhatsApp notifications: {profileData.phone ? 'Enabled' : 'Add phone number to enable'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}