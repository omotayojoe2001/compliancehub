import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabaseService } from "@/lib/supabaseService";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Calculator, Plus, Check } from "lucide-react";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Link } from "react-router-dom";
import { AddTaxObligation } from "@/components/dashboard/AddTaxObligation";

interface Obligation {
  id: string;
  obligation_type: string;
  frequency: string;
  next_due_date: string;
  tax_period?: string;
  is_active: boolean;
  payment_status: string;
}

export default function Obligations() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user?.id && currentCompany?.id) {
      fetchObligations();
    } else {
      setObligations([]);
      setLoading(false);
    }
  }, [user?.id, currentCompany?.id]);

  const fetchObligations = async () => {
    if (!currentCompany?.id) {
      setObligations([]);
      setLoading(false);
      return;
    }
    
    try {
      const data = await supabaseService.getObligations(user?.id, currentCompany.id);
      setObligations(data || []);
    } catch (error) {
      console.error('Error loading obligations:', error);
      setObligations([]);
    }
    setLoading(false);
  };



  const markAsPaid = async (id: string) => {
    const obligation = obligations.find(o => o.id === id);
    const confirmed = confirm(`Are you sure you have paid the ${obligation?.obligation_type} tax? This will mark it as completed and create the next period.`);
    
    if (!confirmed) return;
    
    try {
      // Mark current obligation as paid
      await supabaseService.updateObligation(id, { payment_status: 'paid' });
      
      // Create next period for recurring taxes
      if (obligation && user?.id && currentCompany?.id) {
        const nextPeriod = generateNextPeriod(obligation);
        if (nextPeriod) {
          await supabaseService.createObligation({
            user_id: user.id,
            company_id: currentCompany.id,
            obligation_type: obligation.obligation_type,
            frequency: getFrequencyForTaxType(obligation.obligation_type),
            next_due_date: nextPeriod.dueDate,
            tax_period: nextPeriod.period,
            payment_status: 'pending',
            is_active: true,
            amount_due: (obligation as any).amount_due || 0
          });
        }
      }
      
      // Refresh the list
      await fetchObligations();
      
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Failed to mark as paid: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getFrequencyForTaxType = (taxType: string): string => {
    const type = taxType.toLowerCase();
    if (type.includes('paye') || type.includes('vat')) return 'monthly';
    if (type.includes('cit') || type.includes('company income')) return 'annually';
    if (type.includes('wht') || type.includes('withholding')) return 'monthly';
    return 'monthly'; // Default to monthly
  };

  const generateNextPeriod = (obligation: any) => {
    const taxType = obligation.obligation_type.toLowerCase();
    const currentDue = new Date(obligation.next_due_date);
    
    // For monthly taxes (PAYE, VAT, WHT)
    if (taxType.includes('paye') || taxType.includes('vat') || taxType.includes('wht')) {
      const nextMonth = new Date(currentDue);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      // Set proper due dates
      if (taxType.includes('paye')) {
        nextMonth.setDate(10); // PAYE due 10th of following month
      } else if (taxType.includes('vat')) {
        nextMonth.setDate(21); // VAT due 21st of following month
      }
      
      const year = nextMonth.getFullYear();
      const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
      
      return {
        dueDate: nextMonth.toISOString(),
        period: `${year}-${month}`
      };
    }
    
    // For annual taxes (CIT)
    if (taxType.includes('cit') || taxType.includes('company income')) {
      const nextYear = new Date(currentDue);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      
      return {
        dueDate: nextYear.toISOString(),
        period: null
      };
    }
    
    return null; // Don't create next period for unknown types
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
    <SubscriptionGate feature="hasReminders">
      <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">What We're Watching For You</h1>
            <p className="text-sm text-muted-foreground">
              Tax periods you've added that we're monitoring
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Obligation
          </Button>
        </div>

        {/* Add Tax Obligation Form */}
        {showAddForm && (
          <div className="border border-border bg-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Tax Obligation</h3>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
            <AddTaxObligation onSuccess={() => {
              setShowAddForm(false);
              fetchObligations();
            }} />
          </div>
        )}

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
                              obligation.payment_status === 'paid'
                                ? "border-blue-200 bg-blue-100 text-blue-800"
                                : obligation.is_active
                                ? "border-green-200 bg-green-100 text-green-800"
                                : "border-gray-200 bg-gray-100 text-gray-600"
                            )}
                          >
                            {obligation.payment_status === 'paid' ? "✓ Paid" : obligation.is_active ? "✓ Watching" : "⏸ Paused"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {obligation.is_active && obligation.payment_status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsPaid(obligation.id)}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark Paid
                              </Button>
                            )}
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
                        {obligation.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsPaid(obligation.id)}
                            className="border-green-200 text-green-700 hover:bg-green-50 h-7 px-2"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Paid
                          </Button>
                        )}
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
