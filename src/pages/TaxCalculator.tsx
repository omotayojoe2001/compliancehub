import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Info } from "lucide-react";
import { SubscriptionGate } from "@/components/SubscriptionGate";

interface TaxBreakdown {
  band: string;
  income: number;
  rate: string;
  tax: number;
}

interface CalculatorResult {
  grossIncome: number;
  allowableDeductions: number;
  cra: number;
  taxableIncome: number;
  totalTax: number;
  breakdown: TaxBreakdown[];
}

const TAX_BANDS = [
  { min: 0, max: 300000, rate: 0.07, label: "First ₦300,000 @ 7%" },
  { min: 300000, max: 600000, rate: 0.11, label: "Next ₦300,000 @ 11%" },
  { min: 600000, max: 1100000, rate: 0.15, label: "Next ₦500,000 @ 15%" },
  { min: 1100000, max: 1600000, rate: 0.19, label: "Next ₦500,000 @ 19%" },
  { min: 1600000, max: 3200000, rate: 0.21, label: "Next ₦1,600,000 @ 21%" },
  { min: 3200000, max: Infinity, rate: 0.24, label: "Above ₦3,200,000 @ 24%" },
];

function calculateCRA(grossIncome: number): number {
  const onePercent = grossIncome * 0.01;
  const higherOfFixed = Math.max(200000, onePercent);
  const twentyPercent = grossIncome * 0.2;
  return higherOfFixed + twentyPercent;
}

function calculateTax(taxableIncome: number): { total: number; breakdown: TaxBreakdown[] } {
  if (taxableIncome <= 0) {
    return { total: 0, breakdown: [] };
  }

  let remaining = taxableIncome;
  let totalTax = 0;
  const breakdown: TaxBreakdown[] = [];

  for (const band of TAX_BANDS) {
    if (remaining <= 0) break;

    const bandSize = band.max - band.min;
    const incomeInBand = Math.min(remaining, bandSize);
    const taxInBand = incomeInBand * band.rate;

    if (incomeInBand > 0) {
      breakdown.push({
        band: band.label,
        income: incomeInBand,
        rate: `${(band.rate * 100).toFixed(0)}%`,
        tax: taxInBand,
      });
      totalTax += taxInBand;
      remaining -= incomeInBand;
    }
  }

  return { total: totalTax, breakdown };
}

export default function TaxCalculator() {
  const [grossIncome, setGrossIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const handleCalculate = () => {
    const income = parseFloat(grossIncome.replace(/,/g, "")) || 0;
    const allowable = parseFloat(deductions.replace(/,/g, "")) || 0;

    if (income <= 0) {
      return;
    }

    const cra = calculateCRA(income);
    const taxableIncome = Math.max(0, income - cra - allowable);
    const { total, breakdown } = calculateTax(taxableIncome);

    setResult({
      grossIncome: income,
      allowableDeductions: allowable,
      cra,
      taxableIncome,
      totalTax: total,
      breakdown,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG").format(Math.round(value));
  };

  const handleInputChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Remove non-numeric characters except commas
    const cleaned = value.replace(/[^0-9]/g, "");
    // Format with commas
    const formatted = cleaned ? parseInt(cleaned).toLocaleString("en-NG") : "";
    setter(formatted);
  };

  return (
    <SubscriptionGate feature="Tax Calculator">
      <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              ComplianceHub
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            Nigeria Self-Assessment Tax Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Calculate your personal income tax using official FIRS rates and
            Consolidated Relief Allowance (CRA).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Enter Your Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Annual Gross Income (₦)
                </label>
                <input
                  type="text"
                  value={grossIncome}
                  onChange={(e) => handleInputChange(e.target.value, setGrossIncome)}
                  placeholder="e.g. 5,000,000"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Your total annual income before any deductions
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Allowable Deductions (₦)
                </label>
                <input
                  type="text"
                  value={deductions}
                  onChange={(e) => handleInputChange(e.target.value, setDeductions)}
                  placeholder="e.g. 500,000"
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Business expenses, pension, NHF, life insurance, etc.
                </p>
              </div>

              <Button onClick={handleCalculate} className="w-full">
                Calculate Tax
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-6 border border-border bg-secondary p-4">
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  CRA Formula
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                CRA = Higher of (₦200,000 or 1% of Gross Income) + 20% of Gross
                Income
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Calculation Result
            </h3>

            {result ? (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Gross Income
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ₦{formatCurrency(result.grossIncome)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Allowable Deductions
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ₦{formatCurrency(result.allowableDeductions)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Consolidated Relief (CRA)
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ₦{formatCurrency(result.cra)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Taxable Income
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ₦{formatCurrency(result.taxableIncome)}
                  </span>
                </div>

                {/* Tax Breakdown */}
                {result.breakdown.length > 0 && (
                  <div className="border-b border-border pb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tax Breakdown
                    </p>
                    <div className="space-y-1">
                      {result.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs text-muted-foreground"
                        >
                          <span>
                            ₦{formatCurrency(item.income)} @ {item.rate}
                          </span>
                          <span>₦{formatCurrency(item.tax)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-sm font-semibold text-foreground">
                    Total Tax Payable
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    ₦{formatCurrency(result.totalTax)}
                  </span>
                </div>

                {/* Effective Rate */}
                {result.grossIncome > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Effective Tax Rate</span>
                      <span>
                        {((result.totalTax / result.grossIncome) * 100).toFixed(
                          2
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter your gross income and click Calculate to see your
                estimated tax.
              </p>
            )}
          </div>
        </div>

        {/* Tax Bands Reference */}
        <div className="mt-8 border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Nigeria Personal Income Tax Bands
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Band
                  </th>
                  <th className="py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Taxable Income (₦)
                  </th>
                  <th className="py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">1</td>
                  <td className="py-2 text-muted-foreground">First 300,000</td>
                  <td className="py-2 text-right text-foreground">7%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">2</td>
                  <td className="py-2 text-muted-foreground">Next 300,000</td>
                  <td className="py-2 text-right text-foreground">11%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">3</td>
                  <td className="py-2 text-muted-foreground">Next 500,000</td>
                  <td className="py-2 text-right text-foreground">15%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">4</td>
                  <td className="py-2 text-muted-foreground">Next 500,000</td>
                  <td className="py-2 text-right text-foreground">19%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 text-foreground">5</td>
                  <td className="py-2 text-muted-foreground">Next 1,600,000</td>
                  <td className="py-2 text-right text-foreground">21%</td>
                </tr>
                <tr>
                  <td className="py-2 text-foreground">6</td>
                  <td className="py-2 text-muted-foreground">Above 3,200,000</td>
                  <td className="py-2 text-right text-foreground">24%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> This calculator provides estimates based
          on standard Nigeria personal income tax rates. Actual tax obligations
          may vary based on specific circumstances, state of residence, and
          current regulations. Consult a qualified tax professional for accurate
          advice.
        </p>

        {/* CTA */}
        <div className="mt-8 border border-primary bg-primary/5 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Never Miss a Tax Deadline
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Get automated WhatsApp and email reminders for all your compliance
            obligations.
          </p>
          <Link to="/register">
            <Button>Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </div>
    </SubscriptionGate>
  );
}
