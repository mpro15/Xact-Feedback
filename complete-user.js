import { createClient } from '@supabase/supabase-js';

async function createCompleteUser() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔧 Creating complete user profile...');
    
    try {
        // User ID for simple@test.com
        const userId = 'b69320e4-4dd9-41d7-9b75-dff9951ed988';
        const email = 'simple@test.com';

        // Get existing company or create one
        let { data: companies, error: compError } = await supabase
            .from('companies')
            .select('*')
            .limit(1);

        let companyId;
        if (companies && companies.length > 0) {
            companyId = companies[0].id;
            console.log('✅ Using existing company:', companies[0].name);
        } else {
            const { data: newCompany, error: newCompError } = await supabase
                .from('companies')
                .insert({ name: 'Simple Company' })
                .select()
                .single();
            
            if (newCompError) {
                console.error('❌ Company creation failed:', newCompError);
                return;
            }
            companyId = newCompany.id;
            console.log('✅ Created new company');
        }

        // Create user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                first_name: 'Simple',
                last_name: 'User',
                company_id: companyId
            })
            .select()
            .single();

        if (profileError) {
            console.error('❌ User profile creation failed:', profileError);
            return;
        }

        console.log('✅ User profile created/updated');

        console.log('\n🎉 COMPLETE USER READY!');
        console.log('========================');
        console.log('📧 Email: simple@test.com');
        console.log('🔑 Password: simple123');
        console.log('👤 Name: Simple User');
        console.log('🏢 Company ID:', companyId);
        console.log('🌐 Login at: http://localhost:5173');
        console.log('========================');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createCompleteUser();
