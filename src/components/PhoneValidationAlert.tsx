import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabase } from '@/lib/supabase';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PhoneValidationAlert() {
  const { user } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [phone, setPhone] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkPhoneFormat();
  }, [user]);

  const checkPhoneFormat = async () => {
    if (!user) return;

    // Check if user dismissed alert in this session
    const dismissedKey = `phone-alert-dismissed-${user.id}`;
    if (sessionStorage.getItem(dismissedKey)) {
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();

    if (profile?.phone) {
      const phoneStr = profile.phone.toString();
      // Check if phone is NOT in correct format (234...)
      const isCorrectFormat = /^234[0-9]{10}$/.test(phoneStr);
      
      if (!isCorrectFormat) {
        setPhone(phoneStr);
        setShowAlert(true);
      }
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
    setDismissed(true);
    // Remember dismissal for this session
    if (user) {
      sessionStorage.setItem(`phone-alert-dismissed-${user.id}`, 'true');
    }
  };

  const handleGoToSettings = () => {
    window.location.href = '/settings';
  };

  if (!showAlert || dismissed) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              ⚠️ Phone Number Format Issue
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              Your phone number <span className="font-mono font-bold">{phone}</span> is not in the correct format. 
              To receive WhatsApp notifications, please update it to start with <span className="font-mono font-bold">234</span> (without +).
            </p>
            <p className="text-xs text-yellow-700 mb-3">
              Example: <span className="font-mono">2348012345678</span> (not 08012345678 or +2348012345678)
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleGoToSettings}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Fix Now in Settings
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
                className="border-yellow-600 text-yellow-900"
              >
                Remind Me Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
