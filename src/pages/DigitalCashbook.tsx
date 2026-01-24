import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, TrendingUp, TrendingDown, Calculator, FileText, Download, Calendar, Search, BarChart3, ArrowUpDown } from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { supabaseService } from '@/lib/supabaseService';
import { realtimeService } from '@/lib/realtimeService';

interface CashbookEntry {
  id: string;
  date: string;
  entry_type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  vat_applicable: boolean;
  vat_amount?: number;
  payment_method: string;
  user_id: string;
}

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile';
  balance: number;
}

export default function DigitalCashbook() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [entries, setEntries] = useState<CashbookEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Cash on Hand', type: 'cash', balance: 0 },
    { id: '2', name: 'Bank Account', type: 'bank', balance: 0 },
    { id: '3', name: 'Mobile Money', type: 'mobile', balance: 0 }
  ]);
  const [activeView, setActiveView] = useState('summary');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('this_month');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    vatApplicable: false,
    paymentMethod: 'cash',
    reference: ''
  });

  const inflowCategories = [
    'Sales Revenue', 'Service Income', 'Consulting Fees', 'Product Sales',
    'Rental Income', 'Interest Income', 'Commission', 'Refunds', 'Other Income'
  ];

  const outflowCategories = [
    'Office Supplies', 'Travel & Transport', 'Professional Services', 'Marketing & Advertising',
    'Utilities', 'Rent', 'Salaries & Wages', 'Equipment Purchase', 'Inventory', 'Insurance',
    'Bank Charges', 'Taxes', 'Loan Payments', 'School Fees', 'Logistics', 'Salary',
    'Medical Expenses', 'Legal Fees', 'Maintenance & Repairs', 'Fuel & Vehicle Expenses',
    'Communication', 'Training & Development', 'Entertainment', 'Donations', 'Other Expenses'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Card Payment', 'Online Transfer'];

  useEffect(() => {
    if (user?.id && currentCompany?.id) {
      loadCashbookEntries();
    } else {
      setEntries([]);
    }
  }, [user?.id, currentCompany?.id]);

  const loadCashbookEntries = async () => {
    if (!user?.id || !currentCompany?.id) return;
    
    setLoading(true);
    try {
      const data = await supabaseService.getCashbookEntries(user.id, currentCompany.id);
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading cashbook entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !currentCompany?.id) return;
    
    const amount = parseFloat(formData.amount);
    const vatAmount = formData.vatApplicable && formData.type === 'income' ? amount * 0.075 : 0;
    
    const newEntry = {
      user_id: user.id,
      company_id: currentCompany.id,
      date: formData.date,
      entry_type: formData.type,
      amount,
      description: formData.description,
      category: formData.category,
      vat_applicable: formData.vatApplicable,
      vat_amount: vatAmount,
      payment_method: formData.paymentMethod
    };

    try {
      await supabaseService.createCashbookEntry(newEntry);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        amount: '',
        description: '',
        category: '',
        vatApplicable: false,
        paymentMethod: 'cash',
        reference: ''
      });
      setShowAddForm(false);
      loadCashbookEntries(); // Reload entries after adding
    } catch (error) {
      console.error('Error adding cashbook entry:', error);
    }
  };

  const getTotalInflow = () => {
    return entries
      .filter(entry => entry.entry_type === 'income')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getTotalOutflow = () => {
    return entries
      .filter(entry => entry.entry_type === 'expense')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getVATOwed = () => {
    return entries
      .filter(entry => entry.vat_applicable && entry.entry_type === 'income')
      .reduce((total, entry) => total + (entry.vat_amount || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const views = [
    { id: 'summary', name: 'Summary', icon: BarChart3 },
    { id: 'transactions', name: 'Transactions', icon: ArrowUpDown },
    { id: 'accounts', name: 'All Accounts', icon: Calculator }
  ];

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const matches =
        entry.description.toLowerCase().includes(term) ||
        entry.category.toLowerCase().includes(term) ||
        entry.payment_method.toLowerCase().includes(term);
      if (!matches) return false;
    }

    if (filterPeriod === 'all') {
      return true;
    }

    const entryDate = new Date(entry.date);
    const today = new Date();

    if (filterPeriod === 'today') {
      return entryDate.toDateString() === today.toDateString();
    }

    if (filterPeriod === 'this_week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    }

    if (filterPeriod === 'this_month') {
      return (
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    }

    return false;
  });

  return (
    <SubscriptionGate feature="Digital Cashbook">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Digital Cashbook</h1>
              <p className="text-muted-foreground">Complete cash flow management with automatic VAT calculation (Real-time)</p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeView === view.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <view.icon className="h-4 w-4" />
                  {view.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Add Entry Form */}
          {showAddForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Cashbook Entry</h3>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    >
                      <option value="income">💰 Cash In</option>
                      <option value="expense">💸 Cash Out</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select category</option>
                      {(formData.type === 'income' ? inflowCategories : outflowCategories).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Reference (Optional)</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      className="w-full border border-border rounded-md px-3 py-2"
                      placeholder="Invoice #, Receipt #, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Brief description of the transaction"
                    required
                  />
                </div>

                {formData.type === 'income' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="vatApplicable"
                      checked={formData.vatApplicable}
                      onChange={(e) => setFormData({...formData, vatApplicable: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <label htmlFor="vatApplicable" className="text-sm font-medium">
                      Subject to VAT (7.5%) - {formData.vatApplicable && formData.amount ? formatCurrency(parseFloat(formData.amount) * 0.075) : '₦0.00'}
                    </label>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button type="submit">Add Entry</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* View Content */}
          <div className="space-y-6">
            {activeView === 'summary' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Summary Cards */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cash In</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(getTotalInflow())}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </Card>
    
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cash Out</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(getTotalOutflow())}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </Card>
    
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Net Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(getTotalInflow() - getTotalOutflow())}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calculator className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </Card>
    
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">VAT Owed</p>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(getVATOwed())}</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-full">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'transactions' && (
              <Card className="p-6">
                {/* Transactions List */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="border border-border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="today">Today</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="border border-border rounded-md pl-8 pr-3 py-2 text-sm"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions recorded yet. Add your first entry to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            entry.entry_type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {entry.entry_type === 'income' ? 
                              <TrendingUp className="h-4 w-4 text-green-600" /> : 
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{entry.category}</span>
                              <span>{entry.payment_method}</span>
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                              {entry.vat_applicable && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                  VAT: {formatCurrency(entry.vat_amount || 0)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${
                            entry.entry_type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.entry_type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeView === 'accounts' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">All Accounts</h3>
                <div className="space-y-4">
                  {accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(account.balance)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            </div>
        </div>
      </DashboardLayout>
    </SubscriptionGate>
  );
}
