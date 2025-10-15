#!/usr/bin/env node

/**
 * Create Test Data with Service Role Key
 * This bypasses RLS policies for test data creation
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jeyrciyahbkgjoqikapw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w';

// Use service role key if available, otherwise use anon key
const apiKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
const clientType = SUPABASE_SERVICE_KEY ? 'Service Role (bypasses RLS)' : 'Anonymous (subject to RLS)';

console.log(`🔗 Connecting to Supabase at: ${SUPABASE_URL}`);
console.log(`🔑 Using: ${clientType}`);

const supabase = createClient(SUPABASE_URL, apiKey);

async function createTestData() {
  console.log('🚀 Creating test company and admin user...\n');

  try {
    // Test database connection first
    const { data: healthCheck, error: healthError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Generate test IDs
    const companyId = randomUUID();
    const userId = randomUUID();
    const timestamp = Date.now();

    console.log('📦 Creating test company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: `Test Company ${timestamp}`,
        domain: `test-${timestamp}.example.com`,
        primary_color: '#2563EB',
        secondary_color: '#059669',
        subscription_plan: 'premium',
        subscription_active: true
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Failed to create company:', companyError.message);
      console.log('🔍 Trying direct SQL insert...');
      
      // Try with direct SQL to bypass RLS
      const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO companies (id, name, domain, primary_color, secondary_color, subscription_plan, subscription_active)
          VALUES ('${companyId}', 'Test Company ${timestamp}', 'test-${timestamp}.example.com', '#2563EB', '#059669', 'premium', true)
          RETURNING *;
        `
      });

      if (sqlError) {
        console.error('❌ SQL insert also failed:', sqlError.message);
        console.log('ℹ️  Manual SQL script available at: scripts/direct_insert_test_data.sql');
        return;
      }
    }

    console.log('✅ Company created successfully');

    // Create admin user
    console.log('👤 Creating admin user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        company_id: companyId,
        email: `admin-${timestamp}@test.example.com`,
        name: 'Test Admin User',
        role: 'admin',
        is_onboarded: true,
        phone: '+1-555-0199',
        department: 'Testing',
        timezone: 'UTC'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user:', userError.message);
      return;
    }

    console.log('✅ Admin user created:', user.email);

    // Create sample candidates
    console.log('🎯 Creating sample candidates...');
    const candidates = [
      {
        id: randomUUID(),
        company_id: companyId,
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        position: 'Software Engineer',
        rejection_stage: 'Technical Interview',
        rejection_reason: 'Needs more React experience',
        applied_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feedback_status: 'not_sent',
        created_by: userId
      },
      {
        id: randomUUID(),
        company_id: companyId,
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        position: 'Backend Developer',
        rejection_stage: 'System Design',
        rejection_reason: 'Limited scalability knowledge',
        applied_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feedback_status: 'not_sent',
        created_by: userId
      },
      {
        id: randomUUID(),
        company_id: companyId,
        name: 'Carol Davis',
        email: 'carol.davis@example.com',
        position: 'Frontend Developer',
        rejection_stage: 'Culture Fit',
        rejection_reason: 'Not aligned with team values',
        applied_date: new Date().toISOString().split('T')[0],
        feedback_status: 'draft',
        created_by: userId
      }
    ];

    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .insert(candidates)
      .select();

    if (candidateError) {
      console.error('❌ Failed to create candidates:', candidateError.message);
    } else {
      console.log(`✅ Created ${candidateData.length} sample candidates`);
    }

    // Display results
    console.log('\n🎉 Test data created successfully!\n');
    console.log('📊 COMPANY DETAILS:');
    console.log(`   ID: ${companyId}`);
    console.log(`   Name: Test Company ${timestamp}`);
    console.log(`   Domain: test-${timestamp}.example.com`);
    console.log(`   Subscription: premium`);

    console.log('\n👤 ADMIN USER:');
    console.log(`   ID: ${userId}`);
    console.log(`   Email: admin-${timestamp}@test.example.com`);
    console.log(`   Name: Test Admin User`);
    console.log(`   Role: admin`);

    console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. Create a Supabase Auth user:');
    console.log(`   - Go to Supabase Dashboard > Authentication > Users`);
    console.log(`   - Click "Add user" > "Create new user"`);
    console.log(`   - Email: admin-${timestamp}@test.example.com`);
    console.log(`   - Password: (choose a secure password)`);
    console.log(`   - Click "Create user"`);
    
    console.log('\n2. Link the Auth user to your profile:');
    console.log(`   - Copy the new Auth user's ID from the dashboard`);
    console.log(`   - Run this SQL in Supabase SQL Editor:`);
    console.log(`   UPDATE users SET id = '[AUTH_USER_ID]' WHERE id = '${userId}';`);
    
    console.log('\n3. Test the application:');
    console.log(`   - Login with: admin-${timestamp}@test.example.com`);
    console.log(`   - Navigate to Candidates page`);
    console.log(`   - Test feedback generation for the sample candidates`);
    console.log(`   - Test email campaigns and tracking features`);

    console.log('\n🧹 CLEANUP AFTER TESTING:');
    console.log(`   node scripts/create_test_data_service.js --cleanup ${companyId}`);

    return { companyId, userId, userEmail: user.email, candidateCount: candidateData?.length || 0 };

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n🔍 If RLS is blocking access, try:');
    console.log('1. Use the direct SQL script: scripts/direct_insert_test_data.sql');
    console.log('2. Run it in Supabase SQL Editor with admin permissions');
  }
}

async function cleanupTestData(companyId) {
  console.log(`🧹 Cleaning up test data for company: ${companyId}`);

  try {
    // Delete in correct order due to foreign key constraints
    const { error: candidatesError } = await supabase
      .from('candidates')
      .delete()
      .eq('company_id', companyId);
    
    if (candidatesError) console.log('⚠️  Candidates cleanup:', candidatesError.message);
    else console.log('✅ Candidates deleted');

    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .eq('company_id', companyId);
    
    if (usersError) console.log('⚠️  Users cleanup:', usersError.message);
    else console.log('✅ Users deleted');

    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    
    if (companyError) console.log('⚠️  Company cleanup:', companyError.message);
    else console.log('✅ Company deleted');

    console.log('🎉 Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--cleanup' && args[1]) {
    await cleanupTestData(args[1]);
  } else {
    await createTestData();
  }
}

main();
