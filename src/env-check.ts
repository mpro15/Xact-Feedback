console.log('🔍 FRONTEND ENVIRONMENT VARIABLES CHECK');
console.log('=====================================');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_ANON_KEY preview:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + '...');
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

import { supabase } from './lib/supabaseClient';

// Test the actual supabase client
console.log('\n🧪 TESTING SUPABASE CLIENT');
console.log('==========================');

// Test 1: Basic connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Session check failed:', error);
  } else {
    console.log('✅ Session check successful:', data.session ? 'Has session' : 'No session');
  }
});

// Test 2: Test authentication
const testAuth = async () => {
  console.log('\n🔐 TESTING AUTHENTICATION');
  console.log('=========================');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'testuser1755160371871@xactfeedback.com',
      password: 'TestPassword123!'
    });
    
    if (error) {
      console.error('❌ Auth failed:', error);
    } else {
      console.log('✅ Auth successful!');
      console.log('User:', data.user?.email);
      console.log('Session:', data.session ? 'Active' : 'None');
      
      // Sign out immediately
      await supabase.auth.signOut();
      console.log('✅ Signed out');
    }
  } catch (error) {
    console.error('❌ Auth test error:', error);
  }
};

// Run the test after a short delay
setTimeout(testAuth, 1000);

export {};
