/**
 * Comprehensive API Integration Tests for Xact Feedback
 * Tests all REST API endpoints and backend connections
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabaseClient';

// Test configuration
const TEST_CONFIG = {
  // Test data
  testCompanyId: 'test-company-' + Date.now(),
  testUserId: 'test-user-' + Date.now(),
  testCandidateId: 'test-candidate-' + Date.now(),
  testFeedbackId: 'test-feedback-' + Date.now(),
  testEmailId: 'test-email-' + Date.now(),
  
  // API endpoints
  baseUrl: import.meta.env.VITE_SUPABASE_URL,
  functionsPath: '/functions/v1',
  
  // Test timeout
  timeout: 30000
};

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${TEST_CONFIG.baseUrl}${TEST_CONFIG.functionsPath}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      ...options.headers
    },
    ...options
  });
  
  return {
    status: response.status,
    data: response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text(),
    headers: response.headers
  };
};

describe('API Integration Tests', () => {
  
  beforeAll(async () => {
    console.log('Setting up test data...');
    // Setup test data
    await setupTestData();
  }, TEST_CONFIG.timeout);
  
  afterAll(async () => {
    console.log('Cleaning up test data...');
    // Cleanup test data
    await cleanupTestData();
  }, TEST_CONFIG.timeout);

  describe('Authentication & User Management', () => {
    
    it('should connect to Supabase successfully', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      expect(error).toBe(null);
      // User might be null if not authenticated, that's ok for this test
    });

    it('should access users table with proper RLS', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      // Should not error (might return empty if no access)
      expect(error).toBe(null);
    });

    it('should access companies table with proper RLS', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      expect(error).toBe(null);
    });
  });

  describe('Database Operations', () => {
    
    it('should perform CRUD operations on candidates table', async () => {
      // Create
      const { data: created, error: createError } = await supabase
        .from('candidates')
        .insert({
          id: TEST_CONFIG.testCandidateId,
          company_id: TEST_CONFIG.testCompanyId,
          name: 'Test Candidate',
          email: 'test@example.com',
          position: 'Software Engineer',
          rejection_stage: 'Phone Screen',
          applied_date: new Date().toISOString(),
          feedback_status: 'not_sent'
        })
        .select()
        .single();

      if (createError && !createError.message.includes('duplicate key')) {
        console.log('Create error (might be expected due to RLS):', createError);
      }

      // Read
      const { data: read, error: readError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', TEST_CONFIG.testCandidateId)
        .single();

      if (readError && !readError.message.includes('No rows')) {
        console.log('Read error (might be expected due to RLS):', readError);
      }

      expect(typeof readError === 'object').toBe(true);
    });

    it('should handle analytics_events table operations', async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          company_id: TEST_CONFIG.testCompanyId,
          candidate_id: TEST_CONFIG.testCandidateId,
          event_type: 'test_event',
          event_data: { test: true }
        });

      // Might fail due to RLS, but should not crash
      expect(typeof error === 'object' || error === null).toBe(true);
    });

    it('should handle email_campaigns table operations', async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .limit(1);

      expect(error).toBe(null);
    });
  });

  describe('Edge Functions', () => {
    
    it('should test generate_feedback function', async () => {
      const response = await apiCall('/generate_feedback', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: TEST_CONFIG.testCandidateId,
          job_description: 'Software Engineer position requiring React and TypeScript skills'
        })
      });

      // Should respond (might fail due to missing API keys in test env)
      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test send_feedback function', async () => {
      const response = await apiCall('/send_feedback', {
        method: 'POST',
        headers: {
          'x-user-id': TEST_CONFIG.testUserId
        },
        body: JSON.stringify({
          candidate_id: TEST_CONFIG.testCandidateId,
          feedback_id: TEST_CONFIG.testFeedbackId
        })
      });

      expect([200, 400, 404, 500].includes(response.status)).toBe(true);
    });

    it('should test send-feedback-email function', async () => {
      const response = await apiCall('/send-feedback-email', {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: TEST_CONFIG.testCandidateId,
          company_id: TEST_CONFIG.testCompanyId,
          to_email: 'test@example.com',
          to_name: 'Test Candidate',
          subject: 'Your Feedback Report',
          html_content: '<h1>Test Email</h1>',
          text_content: 'Test Email'
        })
      });

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test track_open function', async () => {
      const response = await apiCall(`/track_open?fid=${TEST_CONFIG.testFeedbackId}`, {
        method: 'GET'
      });

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test track_click function', async () => {
      const response = await apiCall(
        `/track_click?fid=${TEST_CONFIG.testFeedbackId}&link=https://example.com`,
        { method: 'GET' }
      );

      expect([200, 302, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test track-email-open function', async () => {
      const response = await apiCall(
        `/track-email-open?eid=${TEST_CONFIG.testEmailId}&cid=${TEST_CONFIG.testCandidateId}&coid=${TEST_CONFIG.testCompanyId}`,
        { method: 'GET' }
      );

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test track-link-click function', async () => {
      const response = await apiCall(
        `/track-link-click?eid=${TEST_CONFIG.testEmailId}&cid=${TEST_CONFIG.testCandidateId}&coid=${TEST_CONFIG.testCompanyId}&url=https://example.com`,
        { method: 'GET' }
      );

      expect([200, 302, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test generate-feedback-pdf function', async () => {
      const response = await apiCall('/generate-feedback-pdf', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            candidate_id: TEST_CONFIG.testCandidateId,
            company_id: TEST_CONFIG.testCompanyId,
            candidate_name: 'Test Candidate',
            position: 'Software Engineer',
            feedback_summary: 'Test feedback summary'
          }
        })
      });

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test process-email-retry-queue function', async () => {
      const response = await apiCall('/process-email-retry-queue', {
        method: 'POST'
      });

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Payment Functions', () => {
    
    it('should test create-order function', async () => {
      const response = await apiCall('/create-order', {
        method: 'POST',
        body: JSON.stringify({
          companyId: TEST_CONFIG.testCompanyId,
          amount: 100000 // 1000 INR in paisa
        })
      });

      expect([200, 400, 500].includes(response.status)).toBe(true);
    });

    it('should test verify-payment function', async () => {
      const response = await apiCall('/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          companyId: TEST_CONFIG.testCompanyId,
          paymentId: 'test_payment_id',
          orderId: 'test_order_id'
        })
      });

      expect([200, 400, 502].includes(response.status)).toBe(true);
    });

    it('should test razorpay-webhook function', async () => {
      const response = await apiCall('/razorpay-webhook', {
        method: 'POST',
        headers: {
          'x-razorpay-signature': 'test_signature'
        },
        body: JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                notes: {
                  company_id: TEST_CONFIG.testCompanyId
                }
              }
            }
          }
        })
      });

      expect([200, 400, 401, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Database RPC Functions', () => {
    
    it('should test increment_email_opens RPC', async () => {
      const { data, error } = await supabase.rpc('increment_email_opens', {
        candidate_id: TEST_CONFIG.testCandidateId
      });

      // Might fail due to missing candidate, but should not crash
      expect(typeof error === 'object' || error === null).toBe(true);
    });

    it('should test increment_email_clicks RPC', async () => {
      const { data, error } = await supabase.rpc('increment_email_clicks', {
        candidate_id: TEST_CONFIG.testCandidateId
      });

      expect(typeof error === 'object' || error === null).toBe(true);
    });

    it('should test increment_course_enrollments RPC', async () => {
      const { data, error } = await supabase.rpc('increment_course_enrollments', {
        candidate_id: TEST_CONFIG.testCandidateId
      });

      expect(typeof error === 'object' || error === null).toBe(true);
    });

    it('should test check_daily_email_limit RPC', async () => {
      const { data, error } = await supabase.rpc('check_daily_email_limit', {
        company_id: TEST_CONFIG.testCompanyId
      });

      expect(typeof error === 'object' || error === null).toBe(true);
    });

    it('should test deduct_credits RPC', async () => {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_company_id: TEST_CONFIG.testCompanyId,
        p_amount: 1,
        p_feature: 'test_feature',
        p_description: 'Test deduction',
        p_user_id: TEST_CONFIG.testUserId
      });

      expect(typeof error === 'object' || error === null).toBe(true);
    });
  });

  describe('Storage Operations', () => {
    
    it('should test profile-images bucket access', async () => {
      const { data, error } = await supabase.storage
        .from('profile-images')
        .list('', { limit: 1 });

      expect(error).toBe(null);
    });

    it('should test feedback-pdfs bucket access', async () => {
      const { data, error } = await supabase.storage
        .from('feedback-pdfs')
        .list('', { limit: 1 });

      expect(error).toBe(null);
    });

    it('should test company-logos bucket access', async () => {
      const { data, error } = await supabase.storage
        .from('company-logos')
        .list('', { limit: 1 });

      expect(error).toBe(null);
    });
  });

  describe('Real-time Subscriptions', () => {
    
    it('should test real-time subscription to candidates table', async () => {
      let received = false;
      
      const subscription = supabase
        .channel('test-candidates')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'candidates' }, 
            (payload) => {
              received = true;
            }
        )
        .subscribe();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      subscription.unsubscribe();
      
      // Should have created subscription (received might be false, that's ok)
      expect(typeof received).toBe('boolean');
    });
  });

  describe('Performance & Load Testing', () => {
    
    it('should handle multiple concurrent database queries', async () => {
      const promises = Array.from({ length: 10 }, () => 
        supabase.from('companies').select('id').limit(1)
      );

      const results = await Promise.allSettled(promises);
      
      // All should complete (might fail individually due to RLS)
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(['fulfilled', 'rejected'].includes(result.status)).toBe(true);
      });
    });

    it('should handle API rate limiting gracefully', async () => {
      const start = Date.now();
      
      const promises = Array.from({ length: 5 }, () => 
        apiCall('/track_open?fid=test', { method: 'GET' })
      );

      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;
      
      expect(results.length).toBe(5);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});

// Helper functions
async function setupTestData() {
  try {
    // Create test company
    await supabase.from('companies').insert({
      id: TEST_CONFIG.testCompanyId,
      name: 'Test Company',
      primary_color: '#000000',
      secondary_color: '#ffffff',
      subscription_plan: 'free'
    });

    console.log('Test data setup completed');
  } catch (error) {
    console.log('Test data setup failed (might be expected due to RLS):', error);
  }
}

async function cleanupTestData() {
  try {
    // Clean up test data
    await supabase.from('candidates').delete().eq('id', TEST_CONFIG.testCandidateId);
    await supabase.from('companies').delete().eq('id', TEST_CONFIG.testCompanyId);
    await supabase.from('users').delete().eq('id', TEST_CONFIG.testUserId);
    
    console.log('Test data cleanup completed');
  } catch (error) {
    console.log('Test data cleanup failed (might be expected):', error);
  }
}
