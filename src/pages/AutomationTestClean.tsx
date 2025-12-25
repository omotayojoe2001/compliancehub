import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { twilioWhatsAppService } from '@/lib/twilioWhatsAppService';
import { useAuth } from '@/contexts/AuthContextClean';

export default function AutomationTestClean() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const testAutomation = async () => {
    setLoading(true);
    setResult('Testing WhatsApp automation...');
    
    try {
      // Test WhatsApp tax reminder
      await twilioWhatsAppService.sendTaxReminder(
        '+2347016190271',
        'VAT',
        '2024-12',
        '2025-01-21',
        3
      );
      
      setResult('✅ WhatsApp automation test sent! Check your WhatsApp for the reminder message.');
      
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Automated WhatsApp Test (Clean)</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Test WhatsApp Automation</h2>
            <p className="mb-4">
              This will send a test WhatsApp reminder directly using the Twilio service.
              No database dependencies - just pure WhatsApp testing.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Test Details:</h3>
              <ul className="text-yellow-700 space-y-1">
                <li>• Sends to: +2347016190271</li>
                <li>• Tax Type: VAT</li>
                <li>• Period: December 2024</li>
                <li>• Due Date: January 21, 2025</li>
                <li>• Days Until Due: 3</li>
              </ul>
            </div>
            
            <Button 
              onClick={testAutomation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Test WhatsApp Reminder'}
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
            <h3 className="font-semibold text-blue-800 mb-2">Clean Architecture Benefits:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• No database dependencies</li>
              <li>• Direct Twilio WhatsApp integration</li>
              <li>• Immediate testing without schema issues</li>
              <li>• Same WhatsApp service used in production</li>
              <li>• Works even when database is down</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}