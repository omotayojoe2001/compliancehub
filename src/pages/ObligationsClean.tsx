import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { comprehensiveDbService } from '@/lib/comprehensiveDbService';

export default function ObligationsClean() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [dashboardStats, userObligations] = await Promise.all([
        comprehensiveDbService.getDashboardStats(user!.id),
        comprehensiveDbService.getTaxObligations(user!.id)
      ]);
      setStats(dashboardStats);
      setObligations(userObligations);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (obligationId: string) => {
    if (!confirm('Are you sure you want to delete this obligation?')) return;
    
    try {
      await comprehensiveDbService.deleteTaxObligation(obligationId);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting obligation:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tax Obligations</h1>
          <p className="text-muted-foreground">Track all your Nigerian tax compliance requirements</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Obligations</p>
                <p className="text-lg md:text-2xl font-bold">{stats?.totalObligations || 0}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-2xl font-bold">{stats?.pendingObligations || 0}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
                <p className="text-lg md:text-2xl font-bold">{stats?.completedObligations || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Overdue</p>
                <p className="text-lg md:text-2xl font-bold">{stats?.overdueObligations || 0}</p>
              </div>
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Tax Obligations</h3>
            <Button onClick={() => navigate('/add-obligation')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Obligation
            </Button>
          </div>
          {stats?.totalObligations === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No Tax Obligations Added</h4>
              <p className="text-muted-foreground mb-4">
                You haven't added any tax obligations yet. Add your first obligation to start tracking deadlines and receiving automated reminders.
              </p>
              <Button onClick={() => navigate('/add-obligation')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Obligation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {obligations.map((obligation) => (
                <div key={obligation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      obligation.payment_status === 'paid' ? 'bg-green-100' :
                      obligation.payment_status === 'overdue' ? 'bg-red-100' : 'bg-orange-100'
                    }`}>
                      {getStatusIcon(obligation.payment_status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{obligation.obligation_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(obligation.next_due_date).toLocaleDateString()}
                      </p>
                      {obligation.amount_due && (
                        <p className="text-sm text-muted-foreground">
                          Amount: ₦{obligation.amount_due.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(obligation.payment_status)
                    }`}>
                      {obligation.payment_status === 'paid' ? 'Completed' :
                       obligation.payment_status === 'overdue' ? 'Overdue' : 'Pending'}
                    </span>
                    <Button variant="outline" size="sm">
                      Mark as Paid
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(obligation.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
  );
}