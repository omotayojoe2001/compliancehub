import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { filingService } from '@/lib/filingService';
import { paymentService } from '@/lib/paymentService';
import { useAuth } from '@/contexts/AuthContextClean';

interface FilingRequestCardProps {
  companyProfileId: string;
  companyName: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
}

export function FilingRequestCard({ 
  companyProfileId, 
  companyName, 
  transactionCount,
  totalIncome,
  totalExpenses 
}: FilingRequestCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filingPrice, setFilingPrice] = useState(10000);

  useEffect(() => {
    const loadPrice = async () => {
      const price = await paymentService.getPlanPrice('filing_service');
      setFilingPrice(price / 100); // Convert kobo to naira
    };
    loadPrice();
  }, [showDetails]); // Reload when details toggle

  const handleRequestFiling = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create filing request
      const filingRequestId = await filingService.createFilingRequest(user.id, {
        companyProfileId,
        filingType: 'tax_filing',
        filingPeriod: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
        amount: filingPrice
      });

      // Process payment
      await filingService.processFilingPayment(filingRequestId, user.email!);
      
    } catch (error) {
      console.error('Filing request error:', error);
      alert('Error processing filing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Professional Filing Services
            </h3>
            <p className="text-sm text-gray-600">
              Let our experts handle your tax filing with your cashbook data
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {filingService.formatCurrency(filingPrice)}
          </div>
          <div className="text-xs text-gray-500">One-time fee</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-white rounded-lg">
          <div className="font-semibold text-gray-900">{transactionCount}</div>
          <div className="text-gray-600">Transactions</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg">
          <div className="font-semibold text-green-600">
            {filingService.formatCurrency(totalIncome)}
          </div>
          <div className="text-gray-600">Income</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg">
          <div className="font-semibold text-red-600">
            {filingService.formatCurrency(totalExpenses)}
          </div>
          <div className="text-gray-600">Expenses</div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2">What's included:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Complete transaction analysis from your cashbook
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Professional tax return preparation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              VAT, PAYE, and CIT filing as applicable
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Compliance review and recommendations
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              5-7 business days processing time
            </li>
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <Button 
          onClick={handleRequestFiling}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Request Filing Service
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="h-3 w-3" />
        <span>
          We'll automatically collect all your {companyName} transaction data for filing.
        </span>
      </div>
    </Card>
  );
}