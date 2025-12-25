import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextClean';
import { freshDbService } from '@/lib/freshDbService';

export default function DebugTest() {
  const { user } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testProfile = async () => {
    setLoading(true);
    setResult('Testing profile operations...');
    
    try {
      // Test 1: Get profile
      console.log('🔍 Testing getProfile...');
      const profile = await freshDbService.getProfile(user?.id || '');
      console.log('📄 Profile result:', profile);
      
      // Test 2: Save profile
      console.log('💾 Testing saveProfile...');
      const saveResult = await freshDbService.saveProfile(user?.id || '', {
        business_name: 'Test Business',
        phone: '08012345678',
        email: user?.email || 'test@example.com'
      });
      console.log('💾 Save result:', saveResult);
      
      // Test 3: Get profile again
      console.log('🔍 Testing getProfile after save...');
      const profileAfter = await freshDbService.getProfile(user?.id || '');
      console.log('📄 Profile after save:', profileAfter);
      
      setResult(`
        ✅ Tests completed!
        
        User ID: ${user?.id}
        User Email: ${user?.email}
        
        Profile Before: ${JSON.stringify(profile, null, 2)}
        Save Success: ${saveResult}
        Profile After: ${JSON.stringify(profileAfter, null, 2)}
      `);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testObligations = async () => {
    setLoading(true);
    setResult('Testing obligations...');
    
    try {
      // Test obligations
      const obligations = await freshDbService.getObligations(user?.id || '');
      console.log('📋 Obligations:', obligations);
      
      setResult(`
        ✅ Obligations test completed!
        
        User ID: ${user?.id}
        Obligations: ${JSON.stringify(obligations, null, 2)}
      `);
      
    } catch (error) {
      console.error('❌ Obligations test failed:', error);
      setResult(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug Test</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">User Info</h2>
            <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'No email'}</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Database Tests</h2>
            <div className="flex gap-4 mb-4">
              <Button onClick={testProfile} disabled={loading || !user?.id}>
                {loading ? 'Testing...' : 'Test Profile Operations'}
              </Button>
              <Button onClick={testObligations} disabled={loading || !user?.id}>
                {loading ? 'Testing...' : 'Test Obligations'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}