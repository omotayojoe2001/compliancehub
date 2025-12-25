import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { twilioWhatsAppService } from '@/lib/twilioWhatsAppService';
import { supabase } from '@/lib/supabase';

export default function TestNotifications() {
  const [phone, setPhone] = useState('07049163283');
  const [email, setEmail] = useState('omotayojoshua10@gmail.com');
  const [loading, setLoading] = useState(false);

  const testWhatsApp = async () => {
    setLoading(true);
    console.log('🧪 Testing WhatsApp with phone:', phone);
    
    try {
      const result = await twilioWhatsAppService.sendMessage(
        phone,
        'Test message from ComplianceHub - if you receive this, WhatsApp is working!'
      );
      console.log('📱 WhatsApp test result:', result);
      alert(`WhatsApp result: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('❌ WhatsApp test error:', error);
      alert(`WhatsApp error: ${error.message}`);
    }
    setLoading(false);
  };

  const testEmail = async () => {
    setLoading(true);
    console.log('🧪 Testing email to:', email);
    
    try {
      const result = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
        },
        body: JSON.stringify({
          to: email,
          subject: 'Test Email from ComplianceHub',
          html: 'If you receive this email, the email service is working!'
        })
      });
      
      const emailResult = await result.json();
      console.log('📧 Email test result:', emailResult);
      alert(`Email result: ${JSON.stringify(emailResult)}`);
    } catch (error) {
      console.error('❌ Email test error:', error);
      alert(`Email error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Test Notifications</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07049163283"
            />
            <Button 
              onClick={testWhatsApp} 
              disabled={loading}
              className="mt-2 w-full"
            >
              Test WhatsApp
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
            <Button 
              onClick={testEmail} 
              disabled={loading}
              className="mt-2 w-full"
            >
              Test Email
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}