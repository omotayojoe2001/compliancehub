interface TaxBand {
  min: number;
  max: number;
  rate: number;
}

const NIGERIAN_TAX_BANDS_2026: TaxBand[] = [
  { min: 0, max: 800000, rate: 0.00 },        // First ₦800,000 at 0% (NEW 2026 REFORM)
  { min: 800000, max: 1100000, rate: 0.15 },  // Next ₦300,000 at 15%
  { min: 1100000, max: 1600000, rate: 0.19 }, // Next ₦500,000 at 19%
  { min: 1600000, max: 3200000, rate: 0.21 }, // Next ₦1,600,000 at 21%
  { min: 3200000, max: Infinity, rate: 0.25 } // Above ₦3,200,000 at 25% (increased)
];

const NIGERIAN_TAX_BANDS: TaxBand[] = [
  { min: 0, max: 300000, rate: 0.07 },        // First ₦300,000 at 7%
  { min: 300000, max: 600000, rate: 0.11 },   // Next ₦300,000 at 11%
  { min: 600000, max: 1100000, rate: 0.15 },  // Next ₦500,000 at 15%
  { min: 1100000, max: 1600000, rate: 0.19 }, // Next ₦500,000 at 19%
  { min: 1600000, max: 3200000, rate: 0.21 }, // Next ₦1,600,000 at 21%
  { min: 3200000, max: Infinity, rate: 0.24 } // Above ₦3,200,000 at 24%
];

export interface TaxCalculationResult {
  grossIncome: number;
  cra: number;
  allowableDeductions: number;
  taxableIncome: number;
  taxPayable: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: TaxBandBreakdown[];
}

export interface TaxBandBreakdown {
  band: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}

export const nigerianTaxCalculator = {
  // Calculate Consolidated Relief Allowance (CRA)
  calculateCRA(grossIncome: number): number {
    // CRA = max(₦200,000, 1% of Gross Income) + (20% of Gross Income)
    const onePercent = grossIncome * 0.01;
    const twentyPercent = grossIncome * 0.20;
    const baseCRA = Math.max(200000, onePercent);
    
    return baseCRA + twentyPercent;
  },

  // Calculate tax using Nigerian progressive tax bands
  calculateProgressiveTax(taxableIncome: number, use2026Rates: boolean = false): { tax: number; breakdown: TaxBandBreakdown[] } {
    if (taxableIncome <= 0) {
      return { tax: 0, breakdown: [] };
    }

    const bands = use2026Rates ? NIGERIAN_TAX_BANDS_2026 : NIGERIAN_TAX_BANDS;
    let totalTax = 0;
    let remainingIncome = taxableIncome;
    const breakdown: TaxBandBreakdown[] = [];

    for (const band of bands) {
      if (remainingIncome <= 0) break;

      const bandWidth = band.max - band.min;
      const taxableInThisBand = Math.min(remainingIncome, bandWidth);
      const taxForThisBand = taxableInThisBand * band.rate;

      if (taxableInThisBand > 0) {
        breakdown.push({
          band: band.max === Infinity 
            ? `Above ₦${band.min.toLocaleString()}` 
            : `₦${band.min.toLocaleString()} - ₦${band.max.toLocaleString()}`,
          taxableAmount: taxableInThisBand,
          rate: band.rate,
          tax: taxForThisBand
        });

        totalTax += taxForThisBand;
        remainingIncome -= taxableInThisBand;
      }
    }

    return { tax: totalTax, breakdown };
  },

  // Main calculation function
  calculateTax(grossIncome: number, allowableDeductions: number = 0, use2026Rates: boolean = false): TaxCalculationResult {
    // Step 1: Calculate CRA
    const cra = this.calculateCRA(grossIncome);

    // Step 2: Calculate taxable income
    const taxableIncome = Math.max(0, grossIncome - cra - allowableDeductions);

    // Step 3: Calculate tax using progressive bands
    const { tax: taxPayable, breakdown } = this.calculateProgressiveTax(taxableIncome, use2026Rates);

    // Step 4: Calculate net income and effective rate
    const netIncome = grossIncome - taxPayable;
    const effectiveRate = grossIncome > 0 ? (taxPayable / grossIncome) * 100 : 0;

    return {
      grossIncome,
      cra,
      allowableDeductions,
      taxableIncome,
      taxPayable,
      netIncome,
      effectiveRate,
      breakdown
    };
  },

  // Format currency for display
  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString()}`;
  },

  // Get tax band information
  getTaxBands(): TaxBand[] {
    return NIGERIAN_TAX_BANDS;
  },

  // Example calculation for testing
  getExampleCalculation(): TaxCalculationResult {
    return this.calculateTax(5000000, 500000);
  }
};