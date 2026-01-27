import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Lock, Crown } from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface TaxCalculation {
  type: string;
  amount: number;
  rate: number;
  result: number;
}

export default function SmartTaxCalculator() {
  const { planType: plan } = useSubscription();
  const [activeTab, setActiveTab] = useState('vat');
  const [calculations, setCalculations] = useState<TaxCalculation[]>([]);
  
  // VAT Calculator
  const [vatData, setVatData] = useState({
    revenue: '',
    vatRate: 7.5
  });

  // PAYE Calculator
  const [payeData, setPayeData] = useState({
    grossSalary: '',
    pension: '',
    nhf: '',
    lifeInsurance: ''
  });

  // CIT Calculator
  const [citData, setCitData] = useState({
    grossIncome: '',
    allowableDeductions: '',
    capitalAllowances: ''
  });

  // Withholding Tax Calculator
  const [whtData, setWhtData] = useState({
    contractValue: '',
    whtRate: 5
  });

  // Capital Gains Calculator
  const [cgData, setCgData] = useState({
    salePrice: '',
    costPrice: '',
    improvementCosts: ''
  });

  const hasAccess = (feature: string) => {
    switch (feature) {
      case 'vat':
        return ['basic', 'pro', 'enterprise'].includes(plan);
      case 'paye':
      case 'cit':
      case 'withholding':
        return ['pro', 'enterprise'].includes(plan);
      case 'capital-gains':
        return plan === 'enterprise';
      default:
        return false;
    }
  };

  const calculateVAT = () => {
    const revenue = parseFloat(vatData.revenue) || 0;
    const vatAmount = revenue * (vatData.vatRate / 100);
    
    const calculation: TaxCalculation = {
      type: 'VAT',
      amount: revenue,
      rate: vatData.vatRate,
      result: vatAmount
    };
    
    setCalculations([calculation, ...calculations]);
  };

  const calculatePAYE = () => {
    const gross = parseFloat(payeData.grossSalary) || 0;
    const pension = parseFloat(payeData.pension) || 0;
    const nhf = parseFloat(payeData.nhf) || 0;
    const insurance = parseFloat(payeData.lifeInsurance) || 0;
    
    // Simplified PAYE calculation
    const cra = Math.max(200000, gross * 0.01) + (gross * 0.2);
    const taxableIncome = Math.max(0, gross - cra - pension - nhf - insurance);
    
    let paye = 0;
    if (taxableIncome > 0) {
      // Apply tax bands
      const bands = [
        { min: 0, max: 300000, rate: 0.07 },
        { min: 300000, max: 600000, rate: 0.11 },
        { min: 600000, max: 1100000, rate: 0.15 },
        { min: 1100000, max: 1600000, rate: 0.19 },
        { min: 1600000, max: 3200000, rate: 0.21 },
        { min: 3200000, max: Infinity, rate: 0.24 }
      ];
      
      let remaining = taxableIncome;
      for (const band of bands) {
        if (remaining <= 0) break;
        const bandSize = band.max - band.min;
        const taxableInBand = Math.min(remaining, bandSize);
        paye += taxableInBand * band.rate;
        remaining -= taxableInBand;
      }
    }
    
    const calculation: TaxCalculation = {
      type: 'PAYE',
      amount: gross,
      rate: (paye / gross) * 100,
      result: paye
    };
    
    setCalculations([calculation, ...calculations]);
  };

  const calculateCIT = () => {
    const income = parseFloat(citData.grossIncome) || 0;
    const deductions = parseFloat(citData.allowableDeductions) || 0;
    const capitalAllowances = parseFloat(citData.capitalAllowances) || 0;
    
    const taxableProfit = Math.max(0, income - deductions - capitalAllowances);
    const cit = taxableProfit * 0.30; // 30% CIT rate
    
    const calculation: TaxCalculation = {
      type: 'Company Income Tax',
      amount: income,
      rate: 30,
      result: cit
    };
    
    setCalculations([calculation, ...calculations]);
  };

  const calculateWithholding = () => {
    const contract = parseFloat(whtData.contractValue) || 0;
    const wht = contract * (whtData.whtRate / 100);
    
    const calculation: TaxCalculation = {
      type: 'Withholding Tax',
      amount: contract,
      rate: whtData.whtRate,
      result: wht
    };
    
    setCalculations([calculation, ...calculations]);
  };

  const calculateCapitalGains = () => {
    const salePrice = parseFloat(cgData.salePrice) || 0;
    const costPrice = parseFloat(cgData.costPrice) || 0;
    const improvements = parseFloat(cgData.improvementCosts) || 0;
    
    const gain = Math.max(0, salePrice - costPrice - improvements);
    const cgt = gain * 0.10; // 10% CGT rate
    
    const calculation: TaxCalculation = {
      type: 'Capital Gains Tax',
      amount: gain,
      rate: 10,
      result: cgt
    };
    
    setCalculations([calculation, ...calculations]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const tabs = [
    { id: 'vat', name: 'VAT Calculator', plan: 'Basic+' },
    { id: 'paye', name: 'PAYE Calculator', plan: 'Pro+' },
    { id: 'cit', name: 'CIT Calculator', plan: 'Pro+' },
    { id: 'withholding', name: 'Withholding Tax', plan: 'Pro+' },
    { id: 'capital-gains', name: 'Capital Gains', plan: 'Enterprise' }
  ];

  return (
    <SubscriptionGate feature="hasAdvancedCalculator">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Smart Tax Calculator</h1>
            <p className="text-muted-foreground">
              Calculate different types of Nigerian taxes based on your subscription plan
            </p>
          </div>

          {/* Plan Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Your Plan: {plan?.toUpperCase() || 'FREE'}
                </p>
                <p className="text-sm text-blue-700">
                  {plan === 'free' && 'Upgrade to access tax calculators'}
                  {plan === 'basic' && 'Access to VAT calculations only'}
                  {plan === 'pro' && 'Access to VAT, PAYE, CIT, and Withholding Tax'}
                  {plan === 'enterprise' && 'Access to all tax calculators including Capital Gains'}
                </p>
              </div>
            </div>
          </Card>

          {/* Tax Calculator Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => hasAccess(tab.id) && setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id && hasAccess(tab.id)
                      ? 'border-blue-500 text-blue-600'
                      : hasAccess(tab.id)
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!hasAccess(tab.id)}
                >
                  {tab.name}
                  {!hasAccess(tab.id) && <Lock className="h-3 w-3" />}
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {tab.plan}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>

              {!hasAccess(activeTab) ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    This calculator requires a higher subscription plan
                  </p>
                  <Link to="/subscription">
                    <Button>Upgrade Plan</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* VAT Calculator */}
                  {activeTab === 'vat' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Monthly Revenue (₦)
                        </label>
                        <input
                          type="number"
                          value={vatData.revenue}
                          onChange={(e) => setVatData({...vatData, revenue: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Enter monthly revenue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          VAT Rate (%)
                        </label>
                        <input
                          type="number"
                          value={vatData.vatRate}
                          onChange={(e) => setVatData({...vatData, vatRate: parseFloat(e.target.value)})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          step="0.1"
                        />
                      </div>
                      <Button onClick={calculateVAT} className="w-full">
                        Calculate VAT
                      </Button>
                    </div>
                  )}

                  {/* PAYE Calculator */}
                  {activeTab === 'paye' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gross Salary (₦)
                        </label>
                        <input
                          type="number"
                          value={payeData.grossSalary}
                          onChange={(e) => setPayeData({...payeData, grossSalary: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Enter gross salary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Pension Contribution (₦)
                        </label>
                        <input
                          type="number"
                          value={payeData.pension}
                          onChange={(e) => setPayeData({...payeData, pension: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Pension contribution"
                        />
                      </div>
                      <Button onClick={calculatePAYE} className="w-full">
                        Calculate PAYE
                      </Button>
                    </div>
                  )}

                  {/* CIT Calculator */}
                  {activeTab === 'cit' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gross Income (₦)
                        </label>
                        <input
                          type="number"
                          value={citData.grossIncome}
                          onChange={(e) => setCitData({...citData, grossIncome: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Enter gross income"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Allowable Deductions (₦)
                        </label>
                        <input
                          type="number"
                          value={citData.allowableDeductions}
                          onChange={(e) => setCitData({...citData, allowableDeductions: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Business expenses"
                        />
                      </div>
                      <Button onClick={calculateCIT} className="w-full">
                        Calculate CIT
                      </Button>
                    </div>
                  )}

                  {/* Withholding Tax Calculator */}
                  {activeTab === 'withholding' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contract Value (₦)
                        </label>
                        <input
                          type="number"
                          value={whtData.contractValue}
                          onChange={(e) => setWhtData({...whtData, contractValue: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Enter contract value"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          WHT Rate (%)
                        </label>
                        <select
                          value={whtData.whtRate}
                          onChange={(e) => setWhtData({...whtData, whtRate: parseFloat(e.target.value)})}
                          className="w-full border border-border rounded-md px-3 py-2"
                        >
                          <option value={5}>5% - Professional Services</option>
                          <option value={10}>10% - Dividends</option>
                          <option value={2.5}>2.5% - Construction</option>
                        </select>
                      </div>
                      <Button onClick={calculateWithholding} className="w-full">
                        Calculate WHT
                      </Button>
                    </div>
                  )}

                  {/* Capital Gains Calculator */}
                  {activeTab === 'capital-gains' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sale Price (₦)
                        </label>
                        <input
                          type="number"
                          value={cgData.salePrice}
                          onChange={(e) => setCgData({...cgData, salePrice: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Asset sale price"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cost Price (₦)
                        </label>
                        <input
                          type="number"
                          value={cgData.costPrice}
                          onChange={(e) => setCgData({...cgData, costPrice: e.target.value})}
                          className="w-full border border-border rounded-md px-3 py-2"
                          placeholder="Original cost"
                        />
                      </div>
                      <Button onClick={calculateCapitalGains} className="w-full">
                        Calculate CGT
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Calculation Results */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Calculation History</h3>
              
              {calculations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No calculations yet. Use the calculator to see results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calculations.slice(0, 5).map((calc, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{calc.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {calc.rate}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Amount: {formatCurrency(calc.amount)}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        Tax: {formatCurrency(calc.result)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}
