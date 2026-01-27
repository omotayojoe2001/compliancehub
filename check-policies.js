// Check current RLS policies
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = {};
readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkPolicies() {
  console.log('🔍 CHECKING CURRENT RLS POLICIES...\n');

  try {
    // Try to query pg_policies directly (this might not work with RLS)
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*');

    if (error) {
      console.log('❌ Cannot query pg_policies:', error.message);
      console.log('💡 This is expected - pg_policies is a system table\n');
    } else {
      console.log('Current policies:');
      data.forEach(p => {
        console.log(`- ${p.tablename}: ${p.policyname}`);
      });
    }

    // Test data access
    console.log('📊 TESTING DATA ACCESS...\n');
    const tables = ['user_profiles', 'company_profiles', 'tax_obligations'];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      console.log(`${table}: ${error ? '❌ BLOCKED' : '✅ ACCESSIBLE'}`);
      if (error) console.log(`  Error: ${error.message}`);
    }

  } catch (err) {
    console.log('❌ Script error:', err.message);
  }
}

checkPolicies();