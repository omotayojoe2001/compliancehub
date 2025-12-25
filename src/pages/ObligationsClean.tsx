import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Trash2 } from "lucide-react";

interface TaxObligation {
  id: string;
  type: string;
  period: string;
  dueDate: string;
  status: string;
}

export default function ObligationsClean() {
  const [obligations, setObligations] = useState<TaxObligation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObligation, setNewObligation] = useState({
    type: '',
    period: '',
    dueDate: ''
  });

  const addObligation = () => {
    if (newObligation.type && newObligation.period && newObligation.dueDate) {
      const obligation: TaxObligation = {
        id: Date.now().toString(),
        type: newObligation.type,
        period: newObligation.period,
        dueDate: newObligation.dueDate,
        status: 'active'
      };
      setObligations([...obligations, obligation]);
      setNewObligation({ type: '', period: '', dueDate: '' });
      setShowAddForm(false);
      alert('Tax obligation added successfully!');
    }
  };

  const removeObligation = (id: string) => {
    setObligations(obligations.filter(o => o.id !== id));
    alert('Tax obligation removed!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Obligations</h1>
            <p className="text-muted-foreground">
              Manage your tax periods and deadlines
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Obligation
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Tax Obligation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="type">Tax Type</Label>
                  <select
                    id="type"
                    value={newObligation.type}
                    onChange={(e) => setNewObligation({...newObligation, type: e.target.value})}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                  >
                    <option value="">Select tax type</option>
                    <option value="VAT">VAT</option>
                    <option value="PAYE">PAYE</option>
                    <option value="WHT">Withholding Tax</option>
                    <option value="CAC">CAC Annual Returns</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="period">Tax Period</Label>
                  <Input
                    id="period"
                    value={newObligation.period}
                    onChange={(e) => setNewObligation({...newObligation, period: e.target.value})}
                    placeholder="e.g., 2024-12"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newObligation.dueDate}
                    onChange={(e) => setNewObligation({...newObligation, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addObligation}>Add Obligation</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Obligations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Tax Obligations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {obligations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tax obligations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your tax periods to start receiving automated reminders.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tax Obligation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {obligations.map((obligation) => (
                  <div key={obligation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{obligation.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Period: {obligation.period} | Due: {obligation.dueDate}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeObligation(obligation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}