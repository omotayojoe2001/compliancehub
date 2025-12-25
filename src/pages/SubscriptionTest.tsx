import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscriptionVerificationService } from "@/lib/subscriptionVerificationService";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";

export default function SubscriptionTest() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [testEmail, setTestEmail] = useState(user?.email || '');
  const [testPlan, setTestPlan] = useState('test200');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSubscriptionTest = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🧪 Running subscription test...');
      const result = await subscriptionVerificationService.testSubscriptionFlow(testEmail, testPlan);
      setResults(result);
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const debugCurrentState = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const debug = await subscriptionVerificationService.debugSubscriptionState(user.id);
      setResults({ debug: true, ...debug });
    } catch (error) {
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const verifyCurrentSubscription = async () => {
    if (!user?.id || !profile?.plan) return;
    
    setLoading(true);
    try {
      const verification = await subscriptionVerificationService.verifySubscriptionUpdate(
        user.id, 
        profile.plan, 
        'manual_verification'
      );
      setResults(verification);
    } catch (error) {
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Flow Test</h1>
          <p className="text-muted-foreground">Test and verify subscription functionality</p>
        </div>

        {/* Current Status */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Current Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User ID:</strong> {user?.id || 'Not logged in'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </div>
            <div>
              <strong>Business:</strong> {profile?.business_name || 'N/A'}
            </div>
            <div>
              <strong>Current Plan:</strong> {profile?.plan || 'No plan'}
            </div>
            <div>
              <strong>Status:</strong> {profile?.subscription_status || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Test Subscription Flow</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test"
              />
            </div>
            <div>
              <Label htmlFor="plan">Test Plan</Label>
              <select
                id="plan"
                value={testPlan}
                onChange={(e) => setTestPlan(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="test100">Test ₦100</option>
                <option value="test200">Test ₦200</option>
                <option value="basic">Basic ₦3,000</option>
                <option value="pro">Pro ₦7,000</option>
                <option value="annual">Annual ₦30,000</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={runSubscriptionTest} disabled={loading}>
                {loading ? 'Testing...' : 'Test Subscription Flow'}
              </Button>
              <Button onClick={debugCurrentState} disabled={loading} variant="outline">
                Debug Current State
              </Button>
              <Button onClick={verifyCurrentSubscription} disabled={loading} variant="outline">
                Verify Current Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className={`p-3 rounded ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {results.success ? (
                <div>
                  <p className="text-green-800 font-medium">✅ SUCCESS!</p>
                  {results.profile && (
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Plan in DB:</strong> {results.profile.plan}</p>
                      <p><strong>Status in DB:</strong> {results.profile.subscription_status}</p>
                      <p><strong>Business:</strong> {results.profile.business_name}</p>
                    </div>
                  )}
                  {results.subscription && (
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Subscription Plan:</strong> {results.subscription.plan_type}</p>
                      <p><strong>Subscription Status:</strong> {results.subscription.status}</p>
                      <p><strong>Amount:</strong> ₦{(results.subscription.amount / 100).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-800 font-medium">❌ FAILED</p>
                  <p className="text-sm text-red-700 mt-1">{results.error}</p>
                </div>
              )}
              
              {results.debug && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Debug Information:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to /subscription page</li>
            <li>2. Try to downgrade from a higher plan to ₦200 plan</li>
            <li>3. Confirm you see the big warning about downgrading</li>
            <li>4. Click "YES, DOWNGRADE ANYWAY" to proceed</li>
            <li>5. Complete the Paystack payment</li>
            <li>6. Come back here and click "Verify Current Subscription"</li>
            <li>7. Check that the database shows the correct plan</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}