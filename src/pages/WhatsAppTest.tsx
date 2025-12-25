import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { twilioWhatsAppService } from '@/lib/twilioWhatsAppService';

export default function WhatsAppTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWhatsApp = async () => {
    setLoading(true);
    setResult('Sending WhatsApp message...');
    
    try {
      const response = await twilioWhatsAppService.sendTaxReminder(
        '+2347016190271', // Your phone number
        'VAT',
        'March 21, 2024',
        3
      );
      
      if (response.success) {
        setResult('✅ WhatsApp message sent successfully! Check your phone.');
      } else {
        setResult(`❌ Failed to send: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testWelcome = async () => {
    setLoading(true);
    setResult('Sending welcome message...');
    
    try {
      const response = await twilioWhatsAppService.sendWelcomeMessage(
        '+2347016190271', // Your phone number
        'Test Business'
      );
      
      if (response.success) {
        setResult('✅ Welcome message sent successfully! Check your phone.');
      } else {
        setResult(`❌ Failed to send: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WhatsApp Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Step 1: Join Twilio Sandbox</h2>
            <p className="mb-4">
              Send this message to <strong>+1 415 523 8886</strong> from your WhatsApp:
            </p>
            <div className="bg-muted p-3 rounded font-mono">
              join clever-parrot-123
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              (Replace "clever-parrot-123" with your actual sandbox name from Twilio Console)
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Step 2: Test WhatsApp</h2>
            <div className="space-y-4">
              <Button 
                onClick={testWhatsApp} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Tax Reminder Test'}
              </Button>
              
              <Button 
                onClick={testWelcome} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Welcome Message Test'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Result:</h3>
              <p className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">What to Expect:</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• Message will come from "Twilio Sandbox"</li>
              <li>• Content will be your tax reminder</li>
              <li>• This proves the automation works!</li>
              <li>• Later we can upgrade to show your business name</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}