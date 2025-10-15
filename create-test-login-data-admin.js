import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key for admin operations
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
// Regular client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const TEST_USER = {
  email: 'admin@testcompany.com',
  password: 'TestPassword123!',
  name: 'John Admin',
  phone: '+1-555-0123',
  job_title: 'CEO'
};

// Test company data
const TEST_COMPANY = {
  name: 'Test Company Inc',
  domain: 'testcompany.com',
  address: '123 Business Ave',
  city: 'San Francisco',
  state: 'CA',
  zip_code: '94105',
  country: 'US',
  industry: 'Technology',
  company_size: '11-50',
  current_ats: 'Greenhouse',
  monthly_hires: '6-10',
  subscription_plan: 'professional',
  subscription_active: true,
  primary_color: '#2563EB',
  secondary_color: '#059669'
};

async function createTestLoginData() {
  console.log('🚀 Creating Test Company and User for Login Testing\n');

  try {
    // Step 1: Create the auth user using admin client
    console.log('Step 1: Creating authentication user with admin client...');
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: {
        name: TEST_USER.name
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Email Confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

    // Step 2: Create the company using admin client
    console.log('\nStep 2: Creating test company with admin client...');
    
    const companyData = {
      ...TEST_COMPANY,
      created_by: authData.user.id,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      console.error('❌ Company creation failed:', companyError.message);
      console.error('Error details:', companyError);
      return;
    }

    console.log('✅ Company created successfully');
    console.log(`   Company ID: ${company.id}`);
    console.log(`   Company Name: ${company.name}`);

    // Step 3: Create the user profile using admin client
    console.log('\nStep 3: Creating user profile with admin client...');
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        phone: TEST_USER.phone,
        job_title: TEST_USER.job_title,
        department: 'Executive',
        company_id: company.id,
        email_notifications: true,
        weekly_reports: true,
        timezone: 'America/Los_Angeles'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ User profile creation failed:', profileError.message);
      console.error('Error details:', profileError);
      return;
    }

    console.log('✅ User profile created successfully');
    console.log(`   Profile ID: ${profile.id}`);

    // Step 4: Test login with regular client
    console.log('\nStep 4: Testing login with regular client...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      console.error('Error details:', loginError);
    } else {
      console.log('✅ Login test successful');
      console.log(`   Access Token: ${loginData.session.access_token.substring(0, 20)}...`);
      console.log(`   User ID: ${loginData.user.id}`);
      
      // Test fetching user data
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*, companies(*)')
        .eq('user_id', loginData.user.id)
        .single();

      if (userError) {
        console.log('⚠️  User data fetch failed:', userError.message);
      } else {
        console.log('✅ User data fetch successful');
        console.log(`   Company: ${userData.companies?.name}`);
        console.log(`   Job Title: ${userData.job_title}`);
      }
      
      // Sign out after test
      await supabase.auth.signOut();
    }

    console.log('\n🎉 Test Login Data Creation Complete!\n');
    
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log(`   Company: ${TEST_COMPANY.name}`);
    
    console.log('\n🔗 Test URLs:');
    console.log(`   App Login: http://localhost:5179/login`);
    console.log(`   Dashboard: http://localhost:5179/dashboard`);
    console.log(`   Supabase Studio: http://127.0.0.1:54323`);
    
    console.log('\n✅ You can now test login to the app using these credentials!');
    console.log('\n📝 Test Steps:');
    console.log('1. Open http://localhost:5179/login');
    console.log('2. Enter the email and password above');
    console.log('3. Click "Sign In"');
    console.log('4. You should be redirected to the dashboard');

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    console.error(error);
  }
}

// Run the test data creation
createTestLoginData();
