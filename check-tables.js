import { createClient } from '@supabase/supabase-js';

async function checkTables() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📋 Checking database tables...');
    
    try {
        // Check companies table
        const { data: companies, error: compError } = await supabase
            .from('companies')
            .select('*')
            .limit(1);
        
        if (compError) {
            console.log('❌ Companies table:', compError.message);
        } else {
            console.log('✅ Companies table exists');
        }

        // Check users table
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (userError) {
            console.log('❌ Users table:', userError.message);
        } else {
            console.log('✅ Users table exists');
        }

        // Check auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Auth users:', authError.message);
        } else {
            console.log('✅ Auth users accessible, count:', authUsers.users.length);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTables();
