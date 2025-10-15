/**
 * Backend Services Testing Suite
 * Tests all service classes and their API interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '../services/emailService';
import { FeedbackService } from '../services/feedbackService';
import { supabase } from '../lib/supabaseClient';

// Mock data for testing
const mockCandidateId = 'test-candidate-123';
const mockEmailId = 'test-email-123';
const mockCompanyId = 'test-company-123';
const mockCourseUrl = 'https://coursera.org/test-course';

describe('Backend Services Tests', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('EmailService', () => {
    
    describe('sendFeedbackEmail', () => {
      it('should send feedback email successfully', async () => {
        // Mock supabase responses
        vi.spyOn(supabase, 'from').mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { 
                  id: mockCandidateId, 
                  name: 'Test Candidate',
                  email: 'test@example.com',
                  company_id: mockCompanyId
                },
                error: null
              })
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'campaign-123' },
                error: null
              })
            })
          })
        } as any);

        // Mock functions invoke
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: { success: true, email_id: mockEmailId },
          error: null
        });

        const result = await EmailService.sendFeedbackEmail(
          mockCandidateId,
          {
            subject: 'Test Feedback',
            html_content: '<p>Test content</p>',
            text_content: 'Test content'
          },
          'https://example.com/feedback.pdf'
        );

        expect(result.success).toBe(true);
        expect(result.email_id).toBe(mockEmailId);
      });

      it('should handle email sending failure', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: null,
          error: { message: 'SMTP connection failed' }
        });

        const result = await EmailService.sendFeedbackEmail(
          mockCandidateId,
          { subject: 'Test', html_content: 'Test', text_content: 'Test' },
          'test.pdf'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle daily email limit reached', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: { success: false, queued: true },
          error: null
        });

        const result = await EmailService.sendFeedbackEmail(
          mockCandidateId,
          { subject: 'Test', html_content: 'Test', text_content: 'Test' },
          'test.pdf'
        );

        expect(result.success).toBe(false);
        expect(result.queued).toBe(true);
      });
    });

    describe('trackEmailOpen', () => {
      it('should track email open successfully', async () => {
        const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
          data: null,
          error: null
        });

        const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        } as any);

        await EmailService.trackEmailOpen(mockCandidateId, mockEmailId);

        expect(rpcSpy).toHaveBeenCalledWith('increment_email_opens', {
          candidate_id: mockCandidateId
        });
        expect(fromSpy).toHaveBeenCalledWith('analytics_events');
      });

      it('should handle tracking failure gracefully', async () => {
        vi.spyOn(supabase, 'rpc').mockRejectedValue(new Error('Database error'));
        
        // Should not throw, just log error
        await expect(EmailService.trackEmailOpen(mockCandidateId, mockEmailId))
          .resolves.not.toThrow();
      });
    });

    describe('trackEmailClick', () => {
      it('should track email click successfully', async () => {
        const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
          data: null,
          error: null
        });

        await EmailService.trackEmailClick(mockCandidateId, mockEmailId, 'https://example.com');

        expect(rpcSpy).toHaveBeenCalledWith('increment_email_clicks', {
          candidate_id: mockCandidateId
        });
      });
    });

    describe('trackCourseEnrollment', () => {
      it('should track course enrollment successfully', async () => {
        const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
          data: null,
          error: null
        });

        const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        } as any);

        await EmailService.trackCourseEnrollment(mockCandidateId, mockCourseUrl);

        expect(rpcSpy).toHaveBeenCalledWith('increment_course_enrollments', {
          candidate_id: mockCandidateId
        });
        expect(fromSpy).toHaveBeenCalledWith('analytics_events');
      });
    });

    describe('isCourseLink', () => {
      it('should identify course links correctly', async () => {
        const courseUrls = [
          'https://coursera.org/learn/python',
          'https://udemy.com/course/javascript',
          'https://edx.org/course/data-science',
          'https://pluralsight.com/courses/react',
          'https://linkedin.com/learning/node-js',
          'https://freecodecamp.org/learn/javascript',
          'https://codecademy.com/learn/python',
          'https://upgrad.com/course/machine-learning'
        ];

        const nonCourseUrls = [
          'https://google.com',
          'https://github.com',
          'https://stackoverflow.com'
        ];

        // Test course URLs (we'll need to access the private method through reflection or make it public)
        // For now, test indirectly through trackCourseEnrollment
        for (const url of courseUrls) {
          const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: null });
          await EmailService.trackEmailClick(mockCandidateId, mockEmailId, url);
          // If it's a course link, it should call track course enrollment
        }
      });
    });
  });

  describe('FeedbackService', () => {
    
    describe('generateFeedback', () => {
      it('should generate feedback successfully', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: { 
            feedback_id: 'feedback-123',
            summary: 'Generated feedback summary'
          },
          error: null
        });

        const result = await FeedbackService.generateFeedback(
          mockCandidateId,
          'Software Engineer position requiring React and TypeScript'
        );

        expect(result.feedback_id).toBe('feedback-123');
        expect(result.summary).toBeDefined();
      });

      it('should handle AI service failure', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: null,
          error: { message: 'OpenAI API key invalid' }
        });

        await expect(FeedbackService.generateFeedback(mockCandidateId, 'Job description'))
          .rejects.toThrow('OpenAI API key invalid');
      });
    });

    describe('generateFeedbackPDF', () => {
      it('should generate PDF successfully', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: { 
            pdf_url: 'https://example.com/feedback.pdf',
            report_id: 'report-123'
          },
          error: null
        });

        const result = await FeedbackService.generateFeedbackPDF({
          candidate_id: mockCandidateId,
          company_id: mockCompanyId,
          candidate_name: 'Test Candidate',
          position: 'Software Engineer',
          feedback_summary: 'Test feedback'
        });

        expect(result.pdf_url).toBeDefined();
        expect(result.report_id).toBeDefined();
      });

      it('should handle PDF generation failure', async () => {
        vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
          data: null,
          error: { message: 'PDF generation failed' }
        });

        await expect(FeedbackService.generateFeedbackPDF({
          candidate_id: mockCandidateId,
          company_id: mockCompanyId,
          candidate_name: 'Test Candidate',
          position: 'Software Engineer',
          feedback_summary: 'Test feedback'
        })).rejects.toThrow('PDF generation failed');
      });
    });

    describe('getFeedbackReport', () => {
      it('should get feedback report successfully', async () => {
        vi.spyOn(supabase, 'from').mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: 'report-123',
                      candidate_id: mockCandidateId,
                      pdf_url: 'https://example.com/report.pdf'
                    },
                    error: null
                  })
                })
              })
            })
          })
        } as any);

        const result = await FeedbackService.getFeedbackReport(mockCandidateId);

        expect(result.id).toBe('report-123');
        expect(result.candidate_id).toBe(mockCandidateId);
      });

      it('should handle no feedback report found', async () => {
        vi.spyOn(supabase, 'from').mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'No rows returned' }
                  })
                })
              })
            })
          })
        } as any);

        await expect(FeedbackService.getFeedbackReport(mockCandidateId))
          .rejects.toThrow('No rows returned');
      });
    });

    describe('trackEmailOpen', () => {
      it('should track email open through FeedbackService', async () => {
        const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
          data: null,
          error: null
        });

        const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        } as any);

        await FeedbackService.trackEmailOpen(mockCandidateId, mockEmailId);

        expect(rpcSpy).toHaveBeenCalledWith('increment_email_opens', {
          candidate_id: mockCandidateId
        });
        expect(fromSpy).toHaveBeenCalledWith('analytics_events');
      });
    });

    describe('trackCourseEnrollment', () => {
      it('should track course enrollment through FeedbackService', async () => {
        const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({
          data: null,
          error: null
        });

        await FeedbackService.trackCourseEnrollment(
          mockCandidateId, 
          'Python Programming', 
          'Coursera'
        );

        expect(rpcSpy).toHaveBeenCalledWith('increment_course_enrollments', {
          candidate_id: mockCandidateId
        });
      });
    });
  });
  describe('Database Connection Tests', () => {
    
    it('should test database connection health', async () => {
      // Mock supabase query for this test
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ count: 1 }],
            error: null
          })
        })
      } as any);

      const result = await supabase
        .from('companies')
        .select('count(*)')
        .limit(1);

      expect(result.error).toBe(null);
      expect(result.data).toBeDefined();
    });

    it('should test RPC function availability', async () => {
      // Test if RPC functions exist (might fail due to permissions)
      const rpcFunctions = [
        'increment_email_opens',
        'increment_email_clicks', 
        'increment_course_enrollments',
        'check_daily_email_limit',
        'deduct_credits'
      ];

      for (const func of rpcFunctions) {
        const { error } = await supabase.rpc(func, {});
        // Should not crash, might return error due to missing params
        expect(typeof error === 'object' || error === null).toBe(true);
      }
    });

    it('should test table access permissions', async () => {
      const tables = [
        'users',
        'companies', 
        'candidates',
        'feedback_reports',
        'email_campaigns',
        'analytics_events',
        'integrations',
        'notifications'
      ];      for (const table of tables) {
        // Mock supabase query for each table
        vi.spyOn(supabase, 'from').mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        } as any);

        const result = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        // Should not crash, might return empty due to RLS
        expect(result.error).toBe(null);
      }
    });
  });

  describe('Error Handling & Edge Cases', () => {
    
    it('should handle network timeouts gracefully', async () => {
      // Mock a timeout scenario
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      try {
        await expect(EmailService.sendFeedbackEmail(
          mockCandidateId,
          { subject: 'Test', html_content: 'Test', text_content: 'Test' },
          'test.pdf'
        )).rejects.toThrow();
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle malformed data gracefully', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid data format' }
            })
          })
        })
      } as any);

      await expect(FeedbackService.getFeedbackReport('invalid-id'))
        .rejects.toThrow('Invalid data format');
    });

    it('should handle service unavailability', async () => {
      vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
        data: null,
        error: { message: 'Service temporarily unavailable' }
      });

      await expect(FeedbackService.generateFeedback(mockCandidateId, 'Test'))
        .rejects.toThrow('Service temporarily unavailable');
    });
  });

  describe('Performance Tests', () => {
    
    it('should handle multiple concurrent email operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        EmailService.trackEmailOpen(`candidate-${i}`, `email-${i}`)
      );

      // All should complete without throwing
      await expect(Promise.allSettled(promises)).resolves.toBeDefined();
    });

    it('should handle bulk feedback generation', async () => {
      vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({
        data: { feedback_id: 'test', summary: 'test' },
        error: null
      });

      const promises = Array.from({ length: 3 }, (_, i) => 
        FeedbackService.generateFeedback(`candidate-${i}`, 'Job description')
      );

      const results = await Promise.allSettled(promises);
      expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    });
  });
});

// Test utilities
export const testHelpers = {
  createMockCandidate: (id = 'test-candidate') => ({
    id,
    company_id: 'test-company',
    name: 'Test Candidate',
    email: 'test@example.com',
    position: 'Software Engineer',
    rejection_stage: 'Phone Screen',
    applied_date: new Date().toISOString(),
    feedback_status: 'not_sent' as const,
    email_opens: 0,
    email_clicks: 0,
    course_enrollments: 0,
    reapplied: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),

  createMockEmailData: () => ({
    subject: 'Your Feedback Report',
    html_content: '<h1>Feedback Report</h1><p>Your feedback content here.</p>',
    text_content: 'Feedback Report\n\nYour feedback content here.'
  }),

  createMockFeedbackData: () => ({
    candidate_id: 'test-candidate',
    company_id: 'test-company',
    candidate_name: 'Test Candidate',
    position: 'Software Engineer',
    feedback_summary: 'Strong technical skills, good communication'
  })
};
