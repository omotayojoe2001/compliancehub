import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { nigerianTaxCalculator, TaxCalculationResult } from "@/lib/nigerianTaxCalculator";
import { Calculator as CalculatorIcon, Info } from "lucide-react";

export default function Calculator() {
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [deductions, setDeductions] = useState<string>("");
  const [use2026Rates, setUse2026Rates] = useState<boolean>(false);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);

  const calculateTax = () => {
    const income = parseFloat(grossIncome) || 0;
    const allowableDeductions = parseFloat(deductions) || 0;
    
    const calculation = nigerianTaxCalculator.calculateTax(income, allowableDeductions, use2026Rates);
    setResult(calculation);
  };

  const loadExample = () => {
    setGrossIncome("5000000");
    setDeductions("500000");
    const example = nigerianTaxCalculator.getExampleCalculation();
    setResult(example);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            How Much Tax Will I Pay?
          </h1>
          <p className="text-sm text-muted-foreground">
            Find out exactly how much money the government will take from your salary
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tell Us About Your Money</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="grossIncome">How much money do you make in a year? (₦)</Label>
                <Input
                  id="grossIncome"
                  type="number"
                  placeholder="e.g., 1200000 (that's ₦100,000 per month)"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is your total salary before anything is removed
                </p>
              </div>
              
              <div>
                <Label htmlFor="deductions">Money you spent on business/work (₦)</Label>
                <Input
                  id="deductions"
                  type="number"
                  placeholder="e.g., 200000 (optional - leave blank if unsure)"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Things like transport, phone bills for work, training courses
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={calculateTax} className="flex-1">
                  Calculate My Tax
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Show Me Example
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded border border-green-200">
                <input
                  type="checkbox"
                  id="use2026Rates"
                  checked={use2026Rates}
                  onChange={(e) => setUse2026Rates(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="use2026Rates" className="text-sm font-medium text-green-800">
                  🆕 Use NEW 2026 Rules (Pay Less Tax!)
                </label>
              </div>
              <p className="text-xs text-green-700 ml-6">
                With new 2026 rules, if you earn less than ₦100,000 per month, you pay ZERO tax!
              </p>
            </div>
          </Card>

          {/* Results Section */}
          {result && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Here's What You'll Pay</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Money you make in a year:</span>
                  <span className="font-medium">{nigerianTaxCalculator.formatCurrency(result.grossIncome)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Government relief (you keep this):</span>
                  <span className="font-medium text-green-600">-{nigerianTaxCalculator.formatCurrency(result.cra)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work expenses (you keep this):</span>
                  <span className="font-medium text-green-600">-{nigerianTaxCalculator.formatCurrency(result.allowableDeductions)}</span>
                </div>
                
                <hr className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Money that gets taxed:</span>
                  <span className="font-medium">{nigerianTaxCalculator.formatCurrency(result.taxableIncome)}</span>
                </div>
                
                <div className="flex justify-between text-lg bg-red-50 p-3 rounded">
                  <span className="font-semibold">Tax you must pay:</span>
                  <span className="font-bold text-red-600">{nigerianTaxCalculator.formatCurrency(result.taxPayable)}</span>
                </div>
                
                <div className="flex justify-between text-lg bg-green-50 p-3 rounded">
                  <span className="font-semibold">Money you take home:</span>
                  <span className="font-bold text-green-600">{nigerianTaxCalculator.formatCurrency(result.netIncome)}</span>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    Out of every ₦100 you earn, you pay ₦{result.effectiveRate.toFixed(0)} as tax
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Simple Explanation */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h2 className="text-lg font-semibold mb-4 text-yellow-800">How This Works (Simple Explanation)</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">1</span>
              <div>
                <p className="font-medium">You tell us your total salary for the year</p>
                <p className="text-yellow-700">This is everything before any deductions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">2</span>
              <div>
                <p className="font-medium">Government gives you free money (relief allowance)</p>
                <p className="text-yellow-700">This is money you don't pay tax on - it's yours to keep</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">3</span>
              <div>
                <p className="font-medium">We subtract your work expenses</p>
                <p className="text-yellow-700">Money you spent to do your job doesn't get taxed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">4</span>
              <div>
                <p className="font-medium">Whatever is left gets taxed</p>
                <p className="text-yellow-700">The government takes a percentage of this remaining money</p>
              </div>
            </div>
          </div>
        </Card>
        {result && result.breakdown.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Band Breakdown</h2>
            <div className="space-y-2">
              {result.breakdown.map((band, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div>
                    <span className="font-medium">{band.band}</span>
                    <span className="text-sm text-muted-foreground ml-2">({(band.rate * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{nigerianTaxCalculator.formatCurrency(band.tax)}</div>
                    <div className="text-xs text-muted-foreground">
                      on {nigerianTaxCalculator.formatCurrency(band.taxableAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tax Bands Reference */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Nigerian Personal Income Tax Rates (2024)
          </h2>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between py-1">
              <span>First ₦300,000</span>
              <span className="font-medium">7%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Next ₦300,000 (₦300,001 - ₦600,000)</span>
              <span className="font-medium">11%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Next ₦500,000 (₦600,001 - ₦1,100,000)</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Next ₦500,000 (₦1,100,001 - ₦1,600,000)</span>
              <span className="font-medium">19%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Next ₦1,600,000 (₦1,600,001 - ₦3,200,000)</span>
              <span className="font-medium">21%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Above ₦3,200,000</span>
              <span className="font-medium">24%</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-sm text-blue-800">
              <strong>CRA Formula:</strong> max(₦200,000, 1% of Gross Income) + (20% of Gross Income)
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}