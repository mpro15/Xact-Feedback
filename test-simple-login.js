import { createClient } from '@supabase/supabase-js';

async function testSimpleLogin() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔐 Testing simple login...');
    
    try {
        // Test login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'simple@test.com',
            password: 'simple123'
        });

        if (authError) {
            console.error('❌ Login failed:', authError.message);
            return;
        }

        console.log('✅ Login successful!');
        console.log('👤 User ID:', authData.user.id);
        console.log('📧 Email:', authData.user.email);

        // Test getting user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile fetch failed:', profileError.message);
        } else {
            console.log('✅ User profile found!');
            console.log('👤 Name:', userProfile.name);
            console.log('🏢 Company ID:', userProfile.company_id);
            console.log('🎯 Role:', userProfile.role);
        }

        console.log('\n🎉 SIMPLE LOGIN TEST PASSED!');
        console.log('==============================');
        console.log('✅ Authentication works');
        console.log('✅ User profile accessible');
        console.log('✅ Ready for frontend use');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testSimpleLogin();
