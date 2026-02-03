import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Calculator, Save, RefreshCw, AlertCircle } from 'lucide-react';

interface TaxRate {
  id: string;
  tax_type: string;
  rate_name: string;
  rate_percentage: number;
  description: string;
  is_active: boolean;
  updated_at: string;
}

export default function AdminTaxRates() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadTaxRates();
  }, []);

  const loadTaxRates = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .order('tax_type', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setTaxRates(data);
      } else {
        // Initialize default tax rates if none exist
        await initializeDefaultRates();
      }
    } catch (error) {
      console.error('Error loading tax rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultRates = async () => {
    const defaultRates = [
      { tax_type: 'VAT', rate_name: 'Standard VAT', rate_percentage: 7.5, description: 'Value Added Tax', is_active: true },
      { tax_type: 'PAYE', rate_name: 'PAYE Tax', rate_percentage: 24, description: 'Pay As You Earn (Maximum Rate)', is_active: true },
      { tax_type: 'CIT', rate_name: 'Company Income Tax', rate_percentage: 30, description: 'Company Income Tax', is_active: true },
      { tax_type: 'WHT_PROFESSIONAL', rate_name: 'Professional Services', rate_percentage: 5, description: 'Withholding Tax - Professional Services', is_active: true },
      { tax_type: 'WHT_DIVIDEND', rate_name: 'Dividend', rate_percentage: 10, description: 'Withholding Tax - Dividend', is_active: true },
      { tax_type: 'WHT_CONSTRUCTION', rate_name: 'Construction', rate_percentage: 2.5, description: 'Withholding Tax - Construction', is_active: true },
      { tax_type: 'CGT', rate_name: 'Capital Gains Tax', rate_percentage: 10, description: 'Capital Gains Tax', is_active: true }
    ];

    try {
      const { data, error } = await supabase
        .from('tax_rates')
        .insert(defaultRates)
        .select();

      if (error) throw error;
      if (data) setTaxRates(data);
    } catch (error) {
      console.error('Error initializing default rates:', error);
    }
  };

  const updateTaxRate = async (id: string, newRate: number) => {
    setSaving(id);
    try {
      console.log('🔄 Updating tax rate:', { id, newRate });
      
      const { data, error } = await supabase
        .from('tax_rates')
        .update({ 
          rate_percentage: newRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Database updated:', data);

      // Update local state immediately
      setTaxRates(prev => prev.map(rate => 
        rate.id === id 
          ? { ...rate, rate_percentage: newRate, updated_at: new Date().toISOString() }
          : rate
      ));

      alert(`✅ Tax rate updated to ${newRate}%`);
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const toggleRateStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('tax_rates')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setTaxRates(prev => prev.map(rate => 
        rate.id === id 
          ? { ...rate, is_active: isActive, updated_at: new Date().toISOString() }
          : rate
      ));
    } catch (error) {
      console.error('Error toggling rate status:', error);
      alert('Failed to update rate status');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Rates Management</h1>
            <p className="text-muted-foreground">Manage tax rates used in calculators</p>
          </div>
          <Button onClick={loadTaxRates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Important Notice</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Changes to tax rates will immediately affect all calculator results for users. 
                Please verify rates with official Nigerian tax authorities before making changes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {taxRates.map((rate) => (
            <Card key={rate.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calculator className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{rate.rate_name}</h3>
                    <p className="text-sm text-muted-foreground">{rate.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rate.is_active}
                      onChange={(e) => toggleRateStatus(rate.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tax Type
                  </label>
                  <input
                    type="text"
                    value={rate.tax_type}
                    disabled
                    className="w-full border border-border rounded-md px-3 py-2 bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rate Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    key={`${rate.id}-${rate.rate_percentage}`}
                    defaultValue={rate.rate_percentage}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const newRate = parseFloat(e.currentTarget.value);
                        if (newRate !== rate.rate_percentage && newRate >= 0 && newRate <= 100) {
                          updateTaxRate(rate.id, newRate);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const newRate = parseFloat(e.target.value);
                      if (newRate !== rate.rate_percentage && newRate >= 0 && newRate <= 100) {
                        updateTaxRate(rate.id, newRate);
                      }
                    }}
                    className="w-full border border-border rounded-md px-3 py-2"
                    disabled={saving === rate.id}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const input = document.querySelector(`input[defaultValue="${rate.rate_percentage}"]`) as HTMLInputElement;
                      if (input) {
                        const newRate = parseFloat(input.value);
                        if (newRate !== rate.rate_percentage && newRate >= 0 && newRate <= 100) {
                          updateTaxRate(rate.id, newRate);
                        }
                      }
                    }}
                    disabled={saving === rate.id}
                    size="sm"
                  >
                    {saving === rate.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadTaxRates()}
                    disabled={saving === rate.id}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Last updated: {new Date(rate.updated_at).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}