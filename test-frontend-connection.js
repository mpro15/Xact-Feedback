import { createClient } from '@supabase/supabase-js';

// Test the frontend configuration by using the same environment variables
const supabaseUrl = 'http://127.0.0.1:54321'; // Local instance
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Our known working test credentials
const TEST_CREDENTIALS = {
  email: 'testuser1755160371871@xactfeedback.com',
  password: 'TestPassword123!'
};

async function testFrontendConnection() {
  console.log('🧪 Testing Frontend Supabase Connection\n');
  
  try {
    // Test 1: Verify Supabase connection
    console.log('Step 1: Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log(`   Current session: ${session ? 'Active' : 'None'}`);

    // Test 2: Test authentication with our credentials
    console.log('\nStep 2: Testing authentication with known credentials...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      console.error('   Error details:', loginError);
      
      // Check if it's a different instance issue
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Checking if user exists in current instance...');
        
        // We can't list users with anon key, so let's try to sign up with a different email to test connectivity
        const testEmail = `connectivity-test-${Date.now()}@example.com`;
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPassword123!',
          options: {
            data: { name: 'Connectivity Test' }
          }
        });
        
        if (signupError) {
          console.error('❌ Signup test failed:', signupError.message);
          console.log('   This suggests a connection or configuration issue');
        } else {
          console.log('✅ Signup test successful - connection is working');
          console.log('   Issue likely: test user doesn\'t exist in current instance');
          
          // Clean up test user by signing out
          await supabase.auth.signOut();
        }
      }
      return;
    }

    console.log('✅ Authentication successful!');
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Session expires: ${new Date(loginData.session.expires_at * 1000).toLocaleString()}`);

    // Test 3: Test sign out
    console.log('\nStep 3: Testing sign out...');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('⚠️  Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful');
    }

    console.log('\n🎉 Frontend Connection Test Complete!\n');
    
    console.log('📋 Test Results:');
    console.log('✅ Supabase connection works');
    console.log('✅ Authentication works');
    console.log('✅ Session management works');
    
    console.log('\n🌐 Ready for Frontend Login Test:');
    console.log(`   URL: http://localhost:5173/login`);
    console.log(`   Email: ${TEST_CREDENTIALS.email}`);
    console.log(`   Password: ${TEST_CREDENTIALS.password}`);

  } catch (error) {
    console.error('❌ Frontend connection test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testFrontendConnection();
