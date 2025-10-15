// Frontend Configuration Test
// This will run in the browser to check what Supabase config the frontend is using

// Check environment variables (these should be loaded by Vite)
console.log('🔍 FRONTEND ENVIRONMENT CHECK');
console.log('==============================');

// Access environment variables the way the frontend does
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log(`VITE_SUPABASE_URL: ${supabaseUrl}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING'}`);

// Test the same configuration the frontend uses
import { createClient } from '@supabase/supabase-js';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables missing!');
  console.log('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
  console.log('\n✅ Environment variables loaded');
  
  // Create client exactly like the frontend does
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    fetch: (input, init) => {
      init = init || {};
      init.headers = {
        ...init.headers,
        Accept: 'application/json',
      };
      return fetch(input, init);
    },
  });
  
  // Test authentication
  const testCredentials = {
    email: 'testuser1755160371871@xactfeedback.com',
    password: 'TestPassword123!'
  };
  
  console.log('\n🧪 Testing authentication with frontend config...');
  
  supabase.auth.signInWithPassword(testCredentials)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Frontend auth failed:', error.message);
        console.error('❌ Error details:', error);
      } else {
        console.log('✅ Frontend auth successful!');
        console.log(`✅ User: ${data.user?.email}`);
        console.log(`✅ Session: ${data.session ? 'Active' : 'None'}`);
        
        // Sign out
        return supabase.auth.signOut();
      }
    })
    .then(() => {
      console.log('✅ Sign out completed');
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
    });
}

export {}; // Make this a module
