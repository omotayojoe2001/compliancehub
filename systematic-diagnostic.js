// Systematic Database Diagnostic Script
// Run this to identify the exact issue with profile switching and timeouts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch (error) {
    console.log('❌ Could not read .env file');
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('🔍 SYSTEMATIC DATABASE DIAGNOSTICS');
  console.log('=====================================\n');

  try {
    // 1. Test basic connection
    console.log('1️⃣ TESTING BASIC CONNECTION...');
    const { data: connectionTest, error: connError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (connError) {
      console.log('❌ Connection failed:', connError.message);
      return;
    }
    console.log('✅ Basic connection works\n');

    // 2. Check RLS status
    console.log('2️⃣ CHECKING RLS POLICIES...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('get_rls_policies');
    if (rlsError) {
      console.log('⚠️ Could not check RLS (expected):', rlsError.message);
    }

    // Check if we can read user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    console.log('User profiles access:', profileError ? '❌ FAILED' : '✅ WORKS');
    if (profileError) console.log('Error:', profileError.message);

    // Check company_profiles
    const { data: companies, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .limit(1);

    console.log('Company profiles access:', companyError ? '❌ FAILED' : '✅ WORKS');
    if (companyError) console.log('Error:', companyError.message);

    // Check tax_obligations
    const { data: obligations, error: obligationError } = await supabase
      .from('tax_obligations')
      .select('*')
      .limit(1);

    console.log('Tax obligations access:', obligationError ? '❌ FAILED' : '✅ WORKS');
    if (obligationError) console.log('Error:', obligationError.message);

    console.log('');

    // 3. Check data counts
    console.log('3️⃣ CHECKING DATA COUNTS...');

    const tables = ['user_profiles', 'company_profiles', 'tax_obligations', 'reminder_logs', 'cashbook_entries', 'invoices'];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        console.log(`${table}: ${error ? '❌ ERROR' : count + ' records'}`);
        if (error) console.log('  Error:', error.message);
      } catch (err) {
        console.log(`${table}: ❌ EXCEPTION - ${err.message}`);
      }
    }

    console.log('');

    // 4. Test authenticated queries (simulate user login)
    console.log('4️⃣ TESTING AUTHENTICATED QUERIES...');
    console.log('⚠️ Note: These will fail without authentication, but show us the policy behavior\n');

    // Try to get current user (will be null)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.id : 'NOT AUTHENTICATED');

    if (!user) {
      console.log('❌ Cannot test authenticated queries without login');
      console.log('💡 Try running this script after logging into the app');
      return;
    }

    // Test company loading
    const { data: userCompanies, error: companiesErr } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id);

    console.log('User companies query:', companiesErr ? '❌ FAILED' : '✅ WORKS');
    if (companiesErr) console.log('Error:', companiesErr.message);
    if (userCompanies) console.log('Found companies:', userCompanies.length);

  } catch (error) {
    console.log('❌ Diagnostic failed:', error.message);
  }
}

runDiagnostics();