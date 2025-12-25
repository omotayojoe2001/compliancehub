import { Mail, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Reminder {
  id: string;
  obligation_id: string;
  reminder_type: string;
  sent_date: string;
  status: string;
  tax_obligations?: {
    obligation_type: string;
  };
}

export function RecentReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReminders();
    }
  }, [user?.id]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_logs')
        .select(`
          *,
          tax_obligations(obligation_type)
        `)
        .eq('user_id', user?.id)
        .order('sent_date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setReminders(data);
      } else {
        console.error('Reminders error:', error);
        setReminders([]);
      }
    } catch (error) {
      console.error('Reminders fetch failed:', error);
      setReminders([]);
    }
    setLoading(false);
  };



  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Recent Reminders
        </h3>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : reminders.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No reminders sent yet.
            <br />
            Add tax periods and reminders will appear here when sent.
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {reminder.reminder_type === "email" ? (
                  <Mail className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {reminder.tax_obligations?.obligation_type || 'Tax Reminder'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reminder.sent_date).toLocaleString()} • {reminder.reminder_type === "email" ? "Email" : "WhatsApp"}
                  </p>
                  {reminder.message_content && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      "{reminder.message_content.substring(0, 60)}..."
                    </p>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  reminder.status === "sent" ? "text-primary" : "text-destructive"
                )}
              >
                {reminder.status === "sent" ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Sent
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Failed
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
