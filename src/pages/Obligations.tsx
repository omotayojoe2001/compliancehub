import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Calculator } from "lucide-react";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Link } from "react-router-dom";

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
  const { currentCompany } = useCompany();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Obligations effect triggered:', { userId: user?.id, companyId: currentCompany?.id, companyName: currentCompany?.name });
    if (user?.id && currentCompany?.id) {
      fetchObligations();
    } else {
      setObligations([]);
      setLoading(false);
    }
  }, [user?.id, currentCompany?.id]);

  const fetchObligations = async () => {
    if (!currentCompany?.id) {
      console.log('🚫 No company selected, clearing obligations');
      setObligations([]);
      setLoading(false);
      return;
    }
    
    console.log('📊 Fetching obligations for company:', currentCompany.name, currentCompany.id);
    
    try {
      const data = await supabaseService.getObligations(user?.id, currentCompany.id);
      console.log('📊 Obligations query result:', data);

      setObligations(data || []);
      console.log('✅ Loaded', data?.length || 0, 'obligations for', currentCompany.name);
    } catch (error) {
      console.error('❌ Obligations fetch failed:', error);
      setObligations([]);
    }
    setLoading(false);
  };



  const deleteObligation = async (id: string) => {
    if (!confirm('Delete this tax obligation?')) return;
    
    try {
      await supabaseService.deleteObligation(id);
      fetchObligations();
    } catch (error) {
      console.error('Error deleting obligation:', error);
    }
  };

  const getCalculatorLink = (obligationType: string) => {
    const taxType = obligationType.toLowerCase();
    if (taxType.includes('paye')) return '/calculator?tax=paye';
    if (taxType.includes('withholding') || taxType.includes('wht')) return '/calculator?tax=wht';
    if (taxType.includes('company income') || taxType.includes('cit')) return '/calculator?tax=cit';
    if (taxType.includes('capital gains')) return '/calculator?tax=cgt';
    if (taxType.includes('vat')) return '/calculator?tax=vat';
    return `/calculator?tax=${encodeURIComponent(obligationType)}`;
  };

  return (
    <SubscriptionGate feature="Tax Obligations">
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">What We're Watching For You</h1>
          <p className="text-sm text-muted-foreground">
            Tax periods you've added that we're monitoring
          </p>
        </div>

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
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
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
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-border"
                            >
                              <Link to={getCalculatorLink(obligation.obligation_type)}>
                                <Calculator className="h-4 w-4 mr-1" />
                                Calculator
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteObligation(obligation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {obligations.map((obligation) => (
                  <div key={obligation.id} className="p-3 hover:bg-secondary/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {obligation.obligation_type}
                        </h4>
                        {obligation.tax_period && (
                          <p className="text-xs text-muted-foreground">
                            Period: {obligation.tax_period}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium border rounded",
                          obligation.is_active
                            ? "border-green-200 bg-green-100 text-green-800"
                            : "border-gray-200 bg-gray-100 text-gray-600"
                        )}
                      >
                        {obligation.is_active ? "✓ Watching" : "⏸ Paused"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(obligation.next_due_date).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-border h-7 px-2"
                        >
                          <Link to={getCalculatorLink(obligation.obligation_type)}>
                            <Calculator className="h-3 w-3 mr-1" />
                            Calc
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteObligation(obligation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 h-7 px-2"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
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
