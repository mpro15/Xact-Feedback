#!/usr/bin/env node

/**
 * Debug script to test the signup process directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jeyrciyahbkgjoqikapw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = `TestPass${Date.now()}!`;
    const testName = 'Test User';
    const testCompany = `Test Company ${Date.now()}`;

    console.log('🧪 Testing Signup Process');
    console.log('========================');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log(`Name: ${testName}`);
    console.log(`Company: ${testCompany}`);
    console.log('');

    try {
        // Test auth signup
        console.log('1. Testing auth signup...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: { name: testName }
            }
        });

        if (authError) {
            console.error('❌ Auth signup failed:', authError);
            return;
        }

        console.log('✅ Auth signup successful:', authData.user?.id);

        // Test company creation
        console.log('2. Testing company creation...');
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({ 
                name: testCompany, 
                created_by: authData.user.id 
            })
            .select()
            .single();

        if (companyError) {
            console.error('❌ Company creation failed:', companyError);
            return;
        }

        console.log('✅ Company creation successful:', companyData.id);

        // Test user profile creation
        console.log('3. Testing user profile creation...');
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                name: testName,
                company_id: companyData.id,
                account_type: 'admin',
                is_onboarded: false,
                is_approved: true
            });

        if (profileError) {
            console.error('❌ User profile creation failed:', profileError);
            return;
        }

        console.log('✅ User profile creation successful');
        console.log('');
        console.log('🎉 Full signup process completed successfully!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testSignup();
