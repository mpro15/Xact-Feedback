import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

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
    // Step 1: Create the auth user
    console.log('Step 1: Creating authentication user...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          name: TEST_USER.name,
          email_confirm: true // Auto-confirm for testing
        }
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Wait a moment for user to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Create the company
    console.log('\nStep 2: Creating test company...');
    
    const companyData = {
      ...TEST_COMPANY,
      created_by: authData.user.id,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (companyError) {
      console.error('❌ Company creation failed:', companyError.message);
      return;
    }

    console.log('✅ Company created successfully');
    console.log(`   Company ID: ${company.id}`);
    console.log(`   Company Name: ${company.name}`);

    // Step 3: Create the user profile
    console.log('\nStep 3: Creating user profile...');
    
    const { data: profile, error: profileError } = await supabase
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
      return;
    }

    console.log('✅ User profile created successfully');
    console.log(`   Profile ID: ${profile.id}`);

    // Step 4: Confirm the user's email (for testing purposes)
    console.log('\nStep 4: Confirming user email...');
    
    // Use admin client to confirm email
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.log('⚠️  Email confirmation may require admin privileges');
    } else {
      console.log('✅ Email confirmed successfully');
    }

    // Step 5: Test login
    console.log('\nStep 5: Testing login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful');
      console.log(`   Session ID: ${loginData.session.access_token.substring(0, 20)}...`);
      
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
    console.log(`   Supabase Studio: http://127.0.0.1:54323`);
    
    console.log('\n✅ You can now test login to the app using these credentials!');

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    console.error(error);
  }
}

// Run the test data creation
createTestLoginData();
