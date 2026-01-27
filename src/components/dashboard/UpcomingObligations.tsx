import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { realtimeService } from "@/lib/realtimeService";

interface Obligation {
  id: string;
  obligation_type: string;
  next_due_date: string;
  tax_period?: string;
  payment_status?: string;
}

export function UpcomingObligations() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📊 UpcomingObligations effect:', { userId: user?.id, companyId: currentCompany?.id, companyName: currentCompany?.name });
    if (user?.id) {
      // Load obligations even if no company is selected (will show all user obligations)
      loadObligations();
    } else {
      setObligations([]);
      setLoading(false);
    }
  }, [user?.id, currentCompany?.id]);

  const loadObligations = async () => {
    if (!user?.id) {
      console.log('🚫 loadObligations: Missing user ID');
      return;
    }

    console.log('🔄 loadObligations: Starting...', {
      userId: user.id,
      companyId: currentCompany?.id || 'none',
      companyName: currentCompany?.name || 'none',
      timestamp: new Date().toISOString()
    });

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      console.error('⏰ loadObligations: TIMEOUT after 8 seconds');
      setLoadError("Request timed out. Please try again.");
      setLoading(false);
    }, 8000);

    setLoadError(null);
    try {
      console.log('📡 loadObligations: Calling supabaseService.getObligations...');
      const startTime = Date.now();
      const data = await supabaseService.getObligations(user.id, currentCompany?.id);
      const endTime = Date.now();
      
      console.log('✅ loadObligations: Success!', {
        duration: `${endTime - startTime}ms`,
        dataLength: data?.length || 0,
        data: data?.slice(0, 3) // Log first 3 items for debugging
      });
      
      if (settled) return;
      setObligations(data || []);
    } catch (error) {
      if (settled) return;
      console.error('❌ loadObligations: Error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details
      });
      setObligations([]);
      setLoadError("Couldn't load obligations. Please try again.");
    } finally {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      setLoading(false);
      console.log('🏁 loadObligations: Finished');
    }
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
          What We Watch ({obligations.length})
        </h3>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading obligations...
          </div>
        ) : loadError ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadObligations}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Retry
            </button>
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
                      Due: {new Date(obligation.next_due_date).toLocaleDateString()}
                    </p>
                    {obligation.payment_status && (
                      <p className="text-xs text-blue-600">
                        Status: {obligation.payment_status}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium border rounded",
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

