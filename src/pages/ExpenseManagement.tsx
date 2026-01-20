import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Calendar, DollarSign, Tag, Trash2, Download, TrendingUp } from 'lucide-react';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
import { realtimeService } from '@/lib/realtimeService';

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  user_id: string;
}

export default function ExpenseManagement() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: ''
  });

  const categories = [
    'Office Supplies',
    'Travel & Transport',
    'Meals & Entertainment',
    'Professional Services',
    'Marketing & Advertising',
    'Utilities',
    'Rent',
    'Insurance',
    'Software & Subscriptions',
    'Equipment',
    'Other'
  ];

  useEffect(() => {
    if (user?.id) {
      loadExpenses();
      
      // Subscribe to real-time updates
      const subscription = realtimeService.subscribeToExpenses(
        user.id,
        (payload) => {
          console.log('📊 Real-time expense update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setExpenses(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setExpenses(prev => 
              prev.map(item => 
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setExpenses(prev => 
              prev.filter(item => item.id !== payload.old.id)
            );
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [user?.id]);

  const loadExpenses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await supabaseService.getExpenses(user.id);
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const newExpense = {
      user_id: user.id,
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description
    };

    try {
      await supabaseService.createExpense(newExpense);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await supabaseService.deleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getTotalExpenses = (period: 'month' | 'year') => {
    const now = new Date();
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (period === 'month') {
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      } else {
        return expenseDate.getFullYear() === now.getFullYear();
      }
    });
    
    return filtered.reduce((total, expense) => total + expense.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <SubscriptionGate feature="Expense Management">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Expense Management</h1>
              <p className="text-muted-foreground">Track and manage your business expenses in real-time</p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-bold">{formatCurrency(getTotalExpenses('month'))}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">This Year</p>
                  <p className="text-lg font-bold">{formatCurrency(getTotalExpenses('year'))}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4 md:col-span-1 col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-bold">{expenses.length}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Add Expense Form */}
          {showAddForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Brief description of the expense"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button type="submit">Add Expense</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Expenses List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Expenses</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading expenses...
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses recorded yet. Add your first expense to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Tag className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{expense.category}</span>
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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