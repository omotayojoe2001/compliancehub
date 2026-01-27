import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

interface CalculatorResult {
  taxType: string;
  taxableAmount: number;
  taxRate: string;
  estimatedTax: number;
}

export default function Calculator() {
  const [taxType, setTaxType] = useState("vat");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const handleCalculate = () => {
    // This would normally send to backend
    // For demo, we'll show a mock result
    const numAmount = parseFloat(amount) || 0;
    
    const rates: Record<string, { rate: number; label: string }> = {
      vat: { rate: 0.075, label: "7.5%" },
      withholding: { rate: 0.1, label: "10%" },
      company: { rate: 0.3, label: "30%" },
    };

    const { rate, label } = rates[taxType] || rates.vat;
    
    setResult({
      taxType: taxType.toUpperCase(),
      taxableAmount: numAmount,
      taxRate: label,
      estimatedTax: numAmount * rate,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Tax Calculator (Just a Tool)</h1>
          <p className="text-sm text-muted-foreground">
            Get a quick estimate - this doesn't replace your accountant
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Step 1: Enter Your Numbers
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  What type of tax?
                </label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="vat">VAT (Value Added Tax)</option>
                  <option value="withholding">Withholding Tax</option>
                  <option value="company">Company Income Tax</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  How much money? (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button onClick={handleCalculate} className="w-full">
                Calculate My Estimate
              </Button>
            </div>
          </div>

          {/* Result */}
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Step 2: Your Estimate
            </h3>

            {result ? (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">Tax Type</span>
                  <span className="text-sm font-medium text-foreground">
                    {result.taxType}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">Your Amount</span>
                  <span className="text-sm font-medium text-foreground">
                    ₦{result.taxableAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">Tax Rate</span>
                  <span className="text-sm font-medium text-foreground">
                    {result.taxRate}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-semibold text-foreground">
                    Estimated Tax You Owe
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    ₦{result.estimatedTax.toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ This is just an estimate! Check with your accountant for the real amount.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Fill in the numbers on the left and click "Calculate" to see your estimate.
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            📝 <strong>Important:</strong> This calculator only gives you estimates. It does NOT:
            <br />• Save official records
            <br />• Replace your accountant  
            <br />• File taxes for you
            <br />• Give you the exact amount you owe
            <br /><br />
            Always check with a tax professional for accurate advice!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
