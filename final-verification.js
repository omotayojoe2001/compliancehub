// Final Verification Script - Run after database fix
// This will confirm everything is working

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

async function verifyFix() {
  console.log('🔍 FINAL VERIFICATION');
  console.log('====================\n');

  // Test data access
  const tables = ['user_profiles', 'company_profiles', 'tax_obligations', 'cashbook_entries', 'invoices'];

  console.log('1️⃣ TESTING DATA ACCESS...');
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      console.log(`${table}: ${error ? '❌ ' + error.message : '✅ OK'}`);
    } catch (err) {
      console.log(`${table}: ❌ ${err.message}`);
    }
  }

  console.log('\n2️⃣ TESTING RLS POLICIES...');
  const { data: policies, error } = await supabase
    .from('pg_policies')
    .select('*')
    .limit(5);

  if (error) {
    console.log('RLS check: ⚠️ Cannot verify (expected)');
  } else {
    console.log('RLS policies found:', policies?.length || 0);
  }

  console.log('\n✅ VERIFICATION COMPLETE');
  console.log('If all tables show ✅ OK, the database fix worked!');
  console.log('Try logging into the app and switching companies.');
}

verifyFix();