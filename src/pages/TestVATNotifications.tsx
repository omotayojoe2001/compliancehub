import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Mail, MessageSquare, Loader2 } from 'lucide-react';

export default function TestVATNotifications() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [customDay, setCustomDay] = useState(20);
  const [customTime, setCustomTime] = useState('21:00');
  const [countdown, setCountdown] = useState(0);
  const [testingStep, setTestingStep] = useState('');

  const testVATNotifications = async () => {
    setTesting(true);
    setResults(null);

    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const forceTestNotification = async () => {
    setTesting(true);
    setResults(null);

    try {
      // Force test by simulating it's 9 AM on the 21st
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ forceTest: true, testDay: 21, testTime: '09:00' })
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const testCustomTime = async () => {
    setTesting(true);
    setResults(null);
    setCountdown(10);
    setTestingStep('Preparing test...');

    // Countdown from 10 to 1
    for (let i = 10; i > 0; i--) {
      setCountdown(i);
      setTestingStep(`Testing in ${i} seconds...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTestingStep('🚀 Sending notifications...');
    setCountdown(0);

    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          forceTest: true, 
          testDay: customDay, 
          testTime: customTime 
        })
      });

      setTestingStep('📧 Processing emails...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestingStep('📱 Processing WhatsApp...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestingStep('✅ Complete!');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setTestingStep('❌ Error occurred');
      setResults({ error: error.message });
    } finally {
      setTesting(false);
      setTestingStep('');
    }
  };

  const testOverdueNotifications = async () => {
    setTesting(true);
    setResults(null);

    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/vat-overdue-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const getCurrentSchedule = () => {
    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();
    
    const schedule = [
      { day: 1, time: '09:00', type: 'email', subject: 'New Month - VAT Due 21st' },
      { day: 7, time: '09:00', type: 'both', subject: 'VAT Tips: Maximize Deductions' },
      { day: 10, time: '09:00', type: 'both', subject: 'VAT Record Keeping Guide' },
      { day: 14, time: '09:00', type: 'both', subject: 'VAT Due in 7 Days' },
      { day: 18, time: '09:00', type: 'both', subject: 'VAT Due in 3 Days - Morning' },
      { day: 18, time: '21:00', type: 'both', subject: 'VAT Due in 3 Days - Evening' },
      { day: 19, time: '09:00', type: 'both', subject: 'VAT Due in 2 Days - Morning' },
      { day: 19, time: '21:00', type: 'both', subject: 'VAT Due in 2 Days - Evening' },
      { day: 20, time: '09:00', type: 'both', subject: 'VAT Due TOMORROW - Morning' },
      { day: 20, time: '21:00', type: 'both', subject: 'VAT Due TOMORROW - Evening' },
      { day: 21, time: '09:00', type: 'both', subject: 'VAT DUE TODAY - Morning' },
      { day: 21, time: '18:00', type: 'both', subject: 'VAT DUE TODAY - 6 Hours Left' },
      { day: 21, time: '23:00', type: 'both', subject: 'VAT DUE - 1 HOUR LEFT!' }
    ];

    const currentTime = `${hour.toString().padStart(2, '0')}:00`;
    const todaysNotifications = schedule.filter(s => s.day === day);
    const currentNotification = schedule.find(s => s.day === day && s.time === currentTime);

    return { todaysNotifications, currentNotification, day, currentTime };
  };

  const scheduleInfo = getCurrentSchedule();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test VAT Notification System</h1>
          <p className="text-muted-foreground">Test the automated VAT notification functions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Schedule Info
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Today:</strong> {scheduleInfo.day}th of month</p>
              <p><strong>Current Time:</strong> {scheduleInfo.currentTime}</p>
              <p><strong>Today's Notifications:</strong> {scheduleInfo.todaysNotifications.length}</p>
              {scheduleInfo.currentNotification && (
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-green-700 font-medium">Active Now:</p>
                  <p className="text-green-600">{scheduleInfo.currentNotification.subject}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Custom Time Test
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Day of Month</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={customDay}
                    onChange={(e) => setCustomDay(parseInt(e.target.value))}
                    className="w-full border border-border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time (24h)</label>
                  <input 
                    type="time" 
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <Button 
                onClick={testCustomTime}
                disabled={testing}
                className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {testing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {countdown > 0 ? (
                      <span className="font-mono text-lg">{countdown}</span>
                    ) : (
                      <span>Processing...</span>
                    )}
                  </div>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Test Day {customDay} at {customTime}
                  </>
                )}
              </Button>
              
              {testing && testingStep && (
                <div className="text-center p-2 bg-blue-50 rounded text-blue-700 text-sm">
                  {testingStep}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Functions
            </h3>
            <div className="space-y-3">
              <Button 
                onClick={testVATNotifications}
                disabled={testing}
                className="w-full flex items-center gap-2"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Test VAT Notifications (Current Time)
              </Button>
              
              <Button 
                onClick={forceTestNotification}
                disabled={testing}
                className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Force Test (Simulate 21st 9AM)
              </Button>
              
              <Button 
                onClick={testOverdueNotifications}
                disabled={testing}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Test Overdue Notifications
              </Button>
            </div>
          </Card>
        </div>

        {results && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">VAT Notification Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Regular Schedule:</h4>
              <ul className="space-y-1">
                <li>1st - Welcome email (9 AM)</li>
                <li>7th - Educational content (9 AM)</li>
                <li>10th - Educational content (9 AM)</li>
                <li>14th - First reminder (9 AM)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Critical Days:</h4>
              <ul className="space-y-1">
                <li>18th - 2 notifications (9 AM, 9 PM)</li>
                <li>19th - 2 notifications (9 AM, 9 PM)</li>
                <li>20th - 2 notifications (9 AM, 9 PM)</li>
                <li>21st - 3 notifications (9 AM, 6 PM, 11 PM)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}