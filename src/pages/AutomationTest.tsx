import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { reminderService } from '@/lib/reminderService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContextClean';

export default function AutomationTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createTestObligation = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setResult('Creating test obligation and adding phone number...');
    
    try {
      // First, add phone number to profile
      await supabase
        .from('profiles')
        .update({ phone: '+2347016190271' })
        .eq('id', user.id);
      
      // Create a test obligation due in 3 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      
      const { error } = await supabase
        .from('tax_obligations')
        .insert({
          user_id: user.id,
          obligation_type: 'VAT',
          frequency: 'monthly',
          next_due_date: dueDate.toISOString().split('T')[0],
          tax_period: '2024-12',
          is_active: true
        });

      if (error) throw error;
      
      setResult('✅ Phone number added and test obligation created! Now triggering automation...');
      
      // Trigger the automation
      await reminderService.checkAndScheduleReminders();
      
      setResult('✅ Automation triggered! Check your email AND WhatsApp for reminders.');
      
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Automated WhatsApp Test</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Test Automated Reminders</h2>
            <p className="mb-4">
              This will create a test tax obligation due in 3 days and trigger the same automation 
              that runs every hour. You should receive BOTH email and WhatsApp reminders.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Prerequisites:</h3>
              <ul className="text-yellow-700 space-y-1">
                <li>• Add your phone number in Settings</li>
                <li>• Join Twilio WhatsApp sandbox</li>
                <li>• Have Pro plan for WhatsApp reminders</li>
              </ul>
            </div>
            
            <Button 
              onClick={createTestObligation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Automated Email + WhatsApp'}
            </Button>
          </div>

          {result && (
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Result:</h3>
              <p className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How Automation Works:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Timer runs every hour automatically</li>
              <li>• Checks all users for upcoming deadlines</li>
              <li>• Sends email + WhatsApp at 7, 3, 1 days before</li>
              <li>• Same system as your current email automation</li>
              <li>• No manual triggers needed in production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}