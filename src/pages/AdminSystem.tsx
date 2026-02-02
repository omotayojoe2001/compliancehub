import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  RefreshCw, Database, Mail, MessageSquare, CreditCard, 
  Server, Activity, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';

interface SystemHealth {
  database: 'operational' | 'warning' | 'error';
  email: 'operational' | 'warning' | 'error';
  whatsapp: 'operational' | 'warning' | 'error';
  payment: 'operational' | 'warning' | 'error';
  api: 'operational' | 'warning' | 'error';
}

export default function AdminSystem() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'operational',
    email: 'operational',
    whatsapp: 'warning',
    payment: 'operational',
    api: 'operational'
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    checkSystemHealth();
    fetchSystemLogs();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Test database connection
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      
      setSystemHealth(prev => ({
        ...prev,
        database: dbError ? 'error' : 'operational',
        email: 'operational',
        whatsapp: 'warning', // Assuming not fully configured
        payment: 'operational',
        api: 'operational'
      }));
    } catch (error) {
      console.error('System health check failed:', error);
    }
    setLoading(false);
  };

  const fetchSystemLogs = async () => {
    // Mock system logs - in real app, these would come from actual log service
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'database',
        message: 'Database connection established successfully'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'warning',
        service: 'whatsapp',
        message: 'WhatsApp API configuration pending'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'info',
        service: 'email',
        message: 'Email service operational - 45 emails sent today'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        service: 'payment',
        message: 'Payment gateway responding normally'
      }
    ];
    setLogs(mockLogs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const runSystemTest = async (service: string) => {
    alert(`Running ${service} test... This would perform actual service tests in production.`);
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
            <h1 className="text-3xl font-bold text-foreground">System Management</h1>
            <p className="text-muted-foreground">Monitor system health and manage services</p>
          </div>
          <Button onClick={checkSystemHealth} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* System Health Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Status
          </h2>
          <div className="grid gap-4 md:grid-cols-5">
            <div className={`p-4 rounded-lg border ${getStatusColor(systemHealth.database)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-6 w-6" />
                {getStatusIcon(systemHealth.database)}
              </div>
              <h3 className="font-medium">Database</h3>
              <p className="text-sm text-muted-foreground capitalize">{systemHealth.database}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => runSystemTest('database')}
              >
                Test
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${getStatusColor(systemHealth.email)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6" />
                {getStatusIcon(systemHealth.email)}
              </div>
              <h3 className="font-medium">Email Service</h3>
              <p className="text-sm text-muted-foreground capitalize">{systemHealth.email}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => runSystemTest('email')}
              >
                Test
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${getStatusColor(systemHealth.whatsapp)}`}>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-6 w-6" />
                {getStatusIcon(systemHealth.whatsapp)}
              </div>
              <h3 className="font-medium">WhatsApp API</h3>
              <p className="text-sm text-muted-foreground capitalize">{systemHealth.whatsapp}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => runSystemTest('whatsapp')}
              >
                Test
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${getStatusColor(systemHealth.payment)}`}>
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-6 w-6" />
                {getStatusIcon(systemHealth.payment)}
              </div>
              <h3 className="font-medium">Payment Gateway</h3>
              <p className="text-sm text-muted-foreground capitalize">{systemHealth.payment}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => runSystemTest('payment')}
              >
                Test
              </Button>
            </div>

            <div className={`p-4 rounded-lg border ${getStatusColor(systemHealth.api)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Server className="h-6 w-6" />
                {getStatusIcon(systemHealth.api)}
              </div>
              <h3 className="font-medium">API Services</h3>
              <p className="text-sm text-muted-foreground capitalize">{systemHealth.api}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => runSystemTest('api')}
              >
                Test
              </Button>
            </div>
          </div>
        </Card>

        {/* System Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex-col">
              <Database className="h-6 w-6 mb-2" />
              Backup Database
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <RefreshCw className="h-6 w-6 mb-2" />
              Clear Cache
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              Test Email Service
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Server className="h-6 w-6 mb-2" />
              Restart Services
            </Button>
          </div>
        </Card>

        {/* System Logs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent System Logs</h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Badge variant={
                  log.level === 'error' ? 'destructive' :
                  log.level === 'warning' ? 'secondary' : 'default'
                }>
                  {log.level}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.service} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}