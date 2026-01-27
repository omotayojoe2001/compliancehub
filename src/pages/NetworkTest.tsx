import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { testSupabaseConnectivity, testEnvironmentVariables } from '@/lib/networkTest';
import { supabase } from '@/lib/supabase';

export default function NetworkTest() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setResults(null);

    try {
      console.log('🧪 Starting comprehensive network tests...');
      
      // Test 1: Environment Variables
      const envTest = testEnvironmentVariables();
      
      // Test 2: Basic connectivity
      const connectivityTest = await testSupabaseConnectivity();
      
      // Test 3: Supabase client test
      let supabaseTest;
      try {
        const { data, error } = await supabase.auth.getUser();
        supabaseTest = {
          success: !error,
          error: error?.message,
          hasUser: !!data?.user
        };
      } catch (error: any) {
        supabaseTest = {
          success: false,
          error: error.message,
          networkError: true
        };
      }

      // Test 4: Database table access
      let tableTest;
      try {
        const { data, error } = await supabase
          .from('reminder_logs')
          .select('count')
          .limit(1);
        tableTest = {
          success: !error,
          error: error?.message,
          data
        };
      } catch (error: any) {
        tableTest = {
          success: false,
          error: error.message
        };
      }

      setResults({
        environment: envTest,
        connectivity: connectivityTest,
        supabaseClient: supabaseTest,
        tableAccess: tableTest,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Network Connectivity Test</h1>
          <p className="text-sm text-muted-foreground">
            Test database connectivity and diagnose timeout issues
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Network Tests'}
          </button>

          {results && (
            <div className="border border-border bg-card p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Test Results</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}