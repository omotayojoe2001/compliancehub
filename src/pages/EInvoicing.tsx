import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Eye, Upload, Building2, Trash2 } from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useProfileSimple } from '@/hooks/useProfileSimple';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/lib/supabase';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  client_name: string;
  client_address: string;
  items?: InvoiceItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid';
  company_logo_url?: string;
}

export default function EInvoicing() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { profile } = useProfileSimple();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingInvoiceStatus, setEditingInvoiceStatus] = useState<Invoice['status']>('draft');
  const [companyDetails, setCompanyDetails] = useState<{
    company_name?: string;
    address?: string;
    phone?: string;
    email?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[]
  });

  useEffect(() => {
    if (user?.id) {
      loadInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentCompany?.id) {
      loadCompanyDetails();
    }
  }, [currentCompany?.id]);

  const loadInvoices = async () => {
    if (!user?.id) return;

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setLoadError("Request timed out. Please try again.");
      setLoading(false);
    }, 8000);

    setLoadError(null);
    try {
      const data = await comprehensiveDbService.getInvoices(user.id, currentCompany?.id);
      if (settled) return;
      setInvoices(data || []);
    } catch (error) {
      if (settled) return;
      console.error('Error loading invoices:', error);
      setInvoices([]);
      setLoadError("Couldn't load invoices. Please try again.");
    } finally {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const loadCompanyDetails = async () => {
    if (!currentCompany?.id) return;

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('company_name,address,phone,email')
        .eq('id', currentCompany.id)
        .single();

      if (error) throw error;
      setCompanyDetails(data || null);
    } catch (error) {
      console.error('Error loading company details:', error);
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

  const saveInvoice = async () => {
    if (!user?.id) return;
    
    const { subtotal, vatAmount, total } = calculateTotals();
    const invoiceNumber = `INV-${Date.now()}`;
    
    const newInvoice = {
      user_id: user.id,
      company_id: currentCompany?.id,
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
      if (editingInvoiceId) {
        await comprehensiveDbService.updateInvoice(editingInvoiceId, {
          client_name: formData.clientName,
          client_address: formData.clientAddress,
          subtotal,
          vat_amount: vatAmount,
          total_amount: total,
          status: editingInvoiceStatus,
          company_logo_url: companyLogo
        });

        await comprehensiveDbService.deleteInvoiceItems(editingInvoiceId);
        const updatedItems = formData.items.map(item => ({
          invoice_id: editingInvoiceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.rate,
          total_price: item.amount
        }));
        await comprehensiveDbService.createInvoiceItems(updatedItems);
      } else {
        const createdInvoice = await comprehensiveDbService.createInvoice(newInvoice);

        const invoiceItems = formData.items.map(item => ({
          invoice_id: createdInvoice.id!,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.rate,
          total_price: item.amount
        }));
        
        await comprehensiveDbService.createInvoiceItems(invoiceItems);
      }
      
      // Reload invoices
      await loadInvoices();
      
      // Reset form
      setFormData({
        clientName: '',
        clientAddress: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
      setShowCreateForm(false);
      setEditingInvoiceId(null);
      setEditingInvoiceStatus('draft');
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const generatePDF = async (invoice: Invoice) => {
    if (!invoiceRef.current) return;
    
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`${invoice.invoice_number}.pdf`);
  };

  const loadInvoiceItems = async (invoiceId: string) => {
    const items = await comprehensiveDbService.getInvoiceItems(invoiceId);
    return items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.unit_price,
      amount: item.total_price
    }));
  };

  const viewInvoice = async (invoice: Invoice) => {
    try {
      const items = await loadInvoiceItems(invoice.id);
      setViewingInvoice({ ...invoice, items });
    } catch (error) {
      console.error('Error loading invoice items:', error);
      setViewingInvoice(invoice);
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      const items = await loadInvoiceItems(invoice.id);
      setViewingInvoice({ ...invoice, items });
    } catch (error) {
      console.error('Error loading invoice items:', error);
      setViewingInvoice(invoice);
    }
    // Wait for the invoice to render
    setTimeout(() => {
      generatePDF(invoice);
      setViewingInvoice(null);
    }, 100);
  };

  const editInvoice = async (invoice: Invoice) => {
    try {
      const items = await loadInvoiceItems(invoice.id);
      setFormData({
        clientName: invoice.client_name,
        clientAddress: invoice.client_address,
        items: items.length
          ? items
          : [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
      setCompanyLogo(invoice.company_logo_url || null);
      setEditingInvoiceId(invoice.id);
      setEditingInvoiceStatus(invoice.status);
      setShowCreateForm(true);
    } catch (error) {
      console.error('Error loading invoice for edit:', error);
    }
  };

  const deleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Delete invoice ${invoice.invoice_number}?`)) return;

    try {
      await comprehensiveDbService.deleteInvoiceItems(invoice.id);
      await comprehensiveDbService.deleteInvoice(invoice.id);
      await loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <SubscriptionGate feature="hasAdvancedCalculator">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">E-Invoicing System</h1>
              <p className="text-muted-foreground text-sm">Create professional invoices with your company branding</p>
            </div>
            <Button
              onClick={() => {
                setEditingInvoiceId(null);
                setEditingInvoiceStatus('draft');
                setFormData({
                  clientName: '',
                  clientAddress: '',
                  items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
                });
                setCompanyLogo(null);
                setShowCreateForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          {/* Create Invoice Form */}
          {showCreateForm && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingInvoiceId ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="text-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="truncate">Upload Logo</span>
                </Button>
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
                <Card className="p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <img src={companyLogo} alt="Company Logo" className="h-16 w-16 object-contain" />
                    <div>
                      <p className="font-medium">Company Logo Uploaded</p>
                      <p className="text-sm text-muted-foreground">This will appear on all your invoices</p>
                    </div>
                  </div>
                </Card>
              )}
              
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
                <Button onClick={saveInvoice}>
                  {editingInvoiceId ? 'Save Changes' : 'Create Invoice'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingInvoiceId(null);
                    setEditingInvoiceStatus('draft');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Invoice Preview/PDF Template */}
          {viewingInvoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Invoice Preview</h3>
                    <div className="flex gap-2">
                      <Button onClick={() => generatePDF(viewingInvoice)} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" onClick={() => setViewingInvoice(null)} size="sm">
                        Close
                      </Button>
                    </div>
                  </div>
                  
                  {/* Invoice Template */}
                  <div ref={invoiceRef} className="bg-white p-8 border" style={{ minHeight: '800px' }}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        {viewingInvoice.company_logo_url && (
                          <img src={viewingInvoice.company_logo_url} alt="Company Logo" className="h-16 w-auto mb-4" />
                        )}
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            {companyDetails?.company_name || currentCompany?.name || profile?.business_name || 'Your Business'}
                          </h1>
                          <p className="text-gray-600">
                            {companyDetails?.address || 'Business Address'}
                          </p>
                          <p className="text-gray-600">
                            {companyDetails?.phone || profile?.phone || 'Phone Number'}
                          </p>
                          <p className="text-gray-600">{profile?.email || 'Email Address'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                        <p className="text-gray-600">Invoice #: {viewingInvoice.invoice_number}</p>
                        <p className="text-gray-600">Date: {new Date(viewingInvoice.issue_date).toLocaleDateString()}</p>
                        <p className="text-gray-600">Due Date: {new Date(viewingInvoice.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
                      <div className="text-gray-700">
                        <p className="font-medium">{viewingInvoice.client_name}</p>
                        <p className="whitespace-pre-line">{viewingInvoice.client_address}</p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Rate</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingInvoice.items && viewingInvoice.items.length > 0 ? (
                            viewingInvoice.items.map((item, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 px-2 text-gray-700">{item.description}</td>
                                <td className="py-3 px-2 text-center text-gray-700">{item.quantity}</td>
                                <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                                <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b border-gray-200">
                              <td className="py-3 px-2 text-gray-700">Service/Product</td>
                              <td className="py-3 px-2 text-center text-gray-700">1</td>
                              <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(viewingInvoice.subtotal)}</td>
                              <td className="py-3 px-2 text-right text-gray-700">{formatCurrency(viewingInvoice.subtotal)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                      <div className="w-64">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(viewingInvoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-700">VAT (7.5%):</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(viewingInvoice.vat_amount)}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b-2 border-gray-300">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(viewingInvoice.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-gray-600 text-sm">
                      <p>Thank you for your business!</p>
                      <p className="mt-2">Payment is due within 30 days of invoice date.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Invoices</h3>
            
            {loadError ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{loadError}</p>
                <button
                  type="button"
                  onClick={loadInvoices}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : invoices.length === 0 ? (
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
                        <Button variant="outline" size="sm" onClick={() => viewInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button variant="outline" size="sm" onClick={() => editInvoice(invoice)}>
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInvoice(invoice)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice)}>
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

