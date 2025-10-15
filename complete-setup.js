import { createClient } from '@supabase/supabase-js';

async function createCompleteSetup() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🎯 Creating complete setup...');
    
    try {
        // Step 1: Create company
        const companyId = 'fe7e7e7e-7e7e-7e7e-7e7e-7e7e7e7e7e7e';
        
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .upsert({
                id: companyId,
                name: 'Simple Test Company',
                domain: 'simpletest.com',
                subscription_plan: 'premium',
                subscription_active: true
            })
            .select()
            .single();

        if (companyError) {
            console.error('❌ Company creation failed:', companyError);
            return;
        }

        console.log('✅ Company created:', company.name);

        // Step 2: Create auth user first
        const email = 'simple@test.com';
        const password = 'simple123';
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Skip email confirmation
        });

        if (authError) {
            console.error('❌ Auth user creation failed:', authError);
            return;
        }

        console.log('✅ Auth user created:', authData.user.email);
        const userId = authData.user.id;

        // Step 3: Create user profile
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

        console.log('✅ User profile created:', userProfile.email);

        // Step 4: Add performance metrics data
        const performanceData = [
            { month: 'Jan', feedback_sent: 145, open_rate: 67.6, click_rate: 23.4 },
            { month: 'Feb', feedback_sent: 167, open_rate: 69.2, click_rate: 24.6 },
            { month: 'Mar', feedback_sent: 189, open_rate: 67.7, click_rate: 23.8 },
            { month: 'Apr', feedback_sent: 201, open_rate: 70.6, click_rate: 25.9 },
            { month: 'May', feedback_sent: 234, open_rate: 68.9, click_rate: 24.8 },
            { month: 'Jun', feedback_sent: 267, open_rate: 70.1, click_rate: 25.1 }
        ];

        const metricsToInsert = performanceData.map(metric => ({
            ...metric,
            company_id: companyId
        }));

        const { data: metrics, error: metricsError } = await supabase
            .from('performance_metrics')
            .insert(metricsToInsert);

        if (metricsError) {
            console.error('❌ Performance metrics creation failed:', metricsError);
        } else {
            console.log('✅ Performance metrics created');
        }

        // Step 5: Add some sample candidates
        const candidatesData = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                position: 'Software Engineer',
                rejection_stage: 'Technical Interview',
                rejection_reason: 'Needs more React experience',
                applied_date: '2024-01-15',
                feedback_status: 'not_sent',
                company_id: companyId,
                created_by: userId
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                position: 'Frontend Developer',
                rejection_stage: 'Code Review',
                rejection_reason: 'Code quality issues',
                applied_date: '2024-01-10',
                feedback_status: 'sent',
                company_id: companyId,
                created_by: userId,
                email_opens: 2,
                email_clicks: 1
            },
            {
                name: 'Mike Johnson',
                email: 'mike.johnson@example.com',
                position: 'Backend Developer',
                rejection_stage: 'System Design',
                rejection_reason: 'Limited scalability knowledge',
                applied_date: '2024-01-05',
                feedback_status: 'draft',
                company_id: companyId,
                created_by: userId
            }
        ];

        const { data: candidates, error: candidatesError } = await supabase
            .from('candidates')
            .insert(candidatesData);

        if (candidatesError) {
            console.error('❌ Candidates creation failed:', candidatesError);
        } else {
            console.log('✅ Sample candidates created');
        }

        console.log('\n🎉 SETUP COMPLETE!');
        console.log('📧 Email: simple@test.com');
        console.log('🔑 Password: simple123');
        console.log('🏢 Company:', company.name);
        console.log('👤 User ID:', userId);
        console.log('🏬 Company ID:', companyId);

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

createCompleteSetup();
