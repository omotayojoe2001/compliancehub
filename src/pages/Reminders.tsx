import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, Mail, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { SubscriptionGate } from "@/components/SubscriptionGate";

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

export default function Reminders() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadReminderData();
    } else {
      setReminderLogs([]);
      setUpcomingReminders([]);
      setLoading(false);
    }
  }, [user?.id]);

  const loadReminderData = async () => {
    if (!user?.id) return;

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setLoadError("Request timed out. Please try again.");
      setLoading(false);
    }, 8000);

    setLoadError(null);
    try {
      setLoading(true);
      console.log('Loading reminder data for user:', user.id);

      // Load reminders
      const logs = await supabaseService.getReminders(user.id, currentCompany?.id);
      console.log('Loaded reminders:', logs);
      if (settled) return;
      setReminderLogs(Array.isArray(logs) ? logs : []);

      // Load obligations
      const obligations = await supabaseService.getObligations(user.id, currentCompany?.id);
      console.log('Loaded obligations:', obligations);
      if (settled) return;
      
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
    } catch (error) {
      if (settled) return;
      console.error('Error loading reminder data:', error);
      setReminderLogs([]);
      setUpcomingReminders([]);
      setLoadError(`Couldn't load reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };



  return (
    <SubscriptionGate feature="Reminders">
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Proof We're Working</h1>
          <p className="text-sm text-muted-foreground">
            Every reminder we've sent you (or tried to send) and what's coming up
          </p>
        </div>

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
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        What Tax
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        How We Sent It
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        When Planned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        When Actually Sent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Did It Work?
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reminderLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-secondary/50">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {log.tax_obligations?.obligation_type || 'Tax Reminder'}
                          {log.message_content && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                              "{log.message_content.substring(0, 80)}..."
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {log.reminder_type === "email" ? (
                              <Mail className="h-4 w-4" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                            {log.reminder_type === "email" ? "Email" : "WhatsApp"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(log.scheduled_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {log.sent_date ? new Date(log.sent_date).toLocaleString() : "Not yet"}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-medium",
                              log.status === "sent" && "text-green-600",
                              log.status === "failed" && "text-red-600",
                              log.status === "pending" && "text-yellow-600"
                            )}
                          >
                            {log.status === "sent" && <CheckCircle className="h-3 w-3" />}
                            {log.status === "failed" && <XCircle className="h-3 w-3" />}
                            <span>
                              {log.status === "sent" && "✓ Success"}
                              {log.status === "failed" && "✗ Failed"}
                              {log.status === "pending" && "⏳ Waiting"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {reminderLogs.map((log) => (
                  <div key={log.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {log.tax_obligations?.obligation_type || 'Tax Reminder'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {log.reminder_type === "email" ? (
                            <Mail className="h-3 w-3" />
                          ) : (
                            <MessageSquare className="h-3 w-3" />
                          )}
                          {log.reminder_type === "email" ? "Email" : "WhatsApp"}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          log.status === "sent" && "text-green-600",
                          log.status === "failed" && "text-red-600",
                          log.status === "pending" && "text-yellow-600"
                        )}
                      >
                        {log.status === "sent" && <CheckCircle className="h-3 w-3" />}
                        {log.status === "failed" && <XCircle className="h-3 w-3" />}
                        <span className="hidden sm:inline">
                          {log.status === "sent" && "Success"}
                          {log.status === "failed" && "Failed"}
                          {log.status === "pending" && "Waiting"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sent: {log.sent_date ? new Date(log.sent_date).toLocaleDateString() : "Not yet"}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tax Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Reminder Scheduled
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {upcomingReminders.map((reminder) => (
                      <tr key={reminder.id} className="hover:bg-secondary/50">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {reminder.obligation_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(reminder.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(reminder.next_reminder_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                            <Clock className="h-3 w-3" />
                            <span>Scheduled</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {reminder.obligation_type}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(reminder.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">Scheduled</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reminder: {new Date(reminder.next_reminder_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}

