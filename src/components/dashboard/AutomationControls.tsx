import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { automationService } from '@/lib/automationService';
import { testAutomationService } from '@/lib/testAutomationService';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/lib/supabase';
import { Play, Pause, TestTube, Plus } from 'lucide-react';

export function AutomationControls() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(true);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const handleStart = () => {
    automationService.start();
    setIsRunning(true);
  };

  const handleStop = () => {
    automationService.stop();
    setIsRunning(false);
  };

  const handleStartTest = () => {
    testAutomationService.start();
    setIsTestRunning(true);
  };

  const handleStopTest = () => {
    testAutomationService.stop();
    setIsTestRunning(false);
  };

  const handleTriggerNow = async () => {
    setTriggering(true);
    try {
      await automationService.triggerNow();
      alert('Reminder check completed!');
    } catch (error) {
      alert('Reminder check failed: ' + error);
    }
    setTriggering(false);
  };

  const handleCreateTestObligation = async () => {
    if (!user?.id) return;
    
    setTriggering(true);
    try {
      // Create a test obligation due in 7 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days from now
      
      const { error } = await supabase
        .from('tax_obligations')
        .insert({
          user_id: user.id,
          obligation_type: 'VAT',
          frequency: 'monthly',
          next_due_date: dueDate.toISOString().split('T')[0],
          tax_period: '2025-01',
          is_active: true
        });
        
      if (error) throw error;
      
      alert('✅ Test VAT obligation created (due in 7 days)! Now run the test automation.');
    } catch (error) {
      alert('❌ Failed to create test obligation: ' + error);
    }
    setTriggering(false);
  };

  return (
    <div className="space-y-4">
      {/* Production Automation */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">🤖 Production Automation</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              Production reminders: {isRunning ? 'RUNNING (every hour)' : 'STOPPED'}
            </span>
          </div>
          
          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Production
              </Button>
            ) : (
              <Button onClick={handleStop} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Stop Production
              </Button>
            )}
            
            <Button 
              onClick={handleTriggerNow} 
              disabled={triggering}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {triggering ? 'Checking...' : 'Check Now'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Test Automation */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <h2 className="text-lg font-semibold mb-4 text-orange-800">🧪 TEST Automation (Every 3 Minutes)</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isTestRunning ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-orange-700">
              TEST reminders: {isTestRunning ? 'RUNNING (every 3 minutes)' : 'STOPPED'}
            </span>
          </div>
          
          <div className="flex gap-3">
            {!isTestRunning ? (
              <Button onClick={handleStartTest} className="bg-orange-600 hover:bg-orange-700">
                <TestTube className="h-4 w-4 mr-2" />
                Start 3-Minute Test
              </Button>
            ) : (
              <Button onClick={handleStopTest} variant="outline" className="border-orange-300">
                <Pause className="h-4 w-4 mr-2" />
                Stop Test
              </Button>
            )}
            
            <Button 
              onClick={handleCreateTestObligation} 
              disabled={triggering}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {triggering ? 'Creating...' : 'Create Test Obligation'}
            </Button>
          </div>
          
          <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded">
            <p><strong>HOW TO TEST EMAIL SENDING:</strong></p>
            <p>1. Click "Create Test Obligation" (creates VAT due in 7 days)</p>
            <p>2. Click "Start 3-Minute Test" (begins checking every 3 minutes)</p>
            <p>3. Wait 3 minutes - you'll get an email reminder!</p>
            <p>4. Click "Stop Test" when done</p>
          </div>
        </div>
      </Card>
    </div>
  );
}