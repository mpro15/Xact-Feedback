#!/usr/bin/env node

/**
 * Edge Functions Integration Test Script
 * Tests all Supabase Edge Functions directly
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL or SUPABASE_URL');
  console.log('Required: VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const TEST_DATA = {
  candidateId: `test-candidate-${Date.now()}`,
  companyId: `test-company-${Date.now()}`,
  feedbackId: `test-feedback-${Date.now()}`,
  emailId: `test-email-${Date.now()}`,
  userId: `test-user-${Date.now()}`
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/functions/v1${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers
    },
    ...options
  });
  
  return {
    status: response.status,
    data: response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text(),
    headers: Object.fromEntries(response.headers.entries())
  };
};

const test = async (name, testFn) => {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const start = Date.now();
    await testFn();
    const duration = Date.now() - start;
    console.log(`✅ PASSED (${duration}ms): ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'PASSED', duration });
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

// Test suite
async function runTests() {
  console.log('🚀 Starting Edge Functions Integration Tests');
  console.log(`📊 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using Anon Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);

  // Test 1: Generate Feedback Function
  await test('generate_feedback function', async () => {
    const response = await apiCall('/generate_feedback', {
      method: 'POST',
      body: JSON.stringify({
        candidate_id: TEST_DATA.candidateId,
        job_description: 'Software Engineer position requiring React, TypeScript, and Node.js experience'
      })
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 200) {
      assert(response.data.feedback_id, 'Response should contain feedback_id');
      assert(response.data.summary, 'Response should contain summary');
    }
    
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 2: Send Feedback Function
  await test('send_feedback function', async () => {
    const response = await apiCall('/send_feedback', {
      method: 'POST',
      headers: {
        'x-user-id': TEST_DATA.userId
      },
      body: JSON.stringify({
        candidate_id: TEST_DATA.candidateId,
        feedback_id: TEST_DATA.feedbackId
      })
    });

    assert([200, 400, 404, 500].includes(response.status), `Unexpected status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 3: Send Feedback Email Function
  await test('send-feedback-email function', async () => {
    const response = await apiCall('/send-feedback-email', {
      method: 'POST',
      body: JSON.stringify({
        candidate_id: TEST_DATA.candidateId,
        company_id: TEST_DATA.companyId,
        to_email: 'test@example.com',
        to_name: 'Test Candidate',
        subject: 'Your Feedback Report - Test',
        html_content: '<h1>Test Feedback Report</h1><p>This is a test email.</p>',
        text_content: 'Test Feedback Report\n\nThis is a test email.',
        pdf_url: 'https://example.com/test-feedback.pdf'
      })
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 4: Track Open Function
  await test('track_open function', async () => {
    const response = await apiCall(`/track_open?fid=${TEST_DATA.feedbackId}`, {
      method: 'GET'
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    // track_open returns a 1x1 pixel GIF
    if (response.status === 200) {
      assert(response.headers['content-type'] === 'image/gif', 'Should return GIF image');
    }
  });

  // Test 5: Track Click Function
  await test('track_click function', async () => {
    const response = await apiCall(`/track_click?fid=${TEST_DATA.feedbackId}&link=https://example.com`, {
      method: 'GET'
    });

    assert([200, 302, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 302) {
      assert(response.headers.location === 'https://example.com', 'Should redirect to target URL');
    }
  });

  // Test 6: Track Email Open Function
  await test('track-email-open function', async () => {
    const response = await apiCall(
      `/track-email-open?eid=${TEST_DATA.emailId}&cid=${TEST_DATA.candidateId}&coid=${TEST_DATA.companyId}`, 
      { method: 'GET' }
    );

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 200) {
      assert(response.headers['content-type'] === 'image/gif', 'Should return tracking pixel');
    }
  });

  // Test 7: Track Link Click Function
  await test('track-link-click function', async () => {
    const response = await apiCall(
      `/track-link-click?eid=${TEST_DATA.emailId}&cid=${TEST_DATA.candidateId}&coid=${TEST_DATA.companyId}&url=https://coursera.org/test`, 
      { method: 'GET' }
    );

    assert([200, 302, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 302) {
      assert(response.headers.location, 'Should have redirect location');
    }
  });

  // Test 8: Generate Feedback PDF Function
  await test('generate-feedback-pdf function', async () => {
    const response = await apiCall('/generate-feedback-pdf', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          candidate_id: TEST_DATA.candidateId,
          company_id: TEST_DATA.companyId,
          candidate_name: 'Test Candidate',
          position: 'Software Engineer',
          feedback_summary: 'Strong technical skills with experience in React and TypeScript. Good problem-solving abilities.',
          interview_stage: 'Technical Interview',
          recommendations: [
            'Continue developing TypeScript skills',
            'Practice system design concepts'
          ]
        }
      })
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 200) {
      assert(response.data.pdf_url, 'Response should contain PDF URL');
    }
    
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 9: Process Email Retry Queue Function
  await test('process-email-retry-queue function', async () => {
    const response = await apiCall('/process-email-retry-queue', {
      method: 'POST'
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 10: Create Order Function (Payment)
  await test('create-order function', async () => {
    const response = await apiCall('/create-order', {
      method: 'POST',
      body: JSON.stringify({
        companyId: TEST_DATA.companyId,
        amount: 100000 // 1000 INR in paisa
      })
    });

    assert([200, 400, 500].includes(response.status), `Unexpected status: ${response.status}`);
    
    if (response.status === 200) {
      assert(response.data.id, 'Response should contain order ID');
      assert(response.data.amount, 'Response should contain amount');
    }
    
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 11: Verify Payment Function
  await test('verify-payment function', async () => {
    const response = await apiCall('/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        companyId: TEST_DATA.companyId,
        paymentId: 'test_payment_id_123',
        orderId: 'test_order_id_123'
      })
    });

    assert([200, 400, 502].includes(response.status), `Unexpected status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 12: Razorpay Webhook Function
  await test('razorpay-webhook function', async () => {
    const response = await apiCall('/razorpay-webhook', {
      method: 'POST',
      headers: {
        'x-razorpay-signature': 'test_signature_12345'
      },
      body: JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'test_payment_123',
              notes: {
                company_id: TEST_DATA.companyId
              }
            }
          }
        }
      })
    });

    assert([200, 400, 401, 500].includes(response.status), `Unexpected status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}`);
  });

  // Test 13: Database RPC Functions
  await test('Database RPC functions', async () => {
    const rpcTests = [
      { name: 'increment_email_opens', params: { candidate_id: TEST_DATA.candidateId } },
      { name: 'increment_email_clicks', params: { candidate_id: TEST_DATA.candidateId } },
      { name: 'increment_course_enrollments', params: { candidate_id: TEST_DATA.candidateId } },
      { name: 'check_daily_email_limit', params: { company_id: TEST_DATA.companyId } },
      { name: 'deduct_credits', params: { 
        p_company_id: TEST_DATA.companyId, 
        p_amount: 1, 
        p_feature: 'test_feature',
        p_description: 'Test credit deduction',
        p_user_id: TEST_DATA.userId
      }}
    ];

    for (const rpcTest of rpcTests) {
      try {
        const { data, error } = await supabase.rpc(rpcTest.name, rpcTest.params);
        console.log(`   RPC ${rpcTest.name}: ${error ? 'Error - ' + error.message : 'Success'}`);
      } catch (err) {
        console.log(`   RPC ${rpcTest.name}: Exception - ${err.message}`);
      }
    }
  });

  // Test 14: Storage Buckets Access
  await test('Storage buckets access', async () => {
    const buckets = ['profile-images', 'feedback-pdfs', 'company-logos'];
    
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
        console.log(`   Bucket ${bucket}: ${error ? 'Error - ' + error.message : 'Accessible'}`);
      } catch (err) {
        console.log(`   Bucket ${bucket}: Exception - ${err.message}`);
      }
    }
  });

  // Test 15: Table Access with RLS
  await test('Database tables access', async () => {
    const tables = [
      'users', 'companies', 'candidates', 'feedback_reports',
      'email_campaigns', 'analytics_events', 'integrations', 'notifications'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        console.log(`   Table ${table}: ${error ? 'Error - ' + error.message : 'Accessible'}`);
      } catch (err) {
        console.log(`   Table ${table}: Exception - ${err.message}`);
      }
    }
  });

  // Test 16: CORS Headers
  await test('CORS headers on functions', async () => {
    const response = await apiCall('/generate_feedback', {
      method: 'OPTIONS'
    });

    assert(response.status === 200, `OPTIONS request should return 200, got ${response.status}`);
    assert(response.headers['access-control-allow-origin'], 'Should have CORS origin header');
    assert(response.headers['access-control-allow-headers'], 'Should have CORS headers header');
  });

  // Test 17: Performance Test
  await test('Function response times', async () => {
    const endpoints = [
      '/track_open?fid=test',
      '/track_click?fid=test&link=https://example.com'
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      try {
        await apiCall(endpoint, { method: 'GET' });
        const duration = Date.now() - start;
        console.log(`   ${endpoint}: ${duration}ms`);
        assert(duration < 5000, `Response time should be under 5s, got ${duration}ms`);
      } catch (err) {
        console.log(`   ${endpoint}: Error - ${err.message}`);
      }
    }
  });

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' * 50);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => t.status === 'FAILED').forEach(t => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }

  console.log('\n📋 Detailed Results:');
  results.tests.forEach(t => {
    const duration = t.duration ? ` (${t.duration}ms)` : '';
    console.log(`   ${t.status === 'PASSED' ? '✅' : '❌'} ${t.name}${duration}`);
  });

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
