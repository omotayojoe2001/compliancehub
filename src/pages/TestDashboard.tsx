import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDashboard() {
  const [results, setResults] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    addResult('🚀 Starting React Dashboard Test...');
    
    try {
      // Test 1: Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addResult(`❌ Auth Error: ${userError.message}`);
      } else if (user) {
        addResult(`✅ User found: ${user.email}`);
        setUser(user);
        
        // Test 2: Get company profiles
        const { data: companies, error: companyError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id);
        
        if (companyError) {
          addResult(`❌ Company Error: ${companyError.message}`);
        } else {
          addResult(`✅ Found ${companies?.length || 0} companies`);
          companies?.forEach((company, index) => {
            addResult(`  ${index + 1}. ${company.company_name} (${company.is_primary ? 'Primary' : 'Secondary'})`);
          });
        }
        
        // Test 3: Get obligations
        const { data: obligations, error: obligationError } = await supabase
          .from('tax_obligations')
          .select('*')
          .eq('user_id', user.id);
        
        if (obligationError) {
          addResult(`❌ Obligations Error: ${obligationError.message}`);
        } else {
          addResult(`✅ Found ${obligations?.length || 0} obligations`);
        }
        
        // Test 4: Get subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (subError && subError.code !== 'PGRST116') {
          addResult(`❌ Subscription Error: ${subError.message}`);
        } else if (subscription) {
          addResult(`✅ Subscription: ${subscription.plan_type} - ${subscription.status}`);
        } else {
          addResult(`⚠️ No subscription found`);
        }
        
      } else {
        addResult('❌ No user authenticated');
      }
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 React Dashboard Test</h1>
      <p>Testing the same queries as debug tool but in React context</p>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {results.map((result, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {result}
          </div>
        ))}
      </div>
      
      <button 
        onClick={runTests}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Run Tests Again
      </button>
    </div>
  );
}