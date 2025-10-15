import { createClient } from '@supabase/supabase-js';

async function testDashboardData() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🧪 Testing dashboard data...');
    
    try {
        // Test login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'simple@test.com',
            password: 'simple123'
        });

        if (loginError) {
            console.error('❌ Login failed:', loginError.message);
            return;
        }

        console.log('✅ Login successful');

        // Test performance_metrics table
        const { data: performanceData, error: performanceError } = await supabase
            .from('performance_metrics')
            .select('*');

        if (performanceError) {
            console.error('❌ Performance metrics fetch failed:', performanceError.message);
        } else {
            console.log('✅ Performance metrics found:', performanceData.length, 'records');
            console.log('📊 Sample data:', performanceData[0]);
        }

        // Test candidates table
        const { data: candidatesData, error: candidatesError } = await supabase
            .from('candidates')
            .select('*');

        if (candidatesError) {
            console.error('❌ Candidates fetch failed:', candidatesError.message);
        } else {
            console.log('✅ Candidates found:', candidatesData.length, 'records');
        }

        // Test users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'simple@test.com')
            .single();

        if (userError) {
            console.error('❌ User data fetch failed:', userError.message);
        } else {
            console.log('✅ User data found:', userData.name);
            console.log('🏢 Company ID:', userData.company_id);
        }

        console.log('\n🎉 All dashboard data is ready!');
        console.log('🌐 Visit: http://localhost:5174');
        console.log('📧 Login with: simple@test.com');
        console.log('🔑 Password: simple123');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testDashboardData();
