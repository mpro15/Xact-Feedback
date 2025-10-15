import { createClient } from '@supabase/supabase-js';

async function checkUserTableSchema() {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking users table schema...');
    
    try {
        // Get one user to see actual columns
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        if (users && users.length > 0) {
            console.log('✅ Sample user data:');
            console.log(JSON.stringify(users[0], null, 2));
            console.log('\n📋 Available columns:');
            console.log(Object.keys(users[0]).join(', '));
        } else {
            console.log('No users found, trying to insert minimal data...');
            
            const { data: testInsert, error: insertError } = await supabase
                .from('users')
                .insert({
                    id: 'test-schema-check',
                    email: 'test@schema.com'
                })
                .select();
            
            if (insertError) {
                console.log('Insert error reveals required fields:', insertError.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUserTableSchema();
