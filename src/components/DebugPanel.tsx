import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { useProfileSimple } from '@/hooks/useProfileSimple';
import { Bug, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { profile } = useProfileSimple();

  const debugData = {
    timestamp: new Date().toISOString(),
    user: {
      id: user?.id,
      email: user?.email,
      authenticated: !!user
    },
    profile: {
      hasProfile: !!profile,
      businessName: profile?.business_name,
      email: profile?.email,
      phone: profile?.phone,
      plan: profile?.plan,
      subscriptionStatus: profile?.subscription_status,
      vatStatus: profile?.vat_status,
      payeStatus: profile?.paye_status,
      cacDate: profile?.cac_date
    },
    company: {
      hasCurrentCompany: !!currentCompany,
      companyName: currentCompany?.name,
      companyId: currentCompany?.id,
      companyTin: currentCompany?.tin,
      isPrimary: currentCompany?.isPrimary
    },
    localStorage: {
      selectedCompany: user?.id ? localStorage.getItem(`selectedCompany_${user.id}`) : null,
      authToken: localStorage.getItem('supabase.auth.token') ? 'Present' : 'Missing'
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy debug data:', error);
    }
  };

  const logDebugData = () => {
    console.group('🐛 COMPLETE DEBUG DATA EXPORT');
    console.log('📊 Full System State:', debugData);
    console.log('🏢 Company Details:', debugData.company);
    console.log('👤 Profile Details:', debugData.profile);
    console.log('🔐 Auth Details:', debugData.user);
    console.log('💾 Storage Details:', debugData.localStorage);
    console.groupEnd();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Debug Panel</h3>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          {/* User Info */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-800 mb-2">🔐 Authentication</h4>
            <div className="space-y-1 text-xs">
              <div>ID: <code className="bg-gray-100 px-1 rounded">{user?.id || 'None'}</code></div>
              <div>Email: <code className="bg-gray-100 px-1 rounded">{user?.email || 'None'}</code></div>
              <div>Status: <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Authenticated' : 'Not authenticated'}</span></div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-800 mb-2">🏢 Current Company</h4>
            <div className="space-y-1 text-xs">
              <div>Name: <code className="bg-gray-100 px-1 rounded">{currentCompany?.name || 'None'}</code></div>
              <div>ID: <code className="bg-gray-100 px-1 rounded">{currentCompany?.id || 'None'}</code></div>
              <div>TIN: <code className="bg-gray-100 px-1 rounded">{currentCompany?.tin || 'None'}</code></div>
              <div>Primary: <span className={currentCompany?.isPrimary ? 'text-green-600' : 'text-gray-600'}>{currentCompany?.isPrimary ? 'Yes' : 'No'}</span></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-800 mb-2">👤 Profile</h4>
            <div className="space-y-1 text-xs">
              <div>Business: <code className="bg-gray-100 px-1 rounded">{profile?.business_name || 'None'}</code></div>
              <div>Plan: <code className="bg-gray-100 px-1 rounded">{profile?.plan || 'None'}</code></div>
              <div>Subscription: <span className={profile?.subscription_status === 'active' ? 'text-green-600' : 'text-red-600'}>{profile?.subscription_status || 'None'}</span></div>
              <div>VAT: <span className={profile?.vat_status ? 'text-green-600' : 'text-gray-600'}>{profile?.vat_status ? 'Registered' : 'Not registered'}</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={logDebugData}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Log to Console
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}