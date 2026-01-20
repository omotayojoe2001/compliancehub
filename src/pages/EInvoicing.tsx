import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Eye, Upload, Building2 } from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useProfile } from '@/hooks/useProfileClean';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
}

export default function EInvoicing() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[]
  });

  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    }
  }, [user?.id]);

  const loadInvoices = async () => {
    if (!user?.id) return;
    
    try {
      const data = await comprehensiveDbService.getInvoices(user.id);
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addInvoiceItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const removeInvoiceItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const generateInvoice = async () => {
    if (!user?.id) return;
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const invoiceNumber = `INV-${Date.now()}`;
    
    const newInvoice = {
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_name: formData.clientName,
      client_address: formData.clientAddress,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      vat_amount: vatAmount,
      total_amount: total,
      status: 'draft' as const,
      company_logo_url: companyLogo
    };

    try {
      const createdInvoice = await comprehensiveDbService.createInvoice(newInvoice);
      
      // Create invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: createdInvoice.id!,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.rate,
        total_price: item.amount
      }));
      
      await comprehensiveDbService.createInvoiceItems(invoiceItems);
      
      // Reload invoices
      await loadInvoices();
      
      // Reset form
      setFormData({
        clientName: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <SubscriptionGate feature="E-Invoicing">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">E-Invoicing System</h1>
              <p className="text-muted-foreground text-sm">Create professional invoices with your company branding</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="text-sm">
                <Upload className="h-4 w-4 mr-2" />
                <span className="truncate">Upload Logo</span>
              </Button>
              <Button onClick={() => setShowCreateForm(true)} className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="truncate">Create Invoice</span>
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {/* Company Logo Preview */}
          {companyLogo && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <img src={companyLogo} alt="Company Logo" className="h-16 w-16 object-contain" />
                <div>
                  <p className="font-medium">Company Logo Uploaded</p>
                  <p className="text-sm text-muted-foreground">This will appear on all your invoices</p>
                </div>
              </div>
            </Card>
          )}

          {/* Create Invoice Form */}
          {showCreateForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Invoice</h3>
              
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2"
                    placeholder="Client company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Address</label>
                  <textarea
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Client address"
                    required
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Invoice Items</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="w-full border border-border rounded-md px-3 py-2 text-sm"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full border border-border rounded-md px-3 py-2 text-sm"
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1">Rate (₦)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full border border-border rounded-md px-3 py-2 text-sm"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1">Amount</label>
                        <input
                          type="text"
                          value={formatCurrency(item.amount)}
                          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (7.5%):</span>
                      <span>{formatCurrency(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={generateInvoice}>Create Invoice</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Invoices List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Invoices</h3>
            
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? 'Loading invoices...' : 'No invoices created yet. Create your first professional invoice.'}
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{invoice.client_name}</span>
                          <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(invoice.total_amount)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}