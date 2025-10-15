#!/usr/bin/env node

/**
 * Create Test Data for Xact-Feedback Application
 * This script creates a complete test company and admin user for manual testing
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Required for creating auth users

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL or SUPABASE_URL');
  console.log('Required: VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  console.log('Optional: SUPABASE_SERVICE_ROLE_KEY (for creating auth users)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data configuration
const TEST_COMPANY = {
  id: `test-company-${Date.now()}`,
  name: 'Acme Testing Corp',
  domain: 'acme-testing.com',
  logo_url: 'https://via.placeholder.com/150x150/2563EB/FFFFFF?text=ACME',
  primary_color: '#2563EB',
  secondary_color: '#059669',
  settings: { email_notifications: true, daily_limit: 100 },
  subscription_plan: 'premium',
  subscription_active: true,
  credits: 1000,
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_user: 'test@acme-testing.com',
  smtp_pass: 'test_password_123',
  smtp_secure: true
};

const TEST_ADMIN = {
  id: `admin-user-${Date.now()}`,
  email: 'admin@acme-testing.com',
  password: 'TestAdmin123!',
  name: 'Test Admin User',
  role: 'admin',
  is_onboarded: true,
  phone: '+1-555-0123',
  department: 'Human Resources',
  bio: 'Test admin user for manual testing of the Xact-Feedback application',
  timezone: 'UTC',
  profile_image_url: 'https://via.placeholder.com/100x100/059669/FFFFFF?text=TA'
};

const SAMPLE_CANDIDATES = [
  {
    id: crypto.randomUUID(),
    name: 'John Smith',
    email: 'john.smith@example.com',
    position: 'Senior Frontend Developer',
    rejection_stage: 'Technical Interview',
    rejection_reason: 'Lack of React experience',
    applied_date: '2025-01-01',
    feedback_status: 'not_sent'
  },
  {
    id: crypto.randomUUID(),
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    position: 'Backend Engineer',
    rejection_stage: 'Phone Screen',
    rejection_reason: 'Insufficient system design knowledge',
    applied_date: '2025-01-02',
    feedback_status: 'not_sent'
  },
  {
    id: crypto.randomUUID(),
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    position: 'Full Stack Developer',
    rejection_stage: 'Final Round',
    rejection_reason: 'Team fit concerns',
    applied_date: '2025-01-03',
    feedback_status: 'draft'
  }
];

async function createTestCompany() {
  console.log('📦 Creating test company...');
  
  const { data, error } = await supabase
    .from('companies')
    .insert(TEST_COMPANY)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Failed to create company:', error.message);
    throw error;
  }
  
  console.log('✅ Company created:', data.name);
  return data;
}

async function createTestUser() {
  console.log('👤 Creating test admin user...');
  
  // Create the user profile record
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: TEST_ADMIN.id,
      company_id: TEST_COMPANY.id,
      email: TEST_ADMIN.email,
      name: TEST_ADMIN.name,
      role: TEST_ADMIN.role,
      is_onboarded: TEST_ADMIN.is_onboarded,
      phone: TEST_ADMIN.phone,
      department: TEST_ADMIN.department,
      bio: TEST_ADMIN.bio,
      timezone: TEST_ADMIN.timezone,
      profile_image_url: TEST_ADMIN.profile_image_url
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Failed to create user profile:', error.message);
    throw error;
  }
  
  console.log('✅ User profile created:', data.email);
  return data;
}

async function createSampleCandidates() {
  console.log('🎯 Creating sample candidates...');
  
  const candidatesWithCompany = SAMPLE_CANDIDATES.map(candidate => ({
    ...candidate,
    company_id: TEST_COMPANY.id,
    created_by: TEST_ADMIN.id
  }));
  
  const { data, error } = await supabase
    .from('candidates')
    .insert(candidatesWithCompany)
    .select();
  
  if (error) {
    console.error('❌ Failed to create candidates:', error.message);
    throw error;
  }
  
  console.log(`✅ Created ${data.length} sample candidates`);
  return data;
}

async function createCreditsBalance() {
  console.log('💰 Setting up credits balance...');
  
  const { data, error } = await supabase
    .from('credits_balance')
    .upsert({
      company_id: TEST_COMPANY.id,
      credits: TEST_COMPANY.credits
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Failed to create credits balance:', error.message);
    // This might fail if the table doesn't exist, which is okay
    console.log('⚠️  Credits balance table might not exist - this is optional');
    return null;
  }
  
  console.log('✅ Credits balance set:', data.credits);
  return data;
}

async function displayTestData() {
  console.log('\n🎉 Test data created successfully!\n');
  
  console.log('📊 COMPANY DETAILS:');
  console.log(`   ID: ${TEST_COMPANY.id}`);
  console.log(`   Name: ${TEST_COMPANY.name}`);
  console.log(`   Domain: ${TEST_COMPANY.domain}`);
  console.log(`   Subscription: ${TEST_COMPANY.subscription_plan}`);
  console.log(`   Credits: ${TEST_COMPANY.credits}`);
  
  console.log('\n👤 ADMIN USER:');
  console.log(`   ID: ${TEST_ADMIN.id}`);
  console.log(`   Email: ${TEST_ADMIN.email}`);
  console.log(`   Password: ${TEST_ADMIN.password}`);
  console.log(`   Role: ${TEST_ADMIN.role}`);
  console.log(`   Status: Onboarded`);
  
  console.log('\n🎯 SAMPLE CANDIDATES:');
  SAMPLE_CANDIDATES.forEach((candidate, index) => {
    console.log(`   ${index + 1}. ${candidate.name} - ${candidate.position}`);
  });
  
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
  console.log('1. To test with authentication:');
  console.log(`   - Create a Supabase Auth user with email: ${TEST_ADMIN.email}`);
  console.log(`   - Update the users table to link the Auth user ID`);
  console.log('   - Use the credentials above to log in');
  
  console.log('\n2. Test scenarios:');
  console.log('   - Generate feedback for sample candidates');
  console.log('   - Test email campaigns and tracking');
  console.log('   - Test credit deduction for premium features');
  console.log('   - Test company settings and SMTP configuration');
  
  console.log('\n3. Clean up after testing:');
  console.log(`   npm run cleanup-test-data ${TEST_COMPANY.id}`);
}

async function main() {
  try {
    console.log('🚀 Creating test data for Xact-Feedback application...\n');
    
    // Create test data
    await createTestCompany();
    await createTestUser();
    await createSampleCandidates();
    await createCreditsBalance();
    
    // Display results
    await displayTestData();
    
    // Save test IDs for cleanup
    const testIds = {
      companyId: TEST_COMPANY.id,
      userId: TEST_ADMIN.id,
      candidateIds: SAMPLE_CANDIDATES.map(c => c.id),
      createdAt: new Date().toISOString()
    };
    
    console.log('\n💾 Test IDs saved for cleanup:');
    console.log(JSON.stringify(testIds, null, 2));
    
  } catch (error) {
    console.error('\n❌ Failed to create test data:', error.message);
    process.exit(1);
  }
}

// Handle cleanup if script is called with cleanup flag
if (process.argv.includes('--cleanup') && process.argv[3]) {
  const companyId = process.argv[3];
  
  async function cleanup() {
    console.log(`🧹 Cleaning up test data for company: ${companyId}`);
    
    try {
      // Delete in correct order due to foreign key constraints
      await supabase.from('candidates').delete().eq('company_id', companyId);
      await supabase.from('users').delete().eq('company_id', companyId);
      await supabase.from('credits_balance').delete().eq('company_id', companyId);
      await supabase.from('companies').delete().eq('id', companyId);
      
      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
  
  cleanup();
} else {
  main();
}
