import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextClean";
import { freshDbService } from "@/lib/freshDbService";
import { Calendar, FileText, Calculator, Settings, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DashboardClean() {
  const { user } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadObligations();
    }
  }, [user?.id]);

  const loadObligations = async () => {
    try {
      const data = await freshDbService.getObligations(user?.id || '');
      setObligations(data || []);
    } catch (error) {
      console.error('Failed to load obligations:', error);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Manage your tax compliance and never miss a deadline.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-3">
            <div className="text-center space-y-2">
              <Calculator className="h-6 w-6 text-primary mx-auto" />
              <h3 className="text-xs font-medium">Tax Calculator</h3>
              <Link to="/calculator">
                <Button size="sm" className="w-full text-xs h-8">
                  Calculate
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-center space-y-2">
              <Plus className="h-6 w-6 text-primary mx-auto" />
              <h3 className="text-xs font-medium">Add Obligation</h3>
              <Link to="/obligations">
                <Button size="sm" className="w-full text-xs h-8">
                  Add Period
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-center space-y-2">
              <FileText className="h-6 w-6 text-primary mx-auto" />
              <h3 className="text-xs font-medium">View Guides</h3>
              <Link to="/guides">
                <Button size="sm" className="w-full text-xs h-8">
                  Guides
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-center space-y-2">
              <Settings className="h-6 w-6 text-primary mx-auto" />
              <h3 className="text-xs font-medium">Settings</h3>
              <Link to="/settings">
                <Button size="sm" className="w-full text-xs h-8">
                  Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Tax Obligations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Your Tax Obligations ({obligations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading obligations...</p>
              </div>
            ) : obligations.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-2">No tax obligations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your tax periods to start receiving automated reminders.
                </p>
                <Link to="/obligations">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax Obligation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {obligations.slice(0, 3).map((obligation: any) => (
                  <div key={obligation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{obligation.obligation_type}</h4>
                      <p className="text-xs text-muted-foreground">Period: {obligation.tax_period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">
                        Due: {new Date(obligation.next_due_date).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        obligation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {obligation.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {obligations.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/obligations">
                      <Button variant="outline" size="sm">
                        View All ({obligations.length})
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="text-center pt-2">
                  <Link to="/obligations">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Test */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Access additional tools and features.
            </p>
            <div className="flex gap-2">
              <Link to="/calculator">
                <Button variant="outline" size="sm">
                  Tax Calculator
                </Button>
              </Link>
              <Link to="/guides">
                <Button variant="outline" size="sm">
                  Filing Guides
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}