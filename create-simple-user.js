import { createClient } from '@supabase/supabase-js';

// Simple script to create a user directly in Supabase
async function createSimpleUser() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('🔨 Creating simple user in Supabase...');
    
    try {        // 1. Create user in auth.users
        const email = 'simple@test.com';
        const password = 'simple123';
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Skip email verification
        });

        if (authError) {
            console.error('❌ Auth user creation failed:', authError);
            return;
        }

        console.log('✅ Auth user created:', authUser.user.id);        // 2. Create company with minimal required fields
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                name: 'Test Company'
            })
            .select()
            .single();

        if (companyError) {
            console.error('❌ Company creation failed:', companyError);
            return;
        }

        console.log('✅ Company created:', company.id);        // 3. Create user profile with minimal fields
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authUser.user.id,
                email: email,
                first_name: 'Simple',
                last_name: 'User',
                company_id: company.id
            })
            .select()
            .single();

        if (profileError) {
            console.error('❌ User profile creation failed:', profileError);
            return;
        }

        console.log('✅ User profile created');

        console.log('\n🎉 SIMPLE USER CREATED SUCCESSFULLY!');
        console.log('=====================================');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('🏢 Company:', company.name);
        console.log('👤 Role: Admin');
        console.log('=====================================');
        console.log('\n✅ Ready to login at: http://localhost:5173');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createSimpleUser();
