// Check RLS Status
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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
    return {};
  }
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkRLS() {
  console.log('🔍 RLS STATUS CHECK');
  console.log('==================\n');

  const tables = [
    'user_profiles',
    'company_profiles',
    'tax_obligations',
    'cashbook_entries',
    'invoices',
    'subscriptions'
  ];

  console.log('1️⃣ CHECKING RLS ENABLED...');
  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('check_rls_status', { table_name: table });
      if (error) {
        console.log(`${table}: ⚠️ Cannot check (${error.message})`);
      } else {
        console.log(`${table}: ${data ? 'RLS ENABLED' : 'RLS DISABLED'}`);
      }
    } catch (err) {
      console.log(`${table}: ⚠️ Error`);
    }
  }

  console.log('\n2️⃣ CHECKING POLICIES...');
  const { data: policies, error } = await supabase
    .from('pg_policies')
    .select('tablename, policyname')
    .eq('schemaname', 'public');

  if (error) {
    console.log('❌ Cannot check policies');
  } else {
    console.log('Found policies:');
    policies.forEach(p => console.log(`  ${p.tablename}: ${p.policyname}`));
  }
}

checkRLS();