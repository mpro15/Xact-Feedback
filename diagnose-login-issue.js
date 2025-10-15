import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseLoginIssue() {
  console.log('🔍 Diagnosing Login Issue\n');

  // Test credentials from our previous setup
  const testEmail = 'testuser1755160371871@xactfeedback.com';
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Check if user exists using admin client
    console.log('Step 1: Checking if user exists...');
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      return;
    }

    const testUser = users.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.log('❌ Test user not found! Creating new test user...');
      await createNewTestUser();
      return;
    }

    console.log('✅ Test user found');
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Email Confirmed: ${testUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Created: ${testUser.created_at}`);

    // Step 2: Test login with the credentials
    console.log('\nStep 2: Testing login with credentials...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      console.error('   Error code:', loginError.status);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔧 Attempting to fix password...');
        
        // Try to update the password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          testUser.id,
          { password: testPassword }
        );
        
        if (updateError) {
          console.error('❌ Password update failed:', updateError.message);
        } else {
          console.log('✅ Password updated successfully');
          
          // Try login again
          console.log('\nStep 3: Retrying login after password update...');
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          });
          
          if (retryError) {
            console.error('❌ Login still failed:', retryError.message);
          } else {
            console.log('✅ Login successful after password update!');
            await supabase.auth.signOut();
          }
        }
      }
    } else {
      console.log('✅ Login successful');
      console.log(`   Session: ${loginData.session ? 'Active' : 'None'}`);
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

async function createNewTestUser() {
  console.log('\n🛠️  Creating new test user...');
  
  const timestamp = Date.now();
  const newEmail = `testuser${timestamp}@xactfeedback.com`;
  const newPassword = 'TestPassword123!';
  
  try {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: newEmail,
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test User'
      }
    });

    if (createError) {
      console.error('❌ Failed to create new user:', createError.message);
      return;
    }

    console.log('✅ New test user created');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   User ID: ${newUser.user.id}`);

    // Test the new credentials
    console.log('\n🧪 Testing new credentials...');
    
    const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
      email: newEmail,
      password: newPassword
    });

    if (testError) {
      console.error('❌ New user login failed:', testError.message);
    } else {
      console.log('✅ New user login successful!');
      await supabase.auth.signOut();
      
      // Update credentials file
      console.log('\n📝 Updating credentials file...');
      console.log(`\n🔐 NEW LOGIN CREDENTIALS:`);
      console.log(`   Email: ${newEmail}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Login URL: http://localhost:5179/login`);
    }

  } catch (error) {
    console.error('❌ Failed to create new test user:', error.message);
  }
}

// Run the diagnosis
diagnoseLoginIssue();
