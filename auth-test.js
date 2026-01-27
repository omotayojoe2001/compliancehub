// Test script for the new authentication system
// Run with: node auth-test.js

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

async function testAuthFlow() {
  console.log('🧪 TESTING NEW AUTH SYSTEM');
  console.log('==========================\n');

  const email = 'joshuaomotayo10@gmail.com';
  const password = '000000';

  try {
    // Test 1: Sign In
    console.log('1️⃣ Testing Sign In...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('❌ Sign In failed:', signInError);
      return;
    }

    console.log('✅ Sign In successful:', signInData.user?.email);

    // Test 2: Get Session
    console.log('\n2️⃣ Testing Session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('✅ Session valid:', !!sessionData.session);
    }

    // Test 3: Sign Out with timeout
    console.log('\n3️⃣ Testing Sign Out...');
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SignOut timeout')), 5000);
    });

    try {
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('✅ Sign Out successful');
    } catch (signOutError) {
      console.warn('⚠️ Sign Out warning (but continuing):', signOutError.message);
    }

    // Test 4: Verify signed out
    console.log('\n4️⃣ Verifying Sign Out...');
    const { data: finalSession } = await supabase.auth.getSession();
    if (!finalSession.session) {
      console.log('✅ Successfully signed out - no session');
    } else {
      console.log('⚠️ Still have session after sign out');
    }

    console.log('\n🎯 AUTH TEST COMPLETED');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthFlow();