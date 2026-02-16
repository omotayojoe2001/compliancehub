import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { dataExportService } from "@/lib/dataExportService";
import { supabase } from "@/lib/supabase";
import { Download, Calendar, CheckCircle, X, CreditCard } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { profile, loading } = useProfile();
  const { planType, isActive } = useSubscription();
  
  // Form states - use current company data
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  
  const [businessData, setBusinessData] = useState({
    business_name: '',
    rc_number: '',
    tin: '',
    industry: '',
    business_address: '',
    business_phone: ''
  });
  const [complianceData, setComplianceData] = useState({
    cac_date: '',
    vat_status: false,
    paye_status: false
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailReminders: true,
    whatsappReminders: false,
    deadlineAlerts: true
  });

  // Update form data when current company changes
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Update form data when current company changes
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        console.log('👤 Loaded profile:', data);
        setProfileData({
          full_name: data.client_name || user.email?.split('@')[0] || '',
          email: data.email || user.email || '',
          phone: data.phone || ''
        });
        
        setBusinessData({
          business_name: data.business_name || '',
          rc_number: data.rc_number || '',
          tin: data.tin || '',
          industry: '',
          business_address: data.business_address || '',
          business_phone: data.phone || ''
        });
        
        setComplianceData({
          cac_date: data.cac_date || '',
          vat_status: !!data.vat_status,
          paye_status: !!data.paye_status
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };



  const handleExportData = async () => {
    if (!user?.id) return;
    
    setExporting(true);
    try {
      const csvContent = await dataExportService.exportUserData(user.id);
      const filename = `compliance-data-${new Date().toISOString().split('T')[0]}.csv`;
      dataExportService.downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          client_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
      await loadProfileData();
    } catch (error) {
      console.error('Profile save failed:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveBusiness = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessData.business_name,
          rc_number: businessData.rc_number,
          tin: businessData.tin,
          business_address: businessData.business_address,
          phone: businessData.business_phone,
          cac_date: complianceData.cac_date || null,
          vat_status: complianceData.vat_status,
          paye_status: complianceData.paye_status
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Business details saved successfully!');
      await loadProfileData();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to save business details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          {["profile", "business", "notifications", "export"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === 'export' ? 'Export Data' : tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Profile Information
            </h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full border border-border bg-gray-50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}
            <div className="mt-6">
              <Button onClick={saveProfile} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Business Details
            </h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessData.business_name}
                    onChange={(e) => setBusinessData({...businessData, business_name: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    RC Number
                  </label>
                  <input
                    type="text"
                    value={businessData.rc_number}
                    onChange={(e) => setBusinessData({...businessData, rc_number: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter RC number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    TIN
                  </label>
                  <input
                    type="text"
                    value={businessData.tin}
                    onChange={(e) => setBusinessData({...businessData, tin: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter TIN"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Business Address
                  </label>
                  <textarea
                    value={businessData.business_address || ''}
                    onChange={(e) => setBusinessData({...businessData, business_address: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter business address"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={businessData.business_phone || ''}
                    onChange={(e) => setBusinessData({...businessData, business_phone: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter business phone"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    CAC Registration Date
                  </label>
                  <input
                    type="date"
                    value={complianceData.cac_date || ''}
                    onChange={(e) => setComplianceData({...complianceData, cac_date: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tax Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={complianceData.vat_status}
                        onChange={(e) => setComplianceData({...complianceData, vat_status: e.target.checked})}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">VAT Registered</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={complianceData.paye_status}
                        onChange={(e) => setComplianceData({...complianceData, paye_status: e.target.checked})}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">PAYE Registered</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6">
              <Button onClick={saveBusiness} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Notification Preferences
            </h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                <p className="text-sm text-blue-700">
                  <Calendar className="inline h-4 w-4 mr-1" /> Your current plan: {planType?.toUpperCase() || 'FREE'}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Email Reminders
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Receive obligation reminders via email
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {planType !== 'free' && isActive ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.emailReminders}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, emailReminders: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        <X className="inline h-3 w-3 mr-1" />Upgrade Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      WhatsApp Reminders
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Receive obligation reminders via WhatsApp
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(planType === 'pro' || planType === 'enterprise') && isActive ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.whatsappReminders}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, whatsappReminders: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        <X className="inline h-3 w-3 mr-1" />Pro Plan Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Deadline Alerts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get notified 7, 3, and 1 days before deadlines
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {planType !== 'free' && isActive ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.deadlineAlerts}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, deadlineAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        <X className="inline h-3 w-3 mr-1" />Upgrade Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={() => {
                  alert('Notification preferences saved!');
                }}>
                  Save Notification Settings
                </Button>
              </div>
            </div>
            
            {(planType === 'free' || !isActive) && (
              <div className="mt-6">
                <Button 
                  onClick={() => window.location.href = '/subscription'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade Plan to Enable Notifications
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Export Your Data
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download all your compliance data as a CSV file. This includes your business profile, 
                tax obligations, subscription details, and reminder history.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h4 className="font-medium text-blue-800 mb-2">What's included in your export:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Business profile information</li>
                  <li>• Tax obligations and deadlines</li>
                  <li>• Subscription and payment details</li>
                  <li>• Reminder history and logs</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleExportData} 
                disabled={exporting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
              >
                <Download className="h-4 w-4" />
                {exporting ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>Exporting...</>
                ) : (
                  'Download CSV File'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
