import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestEmailDirect() {
  const [email, setEmail] = useState('omotayojoshua10@gmail.com');
  const [loading, setLoading] = useState(false);

  const testEmailDirect = async () => {
    setLoading(true);
    console.log('🧪 Testing email directly via HTTP to:', email);
    
    try {
      const response = await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8'
        },
        body: JSON.stringify({
          to: email,
          subject: 'Direct HTTP Test Email',
          html: '<h1>Test Email</h1><p>If you receive this, the email service works via direct HTTP!</p>'
        })
      });

      const result = await response.text();
      console.log('📧 Direct HTTP response status:', response.status);
      console.log('📧 Direct HTTP response body:', result);
      
      alert(`Direct HTTP Email - Status: ${response.status}, Body: ${result}`);
    } catch (error) {
      console.error('❌ Direct HTTP email error:', error);
      alert(`Direct HTTP Email error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Test Email Direct HTTP</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
            <Button 
              onClick={testEmailDirect} 
              disabled={loading}
              className="mt-2 w-full"
            >
              Test Email Direct HTTP
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}