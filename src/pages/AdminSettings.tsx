import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Mail, MessageSquare, CreditCard, Bell, 
  Shield, Database, Save, RefreshCw, DollarSign
} from 'lucide-react';

interface SystemSettings {
  emailSettings: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  whatsappSettings: {
    apiKey: string;
    phoneNumber: string;
    webhookUrl: string;
    enabled: boolean;
  };
  paymentSettings: {
    paystackPublicKey: string;
    paystackSecretKey: string;
    webhookSecret: string;
    testMode: boolean;
  };
  pricingSettings: {
    plans: {
      free: { name: string; monthlyPrice: number; annualPrice: number; };
      basic: { name: string; monthlyPrice: number; annualPrice: number; };
      pro: { name: string; monthlyPrice: number; annualPrice: number; };
      enterprise: { name: string; monthlyPrice: number; annualPrice: number; };
    };
    filingCharges: {
      vat: number;
      paye: number;
      cit: number;
      wht: number;
    };
  };
  notificationSettings: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    reminderFrequency: string;
    overdueNotifications: boolean;
  };
  securitySettings: {
    sessionTimeout: string;
    passwordMinLength: string;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  systemSettings: {
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: string;
    backupFrequency: string;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    emailSettings: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@compliancehub.ng',
      fromName: 'ComplianceHub'
    },
    whatsappSettings: {
      apiKey: '',
      phoneNumber: '',
      webhookUrl: '',
      enabled: false
    },
    paymentSettings: {
      paystackPublicKey: '',
      paystackSecretKey: '',
      webhookSecret: '',
      testMode: true
    },
    pricingSettings: {
      plans: {
        free: { name: 'Free', monthlyPrice: 0, annualPrice: 0 },
        basic: { name: 'Basic', monthlyPrice: 1250, annualPrice: 15000 },
        pro: { name: 'Pro', monthlyPrice: 4167, annualPrice: 50000 },
        enterprise: { name: 'Enterprise', monthlyPrice: 12500, annualPrice: 150000 }
      },
      filingCharges: {
        vat: 2500,
        paye: 3000,
        cit: 5000,
        wht: 2000
      }
    },
    notificationSettings: {
      emailNotifications: true,
      whatsappNotifications: false,
      reminderFrequency: 'daily',
      overdueNotifications: true
    },
    securitySettings: {
      sessionTimeout: '24',
      passwordMinLength: '8',
      requireEmailVerification: true,
      enableTwoFactor: false
    },
    systemSettings: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to database or config service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    setLoading(false);
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (section: keyof SystemSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and integrations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) => updateSetting('emailSettings', 'smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) => updateSetting('emailSettings', 'smtpPort', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.emailSettings.smtpUser}
                    onChange={(e) => updateSetting('emailSettings', 'smtpUser', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.emailSettings.smtpPassword}
                    onChange={(e) => updateSetting('emailSettings', 'smtpPassword', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => updateSetting('emailSettings', 'fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.emailSettings.fromName}
                    onChange={(e) => updateSetting('emailSettings', 'fromName', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline">Test Email Configuration</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsappEnabled"
                    checked={settings.whatsappSettings.enabled}
                    onCheckedChange={(checked) => updateSetting('whatsappSettings', 'enabled', checked)}
                  />
                  <Label htmlFor="whatsappEnabled">Enable WhatsApp Integration</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.whatsappSettings.apiKey}
                      onChange={(e) => updateSetting('whatsappSettings', 'apiKey', e.target.value)}
                      disabled={!settings.whatsappSettings.enabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={settings.whatsappSettings.phoneNumber}
                      onChange={(e) => updateSetting('whatsappSettings', 'phoneNumber', e.target.value)}
                      disabled={!settings.whatsappSettings.enabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={settings.whatsappSettings.webhookUrl}
                      onChange={(e) => updateSetting('whatsappSettings', 'webhookUrl', e.target.value)}
                      disabled={!settings.whatsappSettings.enabled}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" disabled={!settings.whatsappSettings.enabled}>
                    Test WhatsApp Connection
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="testMode"
                    checked={settings.paymentSettings.testMode}
                    onCheckedChange={(checked) => updateSetting('paymentSettings', 'testMode', checked)}
                  />
                  <Label htmlFor="testMode">Test Mode</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="paystackPublicKey">Paystack Public Key</Label>
                    <Input
                      id="paystackPublicKey"
                      value={settings.paymentSettings.paystackPublicKey}
                      onChange={(e) => updateSetting('paymentSettings', 'paystackPublicKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paystackSecretKey">Paystack Secret Key</Label>
                    <Input
                      id="paystackSecretKey"
                      type="password"
                      value={settings.paymentSettings.paystackSecretKey}
                      onChange={(e) => updateSetting('paymentSettings', 'paystackSecretKey', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      value={settings.paymentSettings.webhookSecret}
                      onChange={(e) => updateSetting('paymentSettings', 'webhookSecret', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline">Test Payment Gateway</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Subscription Plans & Pricing
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Subscription Plans</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="freeAnnual">Free Plan (Annual)</Label>
                      <Input
                        id="freeAnnual"
                        type="number"
                        value={settings.pricingSettings.plans.free.annualPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.free.annualPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeMonthly">Free Plan (Monthly)</Label>
                      <Input
                        id="freeMonthly"
                        type="number"
                        value={settings.pricingSettings.plans.free.monthlyPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.free.monthlyPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicAnnual">Basic Plan (Annual) - ₦</Label>
                      <Input
                        id="basicAnnual"
                        type="number"
                        value={settings.pricingSettings.plans.basic.annualPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.basic.annualPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicMonthly">Basic Plan (Monthly) - ₦</Label>
                      <Input
                        id="basicMonthly"
                        type="number"
                        value={settings.pricingSettings.plans.basic.monthlyPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.basic.monthlyPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proAnnual">Pro Plan (Annual) - ₦</Label>
                      <Input
                        id="proAnnual"
                        type="number"
                        value={settings.pricingSettings.plans.pro.annualPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.pro.annualPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proMonthly">Pro Plan (Monthly) - ₦</Label>
                      <Input
                        id="proMonthly"
                        type="number"
                        value={settings.pricingSettings.plans.pro.monthlyPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.pro.monthlyPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="enterpriseAnnual">Enterprise Plan (Annual) - ₦</Label>
                      <Input
                        id="enterpriseAnnual"
                        type="number"
                        value={settings.pricingSettings.plans.enterprise.annualPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.enterprise.annualPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="enterpriseMonthly">Enterprise Plan (Monthly) - ₦</Label>
                      <Input
                        id="enterpriseMonthly"
                        type="number"
                        value={settings.pricingSettings.plans.enterprise.monthlyPrice}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.plans.enterprise.monthlyPrice = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-4">Filing Service Charges</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="vatCharge">VAT Filing - ₦</Label>
                      <Input
                        id="vatCharge"
                        type="number"
                        value={settings.pricingSettings.filingCharges.vat}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.filingCharges.vat = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payeCharge">PAYE Filing - ₦</Label>
                      <Input
                        id="payeCharge"
                        type="number"
                        value={settings.pricingSettings.filingCharges.paye}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.filingCharges.paye = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="citCharge">CIT Filing - ₦</Label>
                      <Input
                        id="citCharge"
                        type="number"
                        value={settings.pricingSettings.filingCharges.cit}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.filingCharges.cit = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whtCharge">WHT Filing - ₦</Label>
                      <Input
                        id="whtCharge"
                        type="number"
                        value={settings.pricingSettings.filingCharges.wht}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          newSettings.pricingSettings.filingCharges.wht = parseInt(e.target.value);
                          setSettings(newSettings);
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Current Frontend Pricing:</strong><br/>
                    • Free: ₦0/year<br/>
                    • Basic: ₦15,000/year (₦1,250/month)<br/>
                    • Pro: ₦50,000/year (₦4,167/month)<br/>
                    • Enterprise: ₦150,000/year (₦12,500/month)
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notificationSettings', 'emailNotifications', checked)}
                  />
                  <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsappNotifications"
                    checked={settings.notificationSettings.whatsappNotifications}
                    onCheckedChange={(checked) => updateSetting('notificationSettings', 'whatsappNotifications', checked)}
                  />
                  <Label htmlFor="whatsappNotifications">Enable WhatsApp Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="overdueNotifications"
                    checked={settings.notificationSettings.overdueNotifications}
                    onCheckedChange={(checked) => updateSetting('notificationSettings', 'overdueNotifications', checked)}
                  />
                  <Label htmlFor="overdueNotifications">Enable Overdue Notifications</Label>
                </div>
                <div>
                  <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                  <Select 
                    value={settings.notificationSettings.reminderFrequency}
                    onValueChange={(value) => updateSetting('notificationSettings', 'reminderFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.securitySettings.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('securitySettings', 'requireEmailVerification', checked)}
                  />
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('securitySettings', 'enableTwoFactor', checked)}
                  />
                  <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      value={settings.securitySettings.sessionTimeout}
                      onChange={(e) => updateSetting('securitySettings', 'sessionTimeout', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      value={settings.securitySettings.passwordMinLength}
                      onChange={(e) => updateSetting('securitySettings', 'passwordMinLength', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={settings.systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('systemSettings', 'maintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="debugMode"
                    checked={settings.systemSettings.debugMode}
                    onCheckedChange={(checked) => updateSetting('systemSettings', 'debugMode', checked)}
                  />
                  <Label htmlFor="debugMode">Debug Mode</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select 
                      value={settings.systemSettings.logLevel}
                      onValueChange={(value) => updateSetting('systemSettings', 'logLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select 
                      value={settings.systemSettings.backupFrequency}
                      onValueChange={(value) => updateSetting('systemSettings', 'backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}