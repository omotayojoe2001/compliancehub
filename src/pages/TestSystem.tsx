import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { reminderService } from '@/lib/reminderService';
import { emailService } from '@/lib/emailService';
import { paymentService } from '@/lib/paymentService';
import { paymentVerificationService } from '@/lib/paymentVerificationService';
import { automatedReminderScheduler } from '@/lib/automatedReminderScheduler';
import { supabase } from '@/lib/supabase';

export default function TestSystem() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testReminders = async () => {
    setLoading(true);
    addResult('🔔 Testing reminder system...');
    
    try {
      // Check if obligations exist
      const { data: obligations, error } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) {
        addResult(`❌ Error fetching obligations: ${error.message}`);
      } else {
        addResult(`✅ Found ${obligations?.length || 0} tax obligations`);
        obligations?.forEach(ob => {
          addResult(`   - ${ob.obligation_type}: Due ${ob.next_due_date}`);
        });
      }
      
      // Test reminder scheduling
      await reminderService.checkAndScheduleReminders();
      addResult('✅ Reminder check completed');
      
    } catch (error) {
      addResult(`❌ Reminder test failed: ${error}`);
    }
    setLoading(false);
  };

  const testEmail = async () => {
    setLoading(true);
    addResult('📧 Testing email system...');
    addResult(`📧 Sending welcome email to: ${user?.email}`);
    
    try {
      const result = await emailService.sendWelcomeEmail({
        to: user?.email || '',
        businessName: profile?.business_name || 'Test Business'
      });
      
      if (result.success) {
        addResult('✅ Welcome email sent successfully');
        addResult('📧 Check your email inbox!');
      } else {
        addResult(`❌ Email failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Email test failed: ${error}`);
    }
    setLoading(false);
  };

  const testFollowUpEmail = async () => {
    setLoading(true);
    addResult('📧 Testing follow-up email...');
    
    try {
      const result = await emailService.sendFollowUpEmail({
        to: user?.email || '',
        businessName: profile?.business_name || 'Test Business'
      });
      
      if (result.success) {
        addResult('✅ Follow-up email sent!');
      } else {
        addResult(`❌ Email failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Email test failed: ${error}`);
    }
    setLoading(false);
  };

  const testEducationalEmail = async () => {
    setLoading(true);
    addResult('📧 Testing educational email...');
    
    try {
      const result = await emailService.sendEducationalEmail({
        to: user?.email || '',
        businessName: profile?.business_name || 'Test Business'
      });
      
      if (result.success) {
        addResult('✅ Educational email sent!');
      } else {
        addResult(`❌ Email failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Email test failed: ${error}`);
    }
    setLoading(false);
  };

  const testReminderEmail = async () => {
    setLoading(true);
    addResult('📧 Testing reminder email...');
    
    try {
      const result = await emailService.sendReminderEmail({
        to: user?.email || '',
        businessName: profile?.business_name || 'Test Business',
        obligationType: 'VAT',
        daysUntilDue: 3,
        dueDate: '2025-12-31'
      });
      
      if (result.success) {
        addResult('✅ Reminder email sent!');
      } else {
        addResult(`❌ Email failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Email test failed: ${error}`);
    }
    setLoading(false);
  };

  const triggerAutomatedReminders = async () => {
    setLoading(true);
    addResult('🤖 Triggering automated reminder system...');
    
    try {
      await automatedReminderScheduler.triggerManualCheck();
      addResult('✅ Automated reminder check completed');
      addResult('📧 All eligible users should have received reminders');
    } catch (error) {
      addResult(`❌ Automated reminder failed: ${error}`);
    }
    setLoading(false);
  };

  const verifyPayment = async () => {
    setLoading(true);
    addResult('🔍 Checking payment status...');
    
    try {
      if (!user?.email) {
        addResult('❌ User email not found');
        return;
      }
      
      const status = await paymentVerificationService.checkUserPaymentStatus(user.email);
      
      if (status) {
        addResult(`✅ Profile found: ${status.profile?.business_name}`);
        addResult(`📊 Current plan: ${status.profile?.plan || 'none'}`);
        addResult(`💳 Subscription status: ${status.profile?.subscription_status || 'none'}`);
        
        if (status.subscription) {
          addResult(`💰 Amount paid: ₦${status.subscription.amount / 100}`);
          addResult(`📅 Next payment: ${status.subscription.next_payment_date}`);
          addResult(`🔗 Reference: ${status.subscription.paystack_subscription_code}`);
        } else {
          addResult('❌ No subscription record found');
        }
        
        if (status.hasActiveSubscription) {
          addResult('✅ User has active subscription');
        } else {
          addResult('❌ No active subscription');
        }
      } else {
        addResult('❌ Could not check payment status');
      }
    } catch (error) {
      addResult(`❌ Payment verification failed: ${error}`);
    }
    setLoading(false);
  };

  const testDatabase = async () => {
    setLoading(true);
    addResult('🗄️ Testing database connections...');
    
    try {
      // Test profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (profileError) {
        addResult(`❌ Profile error: ${profileError.message}`);
      } else {
        addResult('✅ Profile table working');
      }
      
      // Test tax_obligations table
      const { data: obligationsData, error: obligationsError } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
        
      if (obligationsError) {
        addResult(`❌ Tax obligations table error: ${obligationsError.message}`);
        if (obligationsError.message.includes('does not exist')) {
          addResult('   💡 Run the SQL schema first!');
        }
      } else {
        addResult('✅ Tax obligations table working');
      }
      
      // Test reminder_logs table
      const { data: logsData, error: logsError } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
        
      if (logsError) {
        addResult(`❌ Reminder logs table error: ${logsError.message}`);
        if (logsError.message.includes('does not exist')) {
          addResult('   💡 Run the SQL schema first!');
        }
      } else {
        addResult('✅ Reminder logs table working');
      }
      
      // Test subscriptions table
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
        
      if (subsError) {
        addResult(`❌ Subscriptions table error: ${subsError.message}`);
        if (subsError.message.includes('does not exist')) {
          addResult('   💡 Run the SQL schema first!');
        }
      } else {
        addResult('✅ Subscriptions table working');
      }
      
    } catch (error) {
      addResult(`❌ Database test failed: ${error}`);
    }
    setLoading(false);
  };

  const createTestObligation = async () => {
    setLoading(true);
    addResult('📅 Creating test tax obligation...');
    
    try {
      const { error } = await supabase
        .from('tax_obligations')
        .insert({
          user_id: user?.id,
          obligation_type: 'VAT',
          frequency: 'monthly',
          next_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          is_active: true
        });
        
      if (error) {
        addResult(`❌ Failed to create obligation: ${error.message}`);
      } else {
        addResult('✅ Test VAT obligation created (due in 7 days)');
      }
    } catch (error) {
      addResult(`❌ Create obligation failed: ${error}`);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">System Test</h1>
          <p className="text-sm text-muted-foreground">
            Test all systems to verify they're working
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Database Tables</h3>
            <Button onClick={testDatabase} disabled={loading} className="w-full">
              Test Database
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Reminder System</h3>
            <div className="space-y-2">
              <Button onClick={createTestObligation} disabled={loading} className="w-full" size="sm">
                Create Test Obligation
              </Button>
              <Button onClick={testReminders} disabled={loading} className="w-full" size="sm">
                Test Reminders
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Email System</h3>
            <div className="space-y-2">
              <Button onClick={testEmail} disabled={loading} className="w-full" size="sm">
                Welcome Email
              </Button>
              <Button onClick={testFollowUpEmail} disabled={loading} className="w-full" size="sm">
                Follow-up Email
              </Button>
              <Button onClick={testEducationalEmail} disabled={loading} className="w-full" size="sm">
                Educational Email
              </Button>
              <Button onClick={testReminderEmail} disabled={loading} className="w-full" size="sm">
                Reminder Email
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Automated Reminders</h3>
            <Button onClick={triggerAutomatedReminders} disabled={loading} className="w-full">
              Trigger All Reminders
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Payment System</h3>
            <Button onClick={verifyPayment} disabled={loading} className="w-full">
              Check Payment Status
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Clear Results</h3>
            <Button onClick={clearResults} variant="outline" className="w-full">
              Clear Log
            </Button>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Test Results</h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-gray-500">Click buttons above to test systems...</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}