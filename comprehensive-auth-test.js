import { createClient } from '@supabase/supabase-js';

// Test multiple configurations to identify the issue
const configurations = [
  {
    name: 'Local Instance (Script Config)',
    url: 'http://127.0.0.1:54321',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  {
    name: 'Local Instance (Alternative URL)',
    url: 'http://localhost:54321',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  }
];

const TEST_CREDENTIALS = {
  email: 'testuser1755160371871@xactfeedback.com',
  password: 'TestPassword123!'
};

async function comprehensiveAuthTest() {
  console.log('🔍 COMPREHENSIVE AUTHENTICATION DIAGNOSTICS\n');
  console.log('============================================\n');

  for (const config of configurations) {
    console.log(`\n🧪 Testing: ${config.name}`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Key: ${config.key.substring(0, 20)}...`);
    
    try {
      const supabase = createClient(config.url, config.key);
      
      // Test 1: Basic connection
      console.log('\n   Step 1: Testing basic connection...');
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log(`   ❌ Connection failed: ${sessionError.message}`);
        continue;
      }
      
      console.log('   ✅ Connection successful');
      console.log(`   ✅ Initial session: ${initialSession ? 'Active' : 'None'}`);

      // Test 2: Authentication attempt
      console.log('\n   Step 2: Testing authentication...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password
      });

      if (authError) {
        console.log(`   ❌ Auth failed: ${authError.message}`);
        console.log(`   ❌ Error code: ${authError.status || 'N/A'}`);
        console.log(`   ❌ Error details:`, authError);
        
        // Test if it's a connectivity issue
        if (authError.message.includes('fetch')) {
          console.log('   🔍 This appears to be a network/connectivity issue');
        } else if (authError.message.includes('Invalid login credentials')) {
          console.log('   🔍 This appears to be a credentials/user issue');
        }
        continue;
      }

      console.log('   ✅ Authentication successful!');
      console.log(`   ✅ User ID: ${authData.user?.id}`);
      console.log(`   ✅ Email: ${authData.user?.email}`);
      console.log(`   ✅ Session: ${authData.session ? 'Active' : 'None'}`);
      
      if (authData.session) {
        console.log(`   ✅ Access token: ${authData.session.access_token.substring(0, 20)}...`);
        console.log(`   ✅ Expires at: ${new Date(authData.session.expires_at * 1000).toLocaleString()}`);
      }

      // Test 3: User data access
      console.log('\n   Step 3: Testing user data access...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log(`   ⚠️  User data access failed: ${userError.message}`);
      } else {
        console.log(`   ✅ User data access successful`);
        console.log(`   ✅ User metadata:`, user?.user_metadata || 'None');
      }

      // Test 4: Sign out
      console.log('\n   Step 4: Testing sign out...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log(`   ⚠️  Sign out failed: ${signOutError.message}`);
      } else {
        console.log('   ✅ Sign out successful');
      }

      console.log(`\n   🎉 ${config.name}: ALL TESTS PASSED!`);
      
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
      console.error('   ❌ Error details:', error);
    }
  }
  
  console.log('\n============================================');
  console.log('🔍 ADDITIONAL DIAGNOSTICS');
  console.log('============================================\n');
  
  // Test REST API directly
  console.log('Testing REST API directly...');
  try {
    const response = await fetch('http://127.0.0.1:54321/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      },
      body: JSON.stringify({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ REST API authentication successful');
      console.log(`✅ Access token: ${data.access_token?.substring(0, 20)}...`);
    } else {
      console.log('❌ REST API authentication failed');
      console.log(`❌ Status: ${response.status}`);
      console.log(`❌ Error:`, data);
    }
  } catch (error) {
    console.log('❌ REST API test failed');
    console.error('❌ Error:', error.message);
  }
}

// Run comprehensive test
comprehensiveAuthTest();
