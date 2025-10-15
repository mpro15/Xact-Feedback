import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH--qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserProfile() {
  console.log('Creating user profile for test user...');
  
  // Insert user profile
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: 'e0551eed-ef80-4786-918a-caca012ea6e5',
      email: 'testuser1755164410146@xactfeedback.com',
      name: 'Test User',
      company_id: '3d9b499b-0839-4ca1-924e-c2897f6484e3',
      account_type: 'admin',
      role: 'admin',
      is_onboarded: true,
      is_approved: true
    })
    .select();
    
  if (error) {
    console.error('Error creating user profile:', error);
  } else {
    console.log('✅ User profile created successfully:', data);
  }
}

createUserProfile();
