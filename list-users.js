import { createClient } from '@supabase/supabase-js';

async function listExistingUsers() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('👥 Listing existing users...');
    
    try {
        // Get auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error listing auth users:', authError);
            return;
        }

        console.log('\n📧 Existing Auth Users:');
        for (const user of authUsers.users) {
            console.log(`Email: ${user.email} | ID: ${user.id}`);
        }

        // Get user profiles
        const { data: userProfiles, error: profileError } = await supabase
            .from('users')
            .select('*');
        
        if (profileError) {
            console.error('❌ Error getting user profiles:', profileError);
        } else {
            console.log('\n👤 User Profiles in Database:');
            for (const profile of userProfiles) {
                console.log(`Email: ${profile.email} | Name: ${profile.first_name} ${profile.last_name} | Company: ${profile.company_id}`);
            }
        }

        // Try to use the first user with a simple password reset
        if (authUsers.users.length > 0) {
            const firstUser = authUsers.users[0];
            console.log('\n🔧 Setting simple password for first user...');
            
            const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
                firstUser.id,
                { password: 'simple123' }
            );

            if (updateError) {
                console.error('❌ Password update failed:', updateError);
            } else {
                console.log('✅ Password updated successfully!');
                
                console.log('\n🎉 READY TO LOGIN!');
                console.log('===================');
                console.log('📧 Email:', firstUser.email);
                console.log('🔑 Password: simple123');
                console.log('🌐 URL: http://localhost:5173');
                console.log('===================');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listExistingUsers();
