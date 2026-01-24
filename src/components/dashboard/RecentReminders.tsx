import { Mail, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { realtimeService } from "@/lib/realtimeService";

interface Reminder {
  id: string;
  obligation_id: string;
  reminder_type: string;
  sent_date: string;
  status: string;
  message_content?: string;
  tax_obligations?: {
    obligation_type: string;
  };
}

export function RecentReminders() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && currentCompany?.id) {
      loadReminders();
    } else {
      setReminders([]);
      setLoading(false);
    }
  }, [user?.id, currentCompany?.id]);

  const loadReminders = async () => {
    if (!user?.id || !currentCompany?.id) return;
    
    try {
      const data = await supabaseService.getReminders(user.id, currentCompany.id);
      setReminders(data || []);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Proof We Work ({reminders.length})
        </h3>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No reminders sent yet.
            <br />
            Add tax periods and reminders will appear here when sent.
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-start justify-between px-3 py-2 gap-2"
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {reminder.reminder_type === "email" ? (
                  <Mail className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {reminder.tax_obligations?.obligation_type || 'Tax Reminder'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reminder.sent_date).toLocaleDateString()} • {reminder.reminder_type === "email" ? "Email" : "WhatsApp"}
                  </p>
                  {reminder.message_content && (
                    <p className="text-xs text-gray-500 mt-1 italic truncate">
                      "{reminder.message_content.substring(0, 40)}..."
                    </p>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium flex-shrink-0",
                  reminder.status === "sent" ? "text-primary" : "text-destructive"
                )}
              >
                {reminder.status === "sent" ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Sent</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    <span className="hidden sm:inline">Failed</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
