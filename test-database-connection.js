// Database connection test for profile fetching
import { createClient } from '@supabase/supabase-js';

// You'll need to add your actual Supabase credentials here
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const testDatabaseConnection = async () => {
  console.log('🔌 Testing database connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if we can connect to user_profiles table
    console.log('📋 Testing user_profiles table access...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ user_profiles error:', profileError.message);
      return false;
    } else {
      console.log('✅ user_profiles table accessible');
    }
    
    // Test 2: Check if we can connect to subscriptions table
    console.log('📋 Testing subscriptions table access...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    
    if (subError) {
      console.error('❌ subscriptions error:', subError.message);
      return false;
    } else {
      console.log('✅ subscriptions table accessible');
    }
    
    // Test 3: Check if we can connect to company_profiles table
    console.log('📋 Testing company_profiles table access...');
    const { data: companies, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .limit(1);
    
    if (companyError) {
      console.error('❌ company_profiles error:', companyError.message);
      return false;
    } else {
      console.log('✅ company_profiles table accessible');
    }
    
    console.log('🎉 All database tables are accessible!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Run the test
testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ Database connection test PASSED');
    console.log('💡 Your einvoicing should be able to fetch profiles now');
  } else {
    console.log('\n❌ Database connection test FAILED');
    console.log('💡 Run your fix-security-performance.sql script first');
  }
});