import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/lib/supabase';
import { whatsappService } from '@/lib/whatsappService';

export default function WhatsAppSettings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('whatsapp_api_key, phone')
      .eq('id', user.id)
      .single();

    if (data) {
      setApiKey(data.whatsapp_api_key || '');
      setTestPhone(data.phone || '');
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await supabase
        .from('user_profiles')
        .update({ whatsapp_api_key: apiKey })
        .eq('id', user.id);

      alert('WhatsApp settings saved!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone) {
      alert('Please enter phone number');
      return;
    }

    setTesting(true);
    try {
      const success = await whatsappService.sendMessage(
        testPhone,
        '🎉 Test message from TaxandCompliance T&C!\n\nYour WhatsApp integration is working correctly.'
      );

      if (success) {
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message. Check your API key.');
      }
    } catch (error) {
      alert('Error sending test message');
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Integration</h1>
          <p className="text-muted-foreground">Configure WhatsApp notifications using wawp.net</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">WhatsApp Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            WhatsApp integration is pre-configured and ready to use!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Phone Number
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="2348012345678"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Country code + number (e.g., 2348012345678 for Nigeria)
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={sendTestMessage} 
                disabled={testing}
              >
                {testing ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Automated tax reminders via WhatsApp</li>
            <li>✅ Invoice notifications to clients</li>
            <li>✅ Payment reminders</li>
            <li>✅ Deadline alerts</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
