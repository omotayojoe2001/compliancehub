import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContextClean';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download, Trash2 } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_address?: string;
  issue_date: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export default function InvoicesWorking() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    }
  }, [user?.id]);

  const loadInvoices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setInvoices(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>E-Invoicing System</h1>
          <p style={{ color: '#666' }}>Create professional invoices with your company branding</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Invoices</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No invoices created yet. Create your first professional invoice.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>{invoice.invoice_number}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                    <span>{invoice.client_name}</span>
                    <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      backgroundColor: invoice.status === 'paid' ? '#dcfce7' : '#f3f4f6',
                      color: invoice.status === 'paid' ? '#166534' : '#374151',
                      fontSize: '12px'
                    }}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {formatCurrency(invoice.total_amount)}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
