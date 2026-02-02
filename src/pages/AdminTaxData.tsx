import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Download, FileText, Calendar, DollarSign } from 'lucide-react';

interface TaxObligation {
  id: string;
  user_id: string;
  obligation_type: string;
  next_due_date: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: {
    email: string;
    business_name: string;
  };
}

export default function AdminTaxData() {
  const [obligations, setObligations] = useState<TaxObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchTaxData();
  }, []);

  const fetchTaxData = async () => {
    try {
      const { data: obligationsData } = await supabase
        .from('tax_obligations')
        .select(`
          *,
          profiles(email, business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (obligationsData) {
        setObligations(obligationsData);
        
        // Calculate stats
        const total = obligationsData.length;
        const completed = obligationsData.filter(o => o.status === 'completed').length;
        const pending = obligationsData.filter(o => o.status === 'pending').length;
        const overdue = obligationsData.filter(o => {
          const dueDate = new Date(o.next_due_date);
          const today = new Date();
          return dueDate < today && o.status !== 'completed';
        }).length;
        const totalAmount = obligationsData.reduce((sum, o) => sum + (o.amount || 0), 0);

        setStats({ total, completed, pending, overdue, totalAmount });
      }
    } catch (error) {
      console.error('Failed to fetch tax data:', error);
    }
    setLoading(false);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Tax Type,Due Date,Amount,Status,User Email,Business Name,Created At\n" +
      obligations.map(o => 
        `${o.obligation_type},${o.next_due_date},${o.amount || 0},${o.status},${o.profiles?.email || ''},${o.profiles?.business_name || ''},${o.created_at}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tax_obligations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Data Management</h1>
            <p className="text-muted-foreground">Monitor all tax obligations and compliance data</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchTaxData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Obligations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₦{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tax Obligations ({obligations.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tax Type</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Business</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {obligations.map((obligation) => {
                  const dueDate = new Date(obligation.next_due_date);
                  const today = new Date();
                  const isOverdue = dueDate < today && obligation.status !== 'completed';
                  
                  return (
                    <tr key={obligation.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="font-medium">{obligation.obligation_type}</span>
                      </td>
                      <td className="p-3">
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {dueDate.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3">
                        ₦{obligation.amount?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          obligation.status === 'completed' ? 'default' : 
                          isOverdue ? 'destructive' : 'secondary'
                        }>
                          {isOverdue && obligation.status !== 'completed' ? 'Overdue' : obligation.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{obligation.profiles?.email || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{obligation.user_id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{obligation.profiles?.business_name || 'Not set'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{new Date(obligation.created_at).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}