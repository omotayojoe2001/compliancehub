import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { HelpWrapper } from "@/components/onboarding/HelpWrapper";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";

interface Obligation {
  id: string;
  obligation_type: string;
  frequency: string;
  next_due_date: string;
  tax_period?: string;
  is_active: boolean;
}

export default function Obligations() {
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
        .order('next_due_date', { ascending: true });

      if (!error && data) {
        setObligations(data);
      } else {
        console.error('Obligations error:', error);
        setObligations([]);
      }
    } catch (error) {
      console.error('Obligations fetch failed:', error);
      setObligations([]);
    }
    setLoading(false);
  };



  const deleteObligation = async (id: string) => {
    if (!confirm('Delete this tax obligation?')) return;
    
    const { error } = await supabase
      .from('tax_obligations')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchObligations();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HelpWrapper
          helpTitle="What is this page?"
          helpContent="This shows all the tax periods you've added that we're watching for you. You can delete any that you don't actually need to file."
        >
          <div>
            <h1 className="text-lg font-semibold text-foreground">What We're Watching For You</h1>
            <p className="text-sm text-muted-foreground">
              Tax periods you've added that we're monitoring
            </p>
          </div>
        </HelpWrapper>

        <div className="border border-border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : obligations.length === 0 ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800">All Set!</h3>
            </div>
            <p className="text-sm text-green-700 mb-4">
              No tax obligations added yet. When you add tax periods above, they'll appear here with due dates and status.
            </p>
            <div className="text-xs text-green-600">
              💡 Tip: Only add months where you actually had business activity
            </div>
          </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tax Type & Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {obligations.map((obligation) => (
                  <tr key={obligation.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {obligation.obligation_type}
                      {obligation.tax_period && (
                        <div className="text-xs text-muted-foreground">
                          Period: {obligation.tax_period}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(obligation.next_due_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium border",
                          obligation.is_active
                            ? "border-green-200 bg-green-100 text-green-800"
                            : "border-gray-200 bg-gray-100 text-gray-600"
                        )}
                      >
                        {obligation.is_active ? "✓ Watching" : "⏸ Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteObligation(obligation.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
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
