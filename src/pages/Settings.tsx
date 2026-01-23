import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { useProfile } from "@/hooks/useProfile";
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
    industry: ''
  });

  // Update form data when current company changes
  useEffect(() => {
    console.log('⚙️ SETTINGS DEBUG - Company changed:', {
      currentCompany: currentCompany?.name || 'none',
      companyId: currentCompany?.id || 'none',
      companyTin: currentCompany?.tin || 'none'
    });
    
    if (currentCompany && user) {
      setBusinessData({
        business_name: currentCompany.name || '',
        rc_number: '',
        tin: currentCompany.tin || '',
        industry: ''
      });
      
      // Load additional company data from database
      loadCompanyData();
    }
    
    if (profile && user) {
      setProfileData({
        full_name: profile.full_name || profile.business_name || '',
        email: user.email || '',
        phone: profile.phone || ''
      });
    }
  }, [currentCompany, profile, user]);

  const loadCompanyData = async () => {
    if (!currentCompany?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', currentCompany.id)
        .single();
      
      if (data && !error) {
        setBusinessData({
          business_name: data.company_name || '',
          rc_number: data.cac_number || '',
          tin: data.tin || '',
          industry: data.business_type || ''
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
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
        .from('user_profiles')
        .update({
          business_name: profileData.full_name, // Use business_name instead of full_name
          phone: profileData.phone
        })
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveBusiness = async () => {
    if (!user?.id || !currentCompany?.id) return;
    
    setSaving(true);
    try {
      // Update the specific company, not the primary one
      const { error } = await supabase
        .from('company_profiles')
        .update({
          company_name: businessData.business_name,
          cac_number: businessData.rc_number,
          tin: businessData.tin,
          business_type: businessData.industry
        })
        .eq('id', currentCompany.id);
      
      if (error) throw error;
      alert('Business details updated successfully!');
      
      // Reload company data instead of full page refresh
      await loadCompanyData();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update business details');
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
                    Industry
                  </label>
                  <select 
                    value={businessData.industry}
                    onChange={(e) => setBusinessData({...businessData, industry: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                <p className="text-sm text-blue-700">
                  <Calendar className="inline h-4 w-4 mr-1" /> Notification settings are controlled by your subscription plan.
                  {profile?.plan === 'free' && ' Upgrade to get email and WhatsApp reminders.'}
                  {profile?.plan !== 'free' && ' Your plan includes email reminders.'}
                </p>
              </div>
              
              <div className="flex items-center justify-between border-b border-border py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email Reminders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive obligation reminders via email
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  profile?.plan !== 'free' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile?.plan !== 'free' ? (
                    <><CheckCircle className="inline h-3 w-3 mr-1" />Enabled</>
                  ) : (
                    <><X className="inline h-3 w-3 mr-1" />Upgrade Required</>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-b border-border py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    WhatsApp Reminders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive obligation reminders via WhatsApp
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  profile?.plan === 'pro' || profile?.plan === 'annual'
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile?.plan === 'pro' || profile?.plan === 'annual' ? (
                    <><CheckCircle className="inline h-3 w-3 mr-1" />Enabled</>
                  ) : (
                    <><X className="inline h-3 w-3 mr-1" />Pro Plan Required</>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Deadline Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified 7, 3, and 1 days before deadlines
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  profile?.plan !== 'free' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile?.plan !== 'free' ? (
                    <><CheckCircle className="inline h-3 w-3 mr-1" />Enabled</>
                  ) : (
                    <><X className="inline h-3 w-3 mr-1" />Upgrade Required</>
                  )}
                </span>
              </div>
            </div>
            
            {profile?.plan === 'free' && (
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
