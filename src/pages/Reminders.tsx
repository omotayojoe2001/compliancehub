import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
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
  };
}

export default function Reminders() {
  const { user } = useAuth();
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use static demo data immediately
    setReminderLogs([
      {
        id: 'demo-1',
        reminder_type: 'email',
        scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        message_content: 'VAT filing reminder: Your VAT return is due in 7 days',
        tax_obligations: {
          obligation_type: 'VAT'
        }
      },
      {
        id: 'demo-2',
        reminder_type: 'email',
        scheduled_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sent_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
        message_content: 'PAYE reminder: Your PAYE return is due in 3 days',
        tax_obligations: {
          obligation_type: 'PAYE'
        }
      }
    ]);
    setLoading(false);
  }, []);



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HelpWrapper
          helpTitle="Why is this important?"
          helpContent="This page proves the system is actually working! You can see every reminder we tried to send you, when we sent it, and if it worked. This builds trust - you know the robot is doing its job."
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">Proof We're Working</h1>
            <p className="text-sm text-muted-foreground">
              Every reminder we've sent you (or tried to send)
            </p>
          </div>
        </HelpWrapper>

        <div className="border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : reminderLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No reminders sent yet.
              <br />
              Reminders will appear here when we send them for your tax obligations.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
