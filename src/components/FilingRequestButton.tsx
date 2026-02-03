import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { filingService } from '@/lib/filingService';
import { paymentService } from '@/lib/paymentService';

interface FilingRequestButtonProps {
  totalIncome: number;
  totalExpenses: number;
  totalVAT: number;
  transactionCount: number;
}

export function FilingRequestButton({ 
  totalIncome, 
  totalExpenses, 
  totalVAT, 
  transactionCount 
}: FilingRequestButtonProps) {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'preview' | 'payment' | 'success'>('preview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRequestFiling = async () => {
    if (!user?.id || !currentCompany?.id) return;
    
    // Check if Paystack is loaded
    if (!window.PaystackPop) {
      alert('Payment system not loaded. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);
    try {
      // Create filing request
      const filingRequestId = await filingService.createFilingRequest(user.id, {
        companyProfileId: currentCompany.id,
        filingType: 'tax_filing',
        filingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
        amount: 10000
      });

      console.log('Filing request created:', filingRequestId);

      // Initialize payment
      await paymentService.initializePayment({
        email: user.email || '',
        amount: 1000000, // ₦10,000 in kobo (10,000 * 100)
        plan: 'filing_service',
        businessName: currentCompany.name,
        filingRequestId,
        metadata: {
          service_type: 'professional_filing',
          company_id: currentCompany.id,
          filing_request_id: filingRequestId
        }
      });

      setStep('success');
    } catch (error) {
      console.error('Error requesting filing:', error);
      alert('Error requesting filing service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) {
    return (
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Professional Filing Services</h3>
              <p className="text-sm text-blue-700">Let our experts handle your tax filing</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Request Filing Service
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Professional Filing Service</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowModal(false)}
          >
            ×
          </Button>
        </div>

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's Included:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Complete tax return preparation</li>
                <li>• VAT filing and calculations</li>
                <li>• Professional review by certified accountants</li>
                <li>• Compliance with Nigerian tax regulations</li>
                <li>• Direct submission to relevant authorities</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Your Data Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span className="font-medium text-green-600">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-medium text-red-600">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Owed:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(totalVAT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="font-medium">{transactionCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Service Fee</h4>
                <div className="text-2xl font-bold text-green-600 mb-2">₦10,000</div>
                <p className="text-sm text-green-700">One-time payment</p>
                <p className="text-xs text-green-600 mt-2">Separate from your subscription</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Important Note</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Our team will automatically collect all your cashbook data, company profile, 
                    and transaction history for accurate filing. This service is handled by 
                    certified professionals.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleRequestFiling}
                disabled={loading}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Pay ₦10,000 & Request Filing'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">Filing Request Submitted!</h3>
            <p className="text-gray-600">
              Your filing request has been submitted to our professional team. 
              We'll process your tax filing and contact you with updates.
            </p>
            <Button onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}