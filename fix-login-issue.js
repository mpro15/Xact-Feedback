// Quick verification and fix for login issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🔍 Verifying Login Issue...')

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create regular client
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAndFixLogin() {
  try {
    console.log('\n1️⃣ Checking recent test users...')
    
    // Get recent auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ Error listing users:', authError.message)
      return
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users`)
    
    // Find most recent test user
    const testUsers = authUsers.users
      .filter(user => user.email?.includes('testuser'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    if (testUsers.length === 0) {
      console.log('❌ No test users found. Creating a new one...')
      await createNewTestUser()
      return
    }
    
    const latestUser = testUsers[0]
    console.log(`✅ Latest test user: ${latestUser.email}`)
    console.log(`   User ID: ${latestUser.id}`)
    console.log(`   Email Confirmed: ${latestUser.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log(`   Created: ${latestUser.created_at}`)
    
    console.log('\n2️⃣ Testing login with latest user...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: latestUser.email,
      password: 'TestPassword123!'
    })
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message)
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n🔧 Attempting to fix by confirming email...')
        
        // Confirm email if not confirmed
        if (!latestUser.email_confirmed_at) {
          const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
            latestUser.id,
            { email_confirm: true }
          )
          
          if (confirmError) {
            console.log('❌ Email confirmation failed:', confirmError.message)
          } else {
            console.log('✅ Email confirmed')
            
            // Try login again
            console.log('🔄 Retrying login...')
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: latestUser.email,
              password: 'TestPassword123!'
            })
            
            if (retryError) {
              console.log('❌ Retry login failed:', retryError.message)
              console.log('\n🆕 Creating fresh user...')
              await createNewTestUser()
            } else {
              console.log('✅ Retry login successful!')
              console.log(`   Access Token: ${retryData.session?.access_token?.substring(0, 20)}...`)
              await supabase.auth.signOut()
              
              console.log('\n🎉 LOGIN CREDENTIALS WORKING:')
              console.log(`   Email: ${latestUser.email}`)
              console.log(`   Password: TestPassword123!`)
              console.log(`   Login URL: http://localhost:5174/login`)
            }
          }
        } else {
          console.log('\n🆕 Email already confirmed. Creating fresh user...')
          await createNewTestUser()
        }
      }
    } else {
      console.log('✅ Login successful!')
      console.log(`   Access Token: ${loginData.session?.access_token?.substring(0, 20)}...`)
      await supabase.auth.signOut()
      
      console.log('\n🎉 LOGIN CREDENTIALS WORKING:')
      console.log(`   Email: ${latestUser.email}`)
      console.log(`   Password: TestPassword123!`)
      console.log(`   Login URL: http://localhost:5174/login`)
    }
    
  } catch (error) {
    console.log('❌ Verification error:', error.message)
  }
}

async function createNewTestUser() {
  try {
    const timestamp = Date.now()
    const email = `testuser${timestamp}@xactfeedback.com`
    
    console.log('\n🆕 Creating fresh test user...')
    console.log(`   Email: ${email}`)
    
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'TestPassword123!',
      email_confirm: true
    })
    
    if (authError) {
      console.log('❌ User creation failed:', authError.message)
      return
    }
    
    console.log('✅ User created successfully')
    
    // Test login immediately
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: 'TestPassword123!'
    })
    
    if (loginError) {
      console.log('❌ Fresh user login failed:', loginError.message)
    } else {
      console.log('✅ Fresh user login successful!')
      await supabase.auth.signOut()
      
      console.log('\n🎉 NEW LOGIN CREDENTIALS:')
      console.log(`   Email: ${email}`)
      console.log(`   Password: TestPassword123!`)
      console.log(`   Login URL: http://localhost:5174/login`)
    }
    
  } catch (error) {
    console.log('❌ Fresh user creation error:', error.message)
  }
}

verifyAndFixLogin()
