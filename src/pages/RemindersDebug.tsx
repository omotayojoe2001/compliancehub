import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, Mail, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { supabase } from "@/lib/supabase";

interface ReminderLog {
  id: string;
  reminder_type: string;
  scheduled_date: string;
  sent_date: string | null;
  status: string;
  message_content?: string;
  tax_obligations?: {
    obligation_type: string;
  } | null;
}

interface UpcomingReminder {
  id: string;
  obligation_type: string;
  due_date: string;
  next_reminder_date: string;
  status: string;
}

interface DebugInfo {
  timestamp: string;
  step: string;
  data?: any;
  error?: any;
}

export default function RemindersDebug() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  const addDebug = (step: string, data?: any, error?: any) => {
    const debug: DebugInfo = {
      timestamp: new Date().toISOString(),
      step,
      data,
      error
    };
    console.log(`🔍 REMINDERS DEBUG [${step}]:`, debug);
    setDebugInfo(prev => [...prev, debug]);
  };

  useEffect(() => {
    addDebug('useEffect triggered', { hasUser: !!user, userId: user?.id, hasCompany: !!currentCompany });
    if (user?.id) {
      loadReminderData();
    } else {
      addDebug('No user, clearing data');
      setReminderLogs([]);
      setUpcomingReminders([]);
      setLoading(false);
    }
  }, [user?.id]);

  const testDatabaseConnection = async () => {
    addDebug('Testing database connection');
    try {
      // Test basic connection
      const { data: authData, error: authError } = await supabase.auth.getUser();
      addDebug('Auth test', { authData: !!authData, authError });
      
      if (authError) {
        throw new Error(`Auth failed: ${authError.message}`);
      }
      
      // Test reminder_logs table
      const { data: reminderTest, error: reminderError } = await supabase
        .from('reminder_logs')
        .select('count')
        .limit(1);
      addDebug('Reminder logs table test', { reminderTest, reminderError });
      
      if (reminderError) {
        addDebug('Reminder logs table error', null, reminderError);
      }
      
      // Test tax_obligations table
      const { data: obligationTest, error: obligationError } = await supabase
        .from('tax_obligations')
        .select('count')
        .limit(1);
      addDebug('Tax obligations table test', { obligationTest, obligationError });
      
      if (obligationError) {
        addDebug('Tax obligations table error', null, obligationError);
      }
      
    } catch (error) {
      addDebug('Database connection test failed', null, error);
      throw error; // Re-throw to be caught by the main function
    }
  };

  const loadReminderData = async () => {
    if (!user?.id) {
      addDebug('No user ID, aborting load');
      return;
    }

    addDebug('Starting data load', { userId: user.id });
    
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      addDebug('Request timed out');
      setLoadError("Request timed out. Please try again.");
      setLoading(false);
    }, 35000); // Increased to 35 seconds to match new Supabase timeout

    setLoadError(null);
    try {
      setLoading(true);
      addDebug('Set loading to true');

      // Test database connection first
      await testDatabaseConnection();

      addDebug('Loading reminders via direct query');
      const { data: logs, error: reminderError } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      addDebug('Reminders query result', { logs, reminderError });
      
      if (settled) return;
      if (reminderError) {
        throw new Error(`Reminder query failed: ${reminderError.message}`);
      }
      setReminderLogs(Array.isArray(logs) ? logs : []);

      addDebug('Loading obligations via direct query');
      const { data: obligations, error: obligationError } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });
      
      addDebug('Obligations query result', { obligations, obligationError });
      
      if (settled) return;
      if (obligationError) {
        throw new Error(`Obligation query failed: ${obligationError.message}`);
      }
      
      const upcoming = Array.isArray(obligations)
        ? obligations
            .filter(o => o.payment_status !== 'paid')
            .map(o => ({
              id: o.id,
              obligation_type: o.obligation_type,
              due_date: o.next_due_date,
              next_reminder_date: new Date(new Date(o.next_due_date).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'scheduled'
            }))
        : [];

      setUpcomingReminders(upcoming);
      addDebug('Data load completed successfully', { 
        reminderCount: Array.isArray(logs) ? logs.length : 0,
        upcomingCount: upcoming.length 
      });
      
    } catch (error) {
      if (settled) return;
      addDebug('Data load failed', null, error);
      setReminderLogs([]);
      setUpcomingReminders([]);
      setLoadError(`Couldn't load reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      setLoading(false);
      addDebug('Loading completed, set loading to false');
    }
  };

  return (
    <SubscriptionGate feature="Reminders">
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Proof We're Working (Debug Mode)</h1>
          <p className="text-sm text-muted-foreground">
            Every reminder we've sent you (or tried to send) and what's coming up
          </p>
        </div>

        {/* Debug Panel */}
        {showDebug && (
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
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs font-mono bg-white p-2 rounded border">
                  <div className="font-semibold text-yellow-700">
                    [{info.timestamp.split('T')[1].split('.')[0]}] {info.step}
                  </div>
                  {info.data && (
                    <div className="text-green-600 mt-1">
                      Data: {JSON.stringify(info.data, null, 2)}
                    </div>
                  )}
                  {info.error && (
                    <div className="text-red-600 mt-1">
                      Error: {JSON.stringify(info.error, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Toggle */}
        {!showDebug && debugInfo.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowDebug(true)}
              className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1 mx-auto"
            >
              <AlertTriangle className="h-4 w-4" />
              Show Debug Info ({debugInfo.length} entries)
            </button>
          </div>
        )}

        {/* Sent Reminders */}
        <div className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-semibold text-foreground">Sent Reminders</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : loadError ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>{loadError}</p>
              <button
                type="button"
                onClick={loadReminderData}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : reminderLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No reminders sent yet.
              <br />
              Reminders will appear here when we send them for your tax obligations.
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-green-600">Found {reminderLogs.length} reminders</p>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Reminders</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : loadError ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>{loadError}</p>
              <button
                type="button"
                onClick={loadReminderData}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No upcoming reminders scheduled.
              <br />
              Add tax obligations to see scheduled reminders.
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-green-600">Found {upcomingReminders.length} upcoming reminders</p>
            </div>
          )}
        </div>
      </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}