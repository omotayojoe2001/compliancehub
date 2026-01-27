import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { supabase } from "@/lib/supabase";
import { SubscriptionGate } from "@/components/SubscriptionGate";

interface DebugInfo {
  timestamp: string;
  step: string;
  data?: any;
  error?: any;
}

export default function RemindersDebugFixed() {
  const { user } = useAuth();
  const [reminderCount, setReminderCount] = useState<number>(0);
  const [upcomingCount, setUpcomingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addDebug = (step: string, data?: any, error?: any) => {
    const debug: DebugInfo = {
      timestamp: new Date().toLocaleTimeString(),
      step,
      data,
      error
    };
    console.log(`🔍 [${debug.timestamp}] ${step}:`, debug);
    setDebugInfo(prev => [...prev, debug]);
  };

  const loadData = async () => {
    if (!user?.id) {
      addDebug('No user ID available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    addDebug('Starting data load', { userId: user.id });

    try {
      // Test basic auth first
      addDebug('Testing authentication');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      addDebug('Auth successful', { hasUser: !!authData?.user });

      // Load reminder logs with simple query
      addDebug('Loading reminder logs');
      const { count: reminderLogCount, error: reminderError } = await supabase
        .from('reminder_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (reminderError) {
        addDebug('Reminder logs query failed', null, reminderError);
        // Don't throw, just log the error
        setReminderCount(0);
      } else {
        addDebug('Reminder logs loaded', { count: reminderLogCount });
        setReminderCount(reminderLogCount || 0);
      }

      // Load tax obligations
      addDebug('Loading tax obligations');
      const { count: obligationCount, error: obligationError } = await supabase
        .from('tax_obligations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('payment_status', 'paid');

      if (obligationError) {
        addDebug('Tax obligations query failed', null, obligationError);
        setUpcomingCount(0);
      } else {
        addDebug('Tax obligations loaded', { count: obligationCount });
        setUpcomingCount(obligationCount || 0);
      }

      addDebug('Data load completed successfully');

    } catch (error: any) {
      addDebug('Data load failed', null, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    addDebug('Component mounted', { hasUser: !!user, userId: user?.id });
    loadData();
  }, [user?.id]);

  return (
    <SubscriptionGate feature="Reminders">
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Proof We're Working (Fixed Version)</h1>
            <p className="text-sm text-muted-foreground">
              Simplified version with better error handling and timeout management
            </p>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border bg-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                ) : error ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">Connection Status</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {loading ? 'Connecting...' : error ? 'Connection failed' : 'Connected successfully'}
              </p>
            </div>

            <div className="border border-border bg-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{reminderCount}</span>
                <span className="text-sm">Sent Reminders</span>
              </div>
              <p className="text-xs text-muted-foreground">Total reminders sent</p>
            </div>

            <div className="border border-border bg-card p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{upcomingCount}</span>
                <span className="text-sm">Upcoming</span>
              </div>
              <p className="text-xs text-muted-foreground">Scheduled reminders</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadData}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Debug Panel */}
          {showDebug && debugInfo.length > 0 && (
            <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-yellow-800">Debug Information</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {debugInfo.slice(-10).map((info, index) => (
                  <div key={index} className="text-xs font-mono bg-white p-2 rounded border">
                    <div className="font-semibold text-yellow-700">
                      [{info.timestamp}] {info.step}
                    </div>
                    {info.data && (
                      <div className="text-green-600 mt-1">
                        Data: {JSON.stringify(info.data)}
                      </div>
                    )}
                    {info.error && (
                      <div className="text-red-600 mt-1">
                        Error: {info.error.message || JSON.stringify(info.error)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            
            {!showDebug && (
              <button
                onClick={() => setShowDebug(true)}
                className="px-4 py-2 border border-border bg-background rounded-md hover:bg-muted"
              >
                Show Debug ({debugInfo.length})
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}