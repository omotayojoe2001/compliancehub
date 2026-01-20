import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';

export default function TestNotifications() {
  const { user } = useAuth();
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailResult, setEmailResult] = useState<string>('');
  const [whatsappResult, setWhatsappResult] = useState<string>('');
  const [testPhone, setTestPhone] = useState<string>('');

  const testEmail = async () => {
    if (!user?.email) return;
    
    setEmailStatus('loading');
    setEmailResult('');
    
    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Test Email from ComplianceHub',
          html: `
            <h2>Test Email</h2>
            <p>This is a test email to verify that email notifications are working correctly.</p>
            <p>If you received this, email notifications are working! ✅</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          `
        })
      });

      const result = await response.text();
      
      if (response.ok) {
        setEmailStatus('success');
        setEmailResult('Email sent successfully!');
      } else {
        setEmailStatus('error');
        setEmailResult(`Error: ${result}`);
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testWhatsApp = async () => {
    // Use manual test phone or profile phone
    const phone = testPhone || user?.user_metadata?.phone || user?.phone || user?.user_metadata?.phoneNumber;
    
    if (!phone) {
      setWhatsappStatus('error');
      setWhatsappResult('No phone number provided. Enter a phone number below or add one in Settings.');
      return;
    }
    
    setWhatsappStatus('loading');
    setWhatsappResult('');
    
    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: phone,
          message: `🧪 TEST MESSAGE from ComplianceHub\n\nThis is a test WhatsApp message to verify notifications are working.\n\nIf you received this, WhatsApp notifications are working! ✅\n\nTime: ${new Date().toLocaleString()}`
        })
      });

      const result = await response.text();
      
      if (response.ok) {
        setWhatsappStatus('success');
        setWhatsappResult(`WhatsApp message sent successfully to ${phone}!`);
      } else {
        setWhatsappStatus('error');
        setWhatsappResult(`Error: ${result}`);
      }
    } catch (error) {
      setWhatsappStatus('error');
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setWhatsappResult('WhatsApp Edge Function not deployed yet. The notification system needs to be set up in Supabase.');
      } else {
        setWhatsappResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test Notifications</h1>
          <p className="text-muted-foreground">Test email and WhatsApp notifications to verify they're working</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Test */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email Test</h3>
                <p className="text-sm text-muted-foreground">Send test email to: {user?.email}</p>
              </div>
            </div>
            
            <Button 
              onClick={testEmail} 
              disabled={emailStatus === 'loading' || !user?.email}
              className="w-full mb-4"
            >
              {emailStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            
            {emailResult && (
              <div className={`flex items-start gap-2 p-3 rounded text-sm ${
                emailStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {getStatusIcon(emailStatus)}
                <span>{emailResult}</span>
              </div>
            )}
          </Card>

          {/* WhatsApp Test */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp Test</h3>
                <p className="text-sm text-muted-foreground">
                  Profile phone: {user?.user_metadata?.phone || user?.phone || user?.user_metadata?.phoneNumber || 'None'}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <Input
                type="tel"
                placeholder="+2348012345678 (test phone number)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter phone number in international format to test
              </p>
            </div>
            
            <Button 
              onClick={testWhatsApp} 
              disabled={whatsappStatus === 'loading'}
              className="w-full mb-4"
            >
              {whatsappStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Test WhatsApp
                </>
              )}
            </Button>
            
            {whatsappResult && (
              <div className={`flex items-start gap-2 p-3 rounded text-sm ${
                whatsappStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {getStatusIcon(whatsappStatus)}
                <span>{whatsappResult}</span>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Email:</strong> Check your inbox (and spam folder) for the test email.</p>
            <p><strong>WhatsApp:</strong> Currently requires Supabase Edge Functions to be deployed. The error shows the notification system needs setup.</p>
            <p><strong>Success:</strong> Green checkmark means the API call succeeded.</p>
            <p><strong>Error:</strong> Red X shows what went wrong - check your API keys and configuration.</p>
            <p><strong>Note:</strong> For production, you'll need to deploy the WhatsApp Edge Function to Supabase.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}