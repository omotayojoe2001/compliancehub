import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export function SimpleVATCalculator() {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{
    vatAmount: number;
    totalWithVAT: number;
  } | null>(null);

  const calculateVAT = () => {
    const baseAmount = parseFloat(amount);
    if (isNaN(baseAmount) || baseAmount <= 0) return;
    
    const vatRate = 0.075; // 7.5% VAT rate in Nigeria
    const vatAmount = baseAmount * vatRate;
    const totalWithVAT = baseAmount + vatAmount;
    
    setResult({
      vatAmount,
      totalWithVAT
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="border border-border bg-card p-6 rounded-lg">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Quick VAT Calculator</h3>
        <p className="text-xs text-muted-foreground mt-1">Calculate VAT on goods/services value</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Enter Goods/Services Value (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100000 (value of goods/services sold)"
            className="w-full border border-border rounded-md px-3 py-2 text-foreground"
          />
        </div>
        
        <Button onClick={calculateVAT} className="w-full">
          Calculate VAT (7.5%)
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-secondary rounded-md">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Goods/Services Value:</span>
                <span className="font-medium text-foreground">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (7.5%):</span>
                <span className="font-medium text-foreground">{formatCurrency(result.vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">Total with VAT:</span>
                <span className="font-semibold text-primary">{formatCurrency(result.totalWithVAT)}</span>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          * Standard VAT rate of 7.5% applied. For complex calculations, consult a tax professional.
        </p>
      </div>
    </div>
  );
}