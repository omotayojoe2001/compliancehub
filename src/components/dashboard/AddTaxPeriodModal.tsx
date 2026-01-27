import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { useProfile } from '@/hooks/useProfileClean';
import { reminderService } from '@/lib/reminderService';
import { Plus, X } from 'lucide-react';

interface AddTaxPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTaxPeriodModal({ isOpen, onClose, onSuccess }: AddTaxPeriodModalProps) {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [plan, setPlan] = useState<string>('enterprise'); // Default to enterprise
  // Always fetch the latest plan from subscriptions
  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return setPlan('enterprise');
      try {
        const { data: subscription } = await window.supabase
          .from('subscriptions')
          .select('plan_type, plan')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setPlan(subscription?.plan_type || subscription?.plan || 'enterprise');
      } catch (error) {
        console.error('Failed to fetch subscription plan:', error);
        setPlan('enterprise'); // Default to enterprise for full access
      }
    }
    fetchPlan();
  }, [user?.id]);
  const [loading, setLoading] = useState(false);
  const [obligationType, setObligationType] = useState('');
  const [taxPeriod, setTaxPeriod] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !currentCompany?.id || !obligationType || !taxPeriod) {
      alert('Please ensure you have selected a company and filled all fields');
      return;
    }
    setLoading(true);
    try {
      await reminderService.addTaxObligation(
        user.id,
        obligationType,
        taxPeriod,
        plan,
        currentCompany.id
      );
      // ...existing code...
      setObligationType('');
      setTaxPeriod('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Failed to add tax obligation:', error);
      alert(error instanceof Error ? error.message : 'Failed to add obligation');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Add Tax Period</h3>
            <HelpTooltip 
              title="What does 'Add Tax Period' mean?"
              content="This is where you tell the system about months when you had business activity and need to file taxes. For example, if you sold goods in December 2024, you need to file VAT for December 2024. Only add periods where you actually did business - don't add anything if you had no sales, no employees, or no business activity."
            />
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-700">
            <strong>Only add tax periods you actually need to file.</strong>
            <br />For example: If you sold goods in December 2024, add "VAT - December 2024".
            <br />If you paid salaries in November 2024, add "PAYE - November 2024".
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="type">What tax do you need to file?</Label>
              <HelpTooltip 
                title="Understanding Tax Types"
                content="VAT: If you sold goods or services to customers. PAYE: If you paid salaries to employees. WHT: If you made payments to contractors or suppliers. CAC: Annual company filing (once per year only)."
              />
            </div>
            <Select value={obligationType} onValueChange={setObligationType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose the tax you need to file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAT">VAT (if you sold goods/services)</SelectItem>
                <SelectItem value="PAYE">PAYE (if you paid salaries)</SelectItem>
                <SelectItem value="WHT">Withholding Tax (if you made payments)</SelectItem>
                <SelectItem value="CAC">CAC Annual Return (once per year)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="period">Which month do you need to file for?</Label>
              <HelpTooltip 
                title="Selecting the Right Month"
                content="Choose the month when you had business activity. For example: If you sold products in December 2024, select December 2024 for VAT. If you paid salaries in November 2024, select November 2024 for PAYE. Only add months where you actually did business."
              />
            </div>
            <Input
              id="period"
              type="month"
              value={taxPeriod}
              onChange={(e) => setTaxPeriod(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pick the month you had business activity (e.g., December 2024)
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || !obligationType || !taxPeriod} className="bg-green-600 hover:bg-green-700 text-white px-6 flex-1">
              {loading ? (
                <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>Adding...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Add This Tax Period</>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}