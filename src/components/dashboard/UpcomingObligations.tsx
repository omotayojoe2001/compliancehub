import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Obligation {
  id: string;
  obligation_type: string;
  next_due_date: string;
  tax_period?: string;
}

export function UpcomingObligations() {
  const { user } = useAuth();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchObligations();
    }
  }, [user?.id]);

  const fetchObligations = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (!error && data) {
        setObligations(data);
      } else {
        console.error('Tax obligations error:', error);
        setObligations([]);
      }
    } catch (error) {
      console.error('Tax obligations fetch failed:', error);
      setObligations([]);
    }
    setLoading(false);
  };



  const getStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 7) return "due-soon";
    return "upcoming";
  };

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Upcoming Obligations
        </h3>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : obligations.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tax obligations added yet.
            <br />
            Use "Add Tax Period" above to add your actual tax periods.
          </div>
        ) : (
          obligations.map((obligation) => {
            const status = getStatus(obligation.next_due_date);
            return (
              <div
                key={obligation.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {obligation.obligation_type} {obligation.tax_period ? `(${obligation.tax_period})` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(obligation.next_due_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium border",
                    status === "upcoming" &&
                      "border-border bg-secondary text-muted-foreground",
                    status === "due-soon" &&
                      "border-warning/20 bg-warning/10 text-warning",
                    status === "overdue" &&
                      "border-destructive/20 bg-destructive/10 text-destructive"
                  )}
                >
                  {status === "upcoming" && "Upcoming"}
                  {status === "due-soon" && "Due Soon"}
                  {status === "overdue" && "Overdue"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
