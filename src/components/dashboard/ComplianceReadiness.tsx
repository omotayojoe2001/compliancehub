import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContextClean';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FileText,
  Shield,
  X
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  name: string;
  status: 'compliant' | 'due_soon' | 'overdue' | 'not_registered';
  dueDate?: string;
  description: string;
  actionUrl?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export function ComplianceReadiness() {
  const { user } = useAuth();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [overallRisk, setOverallRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    taxType: string;
    amount: number;
    description: string;
  }>({ isOpen: false, taxType: '', amount: 0, description: '' });

  useEffect(() => {
    if (user) {
      fetchComplianceStatus();
    }
  }, [user]);

  const fetchComplianceStatus = async () => {
    try {
      // Fetch user's tax obligations
      const { data: obligations } = await supabase
        .from('tax_obligations')
        .select('*')
        .eq('user_id', user?.id)
        .order('next_due_date', { ascending: true });

      console.log('🔍 ComplianceReadiness obligations:', obligations);

      // Generate compliance items based on obligations
      const complianceItems: ComplianceItem[] = [
        {
          id: 'cac_annual',
          name: 'CAC Annual Returns',
          status: getStatusFromObligations(obligations, 'CAC'),
          dueDate: getNextDueDate(obligations, 'CAC'),
          description: 'Annual returns filing with Corporate Affairs Commission',
          actionUrl: 'cac',
          riskLevel: 'high'
        },
        {
          id: 'vat_returns',
          name: 'VAT Returns',
          status: getStatusFromObligations(obligations, 'VAT'),
          dueDate: getNextDueDate(obligations, 'VAT'),
          description: 'Monthly VAT returns filing with FIRS',
          actionUrl: 'vat',
          riskLevel: 'medium'
        },
        {
          id: 'paye_returns',
          name: 'PAYE Returns',
          status: getStatusFromObligations(obligations, 'PAYE'),
          dueDate: getNextDueDate(obligations, 'PAYE'),
          description: 'Monthly PAYE returns for employees',
          actionUrl: 'paye',
          riskLevel: 'medium'
        },
        {
          id: 'self_assessment',
          name: 'Self Assessment Tax',
          status: getStatusFromObligations(obligations, 'Self Assessment'),
          dueDate: getNextDueDate(obligations, 'Self Assessment'),
          description: 'Annual personal income tax filing',
          actionUrl: 'personal',
          riskLevel: 'high'
        }
      ];

      setItems(complianceItems);
      
      // Calculate overall risk
      const hasOverdue = complianceItems.some(item => item.status === 'overdue');
      const hasDueSoon = complianceItems.some(item => item.status === 'due_soon');
      
      if (hasOverdue) {
        setOverallRisk('high');
      } else if (hasDueSoon) {
        setOverallRisk('medium');
      } else {
        setOverallRisk('low');
      }
      
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
    }
    setLoading(false);
  };

  const getStatusFromObligations = (obligations: any[], type: string): ComplianceItem['status'] => {
    if (!obligations) return 'not_registered';
    
    console.log(`🔍 Checking ${type} in obligations:`, obligations.map(o => o.obligation_type));
    
    const relevantObligation = obligations.find(o => 
      o.obligation_type?.toLowerCase().includes(type.toLowerCase()) &&
      o.payment_status !== 'paid'
    );
    
    console.log(`🔍 Found ${type} obligation:`, relevantObligation);
    
    if (!relevantObligation) return 'not_registered';
    
    const dueDate = new Date(relevantObligation.next_due_date);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 7) return 'due_soon';
    return 'compliant';
  };

  const getNextDueDate = (obligations: any[], type: string): string | undefined => {
    const relevantObligation = obligations?.find(o => 
      o.obligation_type?.toLowerCase().includes(type.toLowerCase()) &&
      o.payment_status !== 'paid'
    );
    return relevantObligation?.next_due_date;
  };

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'due_soon':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'not_registered':
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Up to Date</Badge>;
      case 'due_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'not_registered':
        return <Badge variant="secondary">Not Registered</Badge>;
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  const handlePayment = async () => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user?.email || 'user@example.com',
      amount: paymentModal.amount * 100,
      currency: 'NGN',
      ref: `tax_filing_${paymentModal.taxType}_${Date.now()}`,
      metadata: {
        service_type: 'tax_filing',
        tax_type: paymentModal.taxType,
        filing_description: paymentModal.description
      },
      callback: function(response) {
        console.log('Payment successful:', response);
        setPaymentModal(prev => ({ ...prev, isOpen: false }));
        alert('Payment successful! We will process your filing request.');
      },
      onClose: function() {
        console.log('Payment popup closed');
      }
    });
    handler.openIframe();
  };

  const handleFileNow = (taxType: string, description: string) => {
    const amounts = {
      'cac': 50000,
      'vat': 25000,
      'paye': 30000,
      'personal': 15000
    };
    
    setPaymentModal({
      isOpen: true,
      taxType,
      amount: amounts[taxType as keyof typeof amounts] || 25000,
      description
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Compliance Readiness</h2>
            <p className="text-sm text-muted-foreground">
              Your current compliance status at a glance
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Risk</p>
          <p className={`text-lg font-semibold ${getRiskColor(overallRisk)}`}>
            {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.dueDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(item.status)}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFileNow(item.actionUrl!, item.description)}
              >
                <FileText className="h-3 w-3 mr-1" />
                File Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Reminder:</strong> This dashboard shows your compliance status based on the information you've provided. 
          We provide reminders and guidance only. You are responsible for actual filings on official government portals.
        </p>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{paymentModal.description} Filing Service</h3>
              <Button variant="ghost" size="sm" onClick={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₦{paymentModal.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Professional filing service</p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePayment}>
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}