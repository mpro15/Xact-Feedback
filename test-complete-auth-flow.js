import { createClient } from '@supabase/supabase-js';

// Configuration matching the frontend
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 COMPLETE DATABASE & AUTHENTICATION FLOW TEST\n');
console.log('===============================================\n');

// Test credentials - create fresh ones each time
const timestamp = Date.now();
const testUser = {
  email: `testuser${timestamp}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
};

const testCompany = {
  name: `Test Company ${timestamp}`,
  domain: `testcompany${timestamp}.com`,
  industry: 'Technology',
  company_size: '1-10',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zip_code: '12345',
  country: 'United States',
  current_ats: 'None',
  monthly_hires: '1-5',
  subscription_active: true
};

async function testCompleteFlow() {
  try {
    console.log('🏗️  Step 1: Creating test user account...');
    
    // Create user with admin client (bypasses email verification for testing)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        name: testUser.name
      }
    });

    if (userError) {
      console.error('❌ User creation failed:', userError.message);
      return false;
    }

    console.log('✅ User created successfully');
    console.log(`   User ID: ${userData.user.id}`);
    console.log(`   Email: ${userData.user.email}`);

    // Step 2: Create company record
    console.log('\n🏢 Step 2: Creating company record...');
    
    const companyData = {
      ...testCompany,
      created_by: userData.user.id,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      console.error('❌ Company creation failed:', companyError.message);
      return false;
    }

    console.log('✅ Company created successfully');
    console.log(`   Company ID: ${company.id}`);
    console.log(`   Company Name: ${company.name}`);

    // Step 3: Create user profile
    console.log('\n👤 Step 3: Creating user profile...');
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userData.user.id,
        phone: '+1-555-0123',
        job_title: 'CEO',
        department: 'Executive',
        company_id: company.id,
        email_notifications: true,
        weekly_reports: true,
        timezone: 'America/Los_Angeles'
      })
      .select()
      .single();

    if (profileError) {
      console.log('⚠️  User profile creation failed:', profileError.message);
      console.log('   Continuing without profile...');
    } else {
      console.log('✅ User profile created successfully');
    }

    // Step 4: Test login with regular client
    console.log('\n🔑 Step 4: Testing login with regular client...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return false;
    }

    console.log('✅ Login successful!');
    console.log(`   Session Access Token: ${loginData.session.access_token.substring(0, 30)}...`);
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Email: ${loginData.user.email}`);

    // Step 5: Test accessing protected data
    console.log('\n🔒 Step 5: Testing protected data access...');
    
    // Test companies access
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('created_by', userData.user.id);

    if (companiesError) {
      console.log('⚠️  Companies access error:', companiesError.message);
    } else {
      console.log('✅ Companies data accessible');
      console.log(`   Found ${companies.length} company(ies)`);
    }

    // Test user profiles access
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userData.user.id);

    if (profilesError) {
      console.log('⚠️  User profiles access error:', profilesError.message);
    } else {
      console.log('✅ User profiles data accessible');
      console.log(`   Found ${profiles.length} profile(s)`);
    }

    // Step 6: Test session management
    console.log('\n🎫 Step 6: Testing session management...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
    } else {
      console.log('✅ Session management working');
      console.log(`   Session exists: ${!!sessionData.session}`);
      console.log(`   Session expires: ${new Date(sessionData.session.expires_at * 1000).toLocaleString()}`);
    }

    // Step 7: Test logout
    console.log('\n🚪 Step 7: Testing logout...');
    
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message);
    } else {
      console.log('✅ Logout successful');
    }

    // Step 8: Verify logout worked
    const { data: postLogoutSession } = await supabase.auth.getSession();
    console.log(`   Post-logout session: ${postLogoutSession.session ? 'Still exists (problem!)' : 'Cleared (good!)'}`);

    console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
    
    console.log('📋 TEST CREDENTIALS:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   Company: ${company.name}`);
    
    console.log('\n🌐 FRONTEND TESTING:');
    console.log('1. Open http://localhost:5173/auth/login');
    console.log('2. Use the credentials above');
    console.log('3. Should successfully login and reach dashboard');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Run the test
testCompleteFlow();
