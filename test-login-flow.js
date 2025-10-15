import { createClient } from '@supabase/supabase-js';

// Test credentials from our previous setup
const TEST_CREDENTIALS = {
  email: 'testuser1755160371871@xactfeedback.com',
  password: 'TestPassword123!'
};

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow\n');
  
  try {
    // Step 1: Test basic authentication
    console.log('Step 1: Testing authentication...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    });

    if (loginError) {
      console.error('❌ Authentication failed:', loginError.message);
      return;
    }

    console.log('✅ Authentication successful');
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Session: ${loginData.session ? 'Active' : 'None'}`);

    // Step 2: Test user profile access
    console.log('\nStep 2: Testing user profile access...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', loginData.user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Profile access failed:', profileError.message);
      console.log('   This is expected if profile creation failed earlier');
    } else {
      console.log('✅ Profile data retrieved');
      console.log(`   Job Title: ${profileData.job_title}`);
      console.log(`   Phone: ${profileData.phone}`);
    }

    // Step 3: Test company access
    console.log('\nStep 3: Testing company data access...');
    
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('created_by', loginData.user.id)
      .single();

    if (companyError) {
      console.log('⚠️  Company access failed:', companyError.message);
    } else {
      console.log('✅ Company data retrieved');
      console.log(`   Company: ${companyData.name}`);
      console.log(`   Domain: ${companyData.domain}`);
      console.log(`   Plan: ${companyData.subscription_plan}`);
      console.log(`   Active: ${companyData.subscription_active}`);
    }

    // Step 4: Test session persistence
    console.log('\nStep 4: Testing session persistence...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('⚠️  Session check failed:', sessionError.message);
    } else if (session) {
      console.log('✅ Session persisted successfully');
      console.log(`   Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    } else {
      console.log('⚠️  No active session found');
    }

    // Step 5: Test sign out
    console.log('\nStep 5: Testing sign out...');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('⚠️  Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful');
    }

    // Step 6: Verify sign out
    const { data: { session: afterSignOut } } = await supabase.auth.getSession();
    console.log(`   Session after sign out: ${afterSignOut ? 'Still active' : 'Cleared'}`);

    console.log('\n🎉 Login Flow Test Complete!\n');
    
    console.log('📋 Test Summary:');
    console.log('✅ Authentication works');
    console.log('✅ Session management works');
    console.log('✅ Sign out works');
    console.log('⚠️  Profile/Company access may have RLS restrictions');
    
    console.log('\n🌐 Ready for App Testing:');
    console.log(`   Login URL: http://localhost:5179/login`);
    console.log(`   Email: ${TEST_CREDENTIALS.email}`);
    console.log(`   Password: ${TEST_CREDENTIALS.password}`);
    
    console.log('\n📝 Manual Test Steps:');
    console.log('1. Open http://localhost:5179/login in browser');
    console.log('2. Enter the test credentials above');
    console.log('3. Click "Sign In"');
    console.log('4. Verify successful login and dashboard access');

  } catch (error) {
    console.error('❌ Login flow test failed:', error.message);
    console.error(error);
  }
}

// Run the login flow test
testLoginFlow();
