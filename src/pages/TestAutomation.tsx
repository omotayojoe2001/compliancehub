import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextClean';
import { simpleAutomationService } from '@/lib/simpleAutomationService';

export default function TestAutomation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const testDeadlineCheck = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    console.log('🧪 Testing deadline check for user:', user.id);
    
    try {
      await simpleAutomationService.checkUserDeadlines(user.id);
      alert('Deadline check completed! Check console for details.');
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert(`Test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const startAutomation = () => {
    simpleAutomationService.start();
    alert('Automation service started! It will check deadlines every hour.');
  };

  const stopAutomation = () => {
    simpleAutomationService.stop();
    alert('Automation service stopped.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Test Automation</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={testDeadlineCheck} 
            disabled={loading || !user?.id}
            className="w-full"
          >
            {loading ? 'Checking...' : 'Test Deadline Check'}
          </Button>
          
          <Button 
            onClick={startAutomation}
            className="w-full"
            variant="outline"
          >
            Start Automation Service
          </Button>
          
          <Button 
            onClick={stopAutomation}
            className="w-full"
            variant="outline"
          >
            Stop Automation Service
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>• Test deadline check will check your current obligations</p>
          <p>• Automation service runs checks every hour</p>
          <p>• Reminders sent at 7, 3, and 1 days before due dates</p>
        </div>
      </div>
    </DashboardLayout>
  );
}