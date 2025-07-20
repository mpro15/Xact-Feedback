const { createClient } = require('@supabase/supabase-js');

// Set NODE_ENV to 'test' to mock SMTP transport
process.env.NODE_ENV = 'test';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_CANDIDATE_ID = 'test-candidate-id'; // Replace with a valid candidate_id
const TEST_FEEDBACK_ID = 'test-feedback-id';   // Replace with a valid feedback_id

async function main() {
  // Invoke send_feedback edge function
  const { data, error } = await supabase.functions.invoke('send_feedback', {
    body: JSON.stringify({ candidate_id: TEST_CANDIDATE_ID, feedback_id: TEST_FEEDBACK_ID })
  });
  if (error) throw error;
  console.log('send_feedback response:', data);

  // Verify email_campaigns row with status 'sent'
  const { data: campaigns, error: campaignError } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('candidate_id', TEST_CANDIDATE_ID)
    .eq('feedback_id', TEST_FEEDBACK_ID)
    .eq('status', 'sent');
  if (campaignError) throw campaignError;
  if (!campaigns || campaigns.length === 0) {
    throw new Error('No sent email_campaigns row found for test candidate/feedback');
  }
  console.log('Email campaign sent:', campaigns[0]);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
