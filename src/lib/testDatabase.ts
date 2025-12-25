import { supabase } from './supabase';

export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Simple query to profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, business_name')
      .limit(1);
    
    console.log('📊 Profiles test:', { profiles, profileError });
    
    // Test 2: Simple query to tax_obligations table
    const { data: obligations, error: obligationError } = await supabase
      .from('tax_obligations')
      .select('id, obligation_type')
      .limit(1);
    
    console.log('📋 Obligations test:', { obligations, obligationError });
    
    // Test 3: Simple query to subscriptions table
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, plan_type')
      .limit(1);
    
    console.log('💳 Subscriptions test:', { subscriptions, subscriptionError });
    
    // Test 4: Auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Auth test:', { user: !!user, authError });
    
    return {
      profiles: !profileError,
      obligations: !obligationError,
      subscriptions: !subscriptionError,
      auth: !authError
    };
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return {
      profiles: false,
      obligations: false,
      subscriptions: false,
      auth: false
    };
  }
};

// Auto-run test when imported
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testDatabaseConnection().then(results => {
      console.log('🔍 Database test results:', results);
    });
  }, 2000);
}