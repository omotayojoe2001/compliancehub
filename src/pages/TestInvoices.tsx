import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  issue_date: string;
  total_amount: number;
  status: string;
}

export default function TestInvoices() {
  const userId = 'f879bc6f-8ea9-47eb-8ff9-4495df531a53';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    console.log('⏱️ START:', new Date().toISOString());
    try {
      const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, client_name, total_amount')
        .eq('user_id', userId)
        .limit(10);
      
      console.log('⏱️ END:', new Date().toISOString(), 'Count:', data?.length);
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
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>E-Invoicing System (FAST)</h1>
      
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Invoices ({invoices.length})</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No invoices</div>
        ) : (
          <div>
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              >
                <div>
                  <p style={{ fontWeight: '500' }}>{invoice.invoice_number}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>{invoice.client_name}</p>
                </div>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {formatCurrency(invoice.total_amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
