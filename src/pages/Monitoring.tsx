import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Calendar, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { monitoringService } from '@/lib/monitoringService';
import { HelpWrapper } from '@/components/onboarding/HelpWrapper';

interface MonitoringResult {
  timestamp: string;
  totalUsers: number;
  activeSubscriptions: number;
  upcomingDeadlines: number;
  remindersSent: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  issues: string[];
}

export default function Monitoring() {
  const [monitoring, setMonitoring] = useState<MonitoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await monitoringService.runManualCheck();
      setMonitoring(result);
      setLastCheck(new Date().toLocaleString());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className=\"space-y-6\">
        <HelpWrapper
          helpTitle=\"What does this page show?\"
          helpContent=\"This page proves our system is actually working. It shows how many users we're watching, how many deadlines are coming up, and how many reminders we've sent. This is the proof that we're really monitoring your taxes.\"
        >
          <div className=\"flex items-center justify-between\">
            <div>
              <h1 className=\"text-lg font-semibold text-foreground flex items-center gap-2\">
                <Eye className=\"h-5 w-5\" />
                System Monitoring
              </h1>
              <p className=\"text-sm text-muted-foreground\">
                Real-time proof that we're watching your deadlines
              </p>
            </div>
            <Button onClick={runHealthCheck} disabled={loading} className=\"flex items-center gap-2\">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
          </div>
        </HelpWrapper>

        {/* System Health Status */}
        {monitoring && (
          <Card className=\"p-6\">
            <div className=\"flex items-center justify-between mb-4\">
              <h2 className=\"text-lg font-semibold\">System Health</h2>
              <Badge className={getHealthColor(monitoring.systemHealth)}>
                <div className=\"flex items-center gap-1\">
                  {getHealthIcon(monitoring.systemHealth)}
                  {monitoring.systemHealth.toUpperCase()}
                </div>
              </Badge>
            </div>
            
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4\">
              <div className=\"text-center\">
                <div className=\"flex items-center justify-center mb-2\">
                  <Users className=\"h-8 w-8 text-blue-600\" />
                </div>
                <div className=\"text-2xl font-bold\">{monitoring.totalUsers}</div>
                <div className=\"text-sm text-muted-foreground\">Total Users</div>
              </div>
              
              <div className=\"text-center\">
                <div className=\"flex items-center justify-center mb-2\">
                  <CheckCircle className=\"h-8 w-8 text-green-600\" />
                </div>
                <div className=\"text-2xl font-bold\">{monitoring.activeSubscriptions}</div>
                <div className=\"text-sm text-muted-foreground\">Active Subscriptions</div>
              </div>
              
              <div className=\"text-center\">
                <div className=\"flex items-center justify-center mb-2\">
                  <Calendar className=\"h-8 w-8 text-orange-600\" />
                </div>
                <div className=\"text-2xl font-bold\">{monitoring.upcomingDeadlines}</div>
                <div className=\"text-sm text-muted-foreground\">Upcoming Deadlines</div>
              </div>
              
              <div className=\"text-center\">
                <div className=\"flex items-center justify-center mb-2\">
                  <Mail className=\"h-8 w-8 text-purple-600\" />
                </div>
                <div className=\"text-2xl font-bold\">{monitoring.remindersSent}</div>
                <div className=\"text-sm text-muted-foreground\">Reminders Sent Today</div>
              </div>
            </div>
            
            <div className=\"text-xs text-muted-foreground text-center\">
              Last checked: {lastCheck}
            </div>
          </Card>
        )}

        {/* Issues & Alerts */}
        {monitoring && monitoring.issues.length > 0 && (
          <Card className=\"p-4 border-yellow-200 bg-yellow-50\">
            <h3 className=\"font-semibold text-yellow-800 mb-3 flex items-center gap-2\">
              <AlertTriangle className=\"h-4 w-4\" />
              System Issues Detected
            </h3>
            <ul className=\"space-y-2\">
              {monitoring.issues.map((issue, index) => (
                <li key={index} className=\"text-sm text-yellow-700 flex items-start gap-2\">
                  <span className=\"text-yellow-600\">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* What We're Actually Watching */}
        <Card className=\"p-6\">
          <h2 className=\"text-lg font-semibold mb-4\">What We're Actually Watching</h2>
          <div className=\"grid gap-4 md:grid-cols-2\">
            <div className=\"space-y-3\">
              <h3 className=\"font-medium text-green-700\">✅ Currently Monitoring</h3>
              <ul className=\"space-y-2 text-sm\">
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  VAT filing deadlines (21st of each month)
                </li>
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  PAYE remittance deadlines (10th of each month)
                </li>
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  CAC annual returns (42 days after anniversary)
                </li>
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  Withholding tax deadlines (21st of each month)
                </li>
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  User subscription status
                </li>
                <li className=\"flex items-center gap-2\">
                  <CheckCircle className=\"h-4 w-4 text-green-600\" />
                  Email delivery status
                </li>
              </ul>
            </div>
            
            <div className=\"space-y-3\">
              <h3 className=\"font-medium text-blue-700\">📊 How We Validate</h3>
              <ul className=\"space-y-2 text-sm\">
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Check database every hour for upcoming deadlines
                </li>
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Send reminders 7, 3, and 1 days before due dates
                </li>
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Log all reminder attempts (success/failure)
                </li>
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Monitor system health and alert on issues
                </li>
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Track email delivery confirmations
                </li>
                <li className=\"flex items-start gap-2\">
                  <span className=\"text-blue-600\">•</span>
                  Verify user subscription status before sending
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Proof of Work */}
        <Card className=\"p-6 bg-green-50 border-green-200\">
          <h2 className=\"text-lg font-semibold text-green-800 mb-4\">🔍 Proof We're Working</h2>
          <div className=\"grid gap-4 md:grid-cols-3\">
            <div className=\"text-center\">
              <div className=\"text-3xl font-bold text-green-700\">{monitoring?.activeSubscriptions || 0}</div>
              <div className=\"text-sm text-green-600\">Users We're Actively Monitoring</div>
            </div>
            <div className=\"text-center\">
              <div className=\"text-3xl font-bold text-green-700\">{monitoring?.upcomingDeadlines || 0}</div>
              <div className=\"text-sm text-green-600\">Deadlines We're Tracking</div>
            </div>
            <div className=\"text-center\">
              <div className=\"text-3xl font-bold text-green-700\">{monitoring?.remindersSent || 0}</div>
              <div className=\"text-sm text-green-600\">Reminders Sent Today</div>
            </div>
          </div>
          <div className=\"mt-4 text-center text-sm text-green-700\">
            This page updates in real-time to show you exactly what we're monitoring and when we last sent reminders.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}