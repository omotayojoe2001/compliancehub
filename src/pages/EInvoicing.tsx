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
  client_address?: string;
  items?: InvoiceItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  company_logo_url?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
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
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: ''
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
    }, 5000); // Reduced timeout to 5 seconds

    setLoadError(null);
    setLoading(true);
    
    try {
      // Simple query without company filter first
      const data = await comprehensiveDbService.getInvoices(user.id);
      if (settled) return;
      
      setInvoices(data || []);
    } catch (error) {
      if (settled) return;
      console.error('Error loading invoices:', error);
      setInvoices([]);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          setLoadError("Connection timeout. Please check your internet and try again.");
        } else if (error.message.includes('network')) {
          setLoadError("Network error. Please check your connection.");
        } else {
          setLoadError(`Error: ${error.message}`);
        }
      } else {
        setLoadError("Couldn't load invoices. Please try again.");
      }
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
      company_id: currentCompany?.id || null,
      invoice_number: invoiceNumber,
      client_name: formData.clientName,
      client_address: formData.clientAddress,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      vat_amount: vatAmount,
      total_amount: total,
      status: 'draft' as const,
      company_logo_url: companyLogo,
      bank_name: formData.bankName,
      bank_account_name: formData.bankAccountName,
      bank_account_number: formData.bankAccountNumber
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
          company_logo_url: companyLogo,
          bank_name: formData.bankName,
          bank_account_name: formData.bankAccountName,
          bank_account_number: formData.bankAccountNumber
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
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        bankAccountNumber: '',
        bankAccountName: '',
        bankName: ''
      });
      setShowCreateForm(false);
      setEditingInvoiceId(null);
      setEditingInvoiceStatus('draft');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
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
    
    // High-quality canvas settings
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: invoiceRef.current.scrollWidth,
      height: invoiceRef.current.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false // Disable compression for better quality
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit A4 while maintaining aspect ratio
    const canvasAspectRatio = canvas.height / canvas.width;
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = imgWidth * canvasAspectRatio;
    
    let yPosition = 10; // 10mm top margin
    
    // If content fits on one page
    if (imgHeight <= pdfHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multi-page handling with better quality
      let remainingHeight = imgHeight;
      let sourceY = 0;
      
      while (remainingHeight > 0) {
        const pageHeight = Math.min(remainingHeight, pdfHeight - 20);
        
        // Create a temporary canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        
        pageCanvas.width = canvas.width;
        pageCanvas.height = (pageHeight / imgHeight) * canvas.height;
        
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY * (canvas.height / imgHeight),
            canvas.width, pageCanvas.height,
            0, 0,
            canvas.width, pageCanvas.height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageHeight, undefined, 'FAST');
        }
        
        remainingHeight -= pageHeight;
        sourceY += pageHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
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
          : [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        bankAccountNumber: invoice.bank_account_number || '',
        bankAccountName: invoice.bank_account_name || '',
        bankName: invoice.bank_name || ''
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
                  items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
                  bankAccountNumber: '',
                  bankAccountName: '',
                  bankName: ''
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

              {/* Bank Account Details */}
              <div className="mb-6">
                <h4 className="font-medium mb-4">Bank Account Details (for payment)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="e.g. First Bank of Nigeria"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({...formData, bankAccountName: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="1234567890"
                    />
                  </div>
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
                  <div ref={invoiceRef} className="bg-white p-8 border" style={{ minHeight: '800px', fontSize: '14px', lineHeight: '1.4' }}>
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

                    {/* Payment Details - Prominent Section */}
                    {(viewingInvoice.bank_name || viewingInvoice.bank_account_name || viewingInvoice.bank_account_number) && (
                      <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-300 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">💳 PAYMENT INSTRUCTIONS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          {viewingInvoice.bank_name && (
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-sm font-medium text-gray-600 mb-1">BANK NAME</p>
                              <p className="text-lg font-bold text-gray-900">{viewingInvoice.bank_name}</p>
                            </div>
                          )}
                          {viewingInvoice.bank_account_name && (
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-sm font-medium text-gray-600 mb-1">ACCOUNT NAME</p>
                              <p className="text-lg font-bold text-gray-900">{viewingInvoice.bank_account_name}</p>
                            </div>
                          )}
                          {viewingInvoice.bank_account_number && (
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-sm font-medium text-gray-600 mb-1">ACCOUNT NUMBER</p>
                              <p className="text-xl font-bold text-blue-600">{viewingInvoice.bank_account_number}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm font-semibold text-red-600">⚠️ Please use invoice number as payment reference</p>
                        </div>
                      </div>
                    )}

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
                  <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{invoice.invoice_number}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="truncate">{invoice.client_name}</span>
                          <span className="whitespace-nowrap">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="font-semibold text-lg">{formatCurrency(invoice.total_amount)}</span>
                      <div className="flex flex-wrap gap-2">
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

