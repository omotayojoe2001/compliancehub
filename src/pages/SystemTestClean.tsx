import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader, Database, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
import { realtimeService } from '@/lib/realtimeService';
import { paymentService } from '@/lib/paymentService';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function SystemTest() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    if (user?.id) {
      testRealtimeConnection();
    }
  }, [user?.id]);

  const updateTest = (name: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { name, status, message } : t);
      }
      return [...prev, { name, status, message }];
    });
  };

  const testRealtimeConnection = () => {
    if (!user?.id) return;

    updateTest('Real-time Connection', 'pending', 'Testing connection...');
    
    const subscription = realtimeService.subscribeToObligations(
      user.id,
      (payload) => {
        console.log('🔥 Real-time test received:', payload);
        setRealtimeConnected(true);
        updateTest('Real-time Connection', 'success', 'Real-time subscriptions working!');
        subscription.unsubscribe();
      }
    );

    setTimeout(() => {
      if (!realtimeConnected) {
        updateTest('Real-time Connection', 'error', 'Real-time connection timeout');
        subscription.unsubscribe();
      }
    }, 5000);
  };

  const runAllTests = async () => {
    if (!user?.id) return;
    
    setTesting(true);
    setTests([]);

    try {
      updateTest('Supabase Connection', 'pending', 'Testing database connection...');
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        updateTest('Supabase Connection', 'success', 'Database connection successful');
      } catch (error) {
        updateTest('Supabase Connection', 'error', `Database error: ${error}`);
      }

      updateTest('Profile Service', 'pending', 'Testing profile operations...');
      try {
        const profile = await supabaseService.getProfile(user.id);
        updateTest('Profile Service', 'success', `Profile loaded: ${profile?.business_name || 'No name'}`);
      } catch (error) {
        updateTest('Profile Service', 'error', `Profile error: ${error}`);
      }

      updateTest('Paystack Integration', 'pending', 'Testing payment service...');
      try {
        const basicPrice = await paymentService.getPlanPrice('basic');
        const proPrice = await paymentService.getPlanPrice('pro');
        const enterprisePrice = await paymentService.getPlanPrice('enterprise');
        
        if (basicPrice === 1200000 && proPrice === 3000000 && enterprisePrice === 5000000) {
          updateTest('Paystack Integration', 'success', 'Payment service configured correctly');
        } else {
          updateTest('Paystack Integration', 'error', 'Payment prices incorrect');
        }
      } catch (error) {
        updateTest('Paystack Integration', 'error', `Payment error: ${error}`);
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Test Dashboard</h1>
          <p className="text-muted-foreground">
            Test Supabase real-time and Paystack integration
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={runAllTests} disabled={testing}>
            <Database className="h-4 w-4 mr-2" />
            {testing ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button onClick={testRealtimeConnection} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Test Real-time
          </Button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          
          {tests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run All Tests" to start testing
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    test.status === 'success' ? 'bg-green-100 text-green-800' :
                    test.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}