#!/usr/bin/env node

/**
 * Execute Test Data SQL Script
 * This script executes the test data creation SQL directly
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Configuration - try both local and remote Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

console.log(`🔗 Connecting to Supabase at: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestData() {
  console.log('🚀 Creating test company and admin user...\n');

  try {
    // Test database connection first
    const { data: healthCheck, error: healthError } = await supabase
      .from('companies')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      return;
    }

    console.log('✅ Database connection successful');    // Create test company
    const companyId = randomUUID();
    const userId = randomUUID();

    console.log('📦 Creating test company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: 'Manual Test Company',
        domain: 'manual-test.com',
        primary_color: '#2563EB',
        secondary_color: '#059669',
        subscription_plan: 'premium',
        subscription_active: true
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Failed to create company:', companyError.message);
      return;
    }

    console.log('✅ Company created:', company.name);

    // Create admin user
    console.log('👤 Creating admin user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        company_id: companyId,
        email: 'admin@manual-test.com',
        name: 'Manual Test Admin',
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
    console.log('🎯 Creating sample candidates...');    const candidates = [
      {
        id: randomUUID(),
        company_id: companyId,
        name: 'Test Candidate 1',
        email: 'candidate1@example.com',
        position: 'Software Engineer',
        rejection_stage: 'Technical Interview',
        rejection_reason: 'Needs more React experience',
        applied_date: new Date().toISOString().split('T')[0],
        feedback_status: 'not_sent',
        created_by: userId
      },
      {
        id: randomUUID(),
        company_id: companyId,
        name: 'Test Candidate 2',
        email: 'candidate2@example.com',
        position: 'Backend Developer',
        rejection_stage: 'System Design',
        rejection_reason: 'Limited scalability knowledge',
        applied_date: new Date().toISOString().split('T')[0],
        feedback_status: 'not_sent',
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
    console.log(`   Name: ${company.name}`);
    console.log(`   Domain: ${company.domain}`);
    console.log(`   Subscription: ${company.subscription_plan}`);

    console.log('\n👤 ADMIN USER:');
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);

    console.log('\n📋 NEXT STEPS FOR MANUAL TESTING:');
    console.log('1. Create a Supabase Auth user:');
    console.log(`   - Email: ${user.email}`);
    console.log('   - Password: (choose a secure password)');
    console.log(`2. Update the user record to use the Auth user ID:`);
    console.log(`   UPDATE users SET id = '[AUTH_USER_ID]' WHERE email = '${user.email}';`);
    console.log('3. Login to the application with the admin credentials');
    console.log('4. Test feedback generation and email campaigns');

    console.log('\n🧹 CLEANUP COMMAND:');
    console.log(`   node scripts/create_test_data.js --cleanup ${companyId}`);

    return { companyId, userId };

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function cleanupTestData(companyId) {
  console.log(`🧹 Cleaning up test data for company: ${companyId}`);

  try {
    // Delete in correct order due to foreign key constraints
    await supabase.from('candidates').delete().eq('company_id', companyId);
    console.log('✅ Candidates deleted');

    await supabase.from('users').delete().eq('company_id', companyId);
    console.log('✅ Users deleted');

    await supabase.from('companies').delete().eq('id', companyId);
    console.log('✅ Company deleted');

    console.log('🎉 Cleanup completed successfully');
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
