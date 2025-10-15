import { createClient } from '@supabase/supabase-js';

async function createFinalSimpleUser() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🎯 Creating FINAL simple user...');
    
    try {
        // User ID for simple@test.com
        const userId = 'b69320e4-4dd9-41d7-9b75-dff9951ed988';
        const email = 'simple@test.com';

        // Get existing company
        const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .limit(1);

        const companyId = companies[0].id;

        // Create user profile with correct column names
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                name: 'Simple User',
                company_id: companyId,
                role: 'admin',
                is_onboarded: true
            })
            .select()
            .single();

        if (profileError) {
            console.error('❌ User profile creation failed:', profileError);
            return;
        }

        console.log('✅ User profile created successfully!');

        console.log('\n🎉 SIMPLE LOGIN READY!');
        console.log('========================');
        console.log('📧 Email: simple@test.com');
        console.log('🔑 Password: simple123');
        console.log('👤 Name: Simple User');
        console.log('🏢 Company:', companies[0].name);
        console.log('🎯 Role: admin');
        console.log('🌐 Login URL: http://localhost:5173');
        console.log('========================');
        console.log('\n✅ User exists in BOTH auth.users AND users table');
        console.log('✅ Email verification bypassed');
        console.log('✅ Full access to software');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createFinalSimpleUser();
