import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveAutomationService } from '@/lib/comprehensiveAutomationService';
import { notificationServiceFixed } from '@/lib/notificationServiceFixed';

export default function MasterAutomationTest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('omotayojoshua10@gmail.com');
  const [testPhone, setTestPhone] = useState('07049163283');
  const [testBusinessName, setTestBusinessName] = useState('Test Business');

  const startAllAutomation = () => {
    comprehensiveAutomationService.start();
    alert('🤖 All automation services started!\n\n✅ Tax deadline reminders (hourly)\n✅ Subscription reminders (6-hourly)\n✅ Email & WhatsApp notifications');
  };

  const stopAllAutomation = () => {
    comprehensiveAutomationService.stop();
    alert('🛑 All automation services stopped');
  };

  const testUserDeadlines = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await comprehensiveAutomationService.triggerUserDeadlineCheck(user.id);
      alert('✅ User deadline check completed! Check console and your email/WhatsApp.');
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testOnboardingSequence = async () => {
    setLoading(true);
    try {
      await comprehensiveAutomationService.triggerTestOnboarding(testEmail, testBusinessName, testPhone);
      alert('✅ Onboarding sequence triggered! You should receive:\n\n1. Welcome email/WhatsApp (immediate)\n2. Follow-up (5 seconds)\n3. Educational (10 seconds)');
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testWelcomeOnly = async () => {
    setLoading(true);
    try {
      await notificationServiceFixed.sendWelcomeNotifications(testEmail, testBusinessName, testPhone);
      alert('✅ Welcome notification sent!');
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testTaxReminder = async () => {
    setLoading(true);
    try {
      await notificationServiceFixed.sendTaxDeadlineReminder(
        testEmail,
        testBusinessName,
        testPhone,
        'VAT',
        3,
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      );
      alert('✅ Tax deadline reminder sent! (3 days warning)');
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testSubscriptionReminder = async () => {
    setLoading(true);
    try {
      await notificationServiceFixed.sendSubscriptionExpiryReminder(
        testEmail,
        testBusinessName,
        testPhone,
        'Pro',
        7
      );
      alert('✅ Subscription expiry reminder sent! (7 days warning)');
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const getAutomationStatus = () => {
    const status = comprehensiveAutomationService.getStatus();
    alert(`🤖 Automation Status:\n\nRunning: ${status.isRunning ? '✅' : '❌'}\nTax Reminders: ${status.taxRemindersActive ? '✅' : '❌'}\nSubscription Reminders: ${status.subscriptionRemindersActive ? '✅' : '❌'}\n\nServices:\n${status.services.join('\n')}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Master Automation Test</h1>
          <p className="text-muted-foreground">Test all automation services and notifications</p>
        </div>

        {/* Test Settings */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Test Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email</label>
              <Input 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Test Phone</label>
              <Input 
                value={testPhone} 
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="07049163283"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <Input 
                value={testBusinessName} 
                onChange={(e) => setTestBusinessName(e.target.value)}
                placeholder="Test Business"
              />
            </div>
          </div>
        </div>

        {/* Automation Controls */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Automation Controls</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={startAllAutomation} className="w-full">
              🤖 Start All Automation
            </Button>
            <Button onClick={stopAllAutomation} variant="outline" className="w-full">
              🛑 Stop All Automation
            </Button>
            <Button onClick={getAutomationStatus} variant="outline" className="w-full sm:col-span-2">
              📊 Check Status
            </Button>
          </div>
        </div>

        {/* Individual Tests */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Individual Tests</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button 
              onClick={testUserDeadlines} 
              disabled={loading || !user?.id}
              className="w-full"
            >
              📅 Test User Deadlines
            </Button>
            <Button 
              onClick={testOnboardingSequence} 
              disabled={loading}
              className="w-full"
            >
              🎉 Test Onboarding Sequence
            </Button>
            <Button 
              onClick={testWelcomeOnly} 
              disabled={loading}
              className="w-full"
            >
              👋 Test Welcome Only
            </Button>
            <Button 
              onClick={testTaxReminder} 
              disabled={loading}
              className="w-full"
            >
              🚨 Test Tax Reminder
            </Button>
            <Button 
              onClick={testSubscriptionReminder} 
              disabled={loading}
              className="w-full sm:col-span-2"
            >
              💳 Test Subscription Reminder
            </Button>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Automation Services:</h4>
          <ul className="text-sm space-y-1">
            <li>📧 Email notifications (Direct HTTP - Working)</li>
            <li>📱 WhatsApp notifications (Twilio - Working for verified numbers)</li>
            <li>📅 Tax deadline reminders (7, 3, 1 days before)</li>
            <li>💳 Subscription expiry reminders (7, 3, 1 days before)</li>
            <li>🎉 User onboarding sequence (Welcome → Follow-up → Educational)</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}