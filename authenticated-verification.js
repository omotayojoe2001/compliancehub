// Authenticated Verification Script
// This simulates what the app does - authenticates and tests data access

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';

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

function askPassword() {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter your password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function testAuthenticatedAccess() {
  console.log('🔐 AUTHENTICATED VERIFICATION');
  console.log('=============================\n');

  // Use the same credentials from your app
  const email = 'joshuaomotayo10@gmail.com'; // From your debug logs
  const password = '000000'; // Provided by user

  console.log('1️⃣ SIGNING IN...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.log('❌ SIGN IN FAILED:', authError.message);
    return;
  }

  console.log('✅ SIGNED IN as:', authData.user?.email);

  console.log('\n2️⃣ TESTING AUTHENTICATED DATA ACCESS...');

  // Test the same queries your app makes
  const tests = [
    {
      name: 'User Profile',
      query: () => supabase.from('user_profiles').select('*').eq('id', authData.user.id).single()
    },
    {
      name: 'Company Profiles',
      query: () => supabase.from('company_profiles').select('*').eq('user_id', authData.user.id)
    },
    {
      name: 'Tax Obligations',
      query: () => supabase.from('tax_obligations').select('*').eq('user_id', authData.user.id).limit(5)
    },
    {
      name: 'Cashbook Entries',
      query: () => supabase.from('cashbook_entries').select('*').eq('user_id', authData.user.id).limit(5)
    },
    {
      name: 'Invoices',
      query: () => supabase.from('invoices').select('*').eq('user_id', authData.user.id).limit(5)
    }
  ];

  for (const test of tests) {
    try {
      const { data, error } = await test.query();
      if (error) {
        console.log(`${test.name}: ❌ ${error.message}`);
      } else {
        console.log(`${test.name}: ✅ OK (${data ? (Array.isArray(data) ? data.length : 1) : 0} records)`);
      }
    } catch (err) {
      console.log(`${test.name}: ❌ ${err.message}`);
    }
  }

  console.log('\n3️⃣ SIGNING OUT...');
  await supabase.auth.signOut();

  console.log('\n🎯 If all show ✅ OK, RLS policies are working!');
  console.log('If any show ❌, the policies need fixing.');
  console.log('If this works but app doesn\'t, check browser storage/settings.');
}

async function main() {
  await testAuthenticatedAccess();
}

main();