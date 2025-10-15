import { supabase } from '../lib/supabaseClient';

export interface FeedbackEmailData {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  position: string;
  rejection_stage: string;
  rejection_reason: string;
  company_id: string;
  company_name: string;
  company_logo?: string;
  primary_color: string;
  secondary_color: string;
  sender_name: string;
  sender_email: string;
}

export class FeedbackService {
  static async generateAndSendFeedback(
    candidateId: string, 
    customContent?: string, 
    customHighlights?: string[]
  ): Promise<{
    success: boolean;
    message: string;
    pdf_url?: string;
    feedback_report_id?: string;
  }> {
    try {
      // Get candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select(`
          *,
          companies (
            name,
            logo_url,
            primary_color,
            secondary_color,
            settings
          )
        `)
        .eq('id', candidateId)
        .single();

      if (candidateError || !candidate) {
        throw new Error('Candidate not found');
      }

      // Get company email settings
      const emailSettings = candidate.companies.settings?.email || {};
      
      const feedbackData: FeedbackEmailData = {
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        position: candidate.position,
        rejection_stage: candidate.rejection_stage,
        rejection_reason: candidate.rejection_reason || 'Not specified',
        company_id: candidate.company_id,
        company_name: candidate.companies.name,
        company_logo: candidate.companies.logo_url,
        primary_color: candidate.companies.primary_color || '#A8D5BA',
        secondary_color: candidate.companies.secondary_color || '#059669',
        sender_name: emailSettings.sender_name || 'HR Team',
        sender_email: emailSettings.sender_email || 'hr@company.com'
      };

      // Step 1: Generate PDF
      const pdfResponse = await supabase.functions.invoke('generate-feedback-pdf', {
        body: { data: feedbackData, customContent, customHighlights }
      });

      if (pdfResponse.error) {
        throw new Error(`PDF generation failed: ${pdfResponse.error.message}`);
      }

      const { pdf_url, feedback_report_id, content } = pdfResponse.data;

      // Step 2: Send Email with PDF attachment
      const emailResponse = await supabase.functions.invoke('send-feedback-email', {
        body: {
          ...feedbackData,
          pdf_url,
          feedback_content: content
        }
      });

      if (emailResponse.error) {
        throw new Error(`Email sending failed: ${emailResponse.error.message}`);
      }

      // Step 3: Update candidate status
      await supabase
        .from('candidates')
        .update({
          feedback_status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId);

      return {
        success: true,
        message: 'Feedback email sent successfully',
        pdf_url,
        feedback_report_id
      };

    } catch (error) {
      console.error('Feedback service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  static async sendBulkFeedback(candidateIds: string[]): Promise<{
    success: boolean;
    results: Array<{
      candidate_id: string;
      success: boolean;
      message: string;
    }>;
  }> {
    try {
      // Call the Supabase function to handle bulk email sending
      const response = await supabase.functions.invoke('send-bulk-feedback', {
        body: { candidateIds }
      });

      if (response.error) {
        throw new Error(`Bulk feedback sending failed: ${response.error.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('Bulk feedback service error:', error);
      
      // Fallback to individual sending if the bulk function fails
      const results = [];
      
      for (const candidateId of candidateIds) {
        const result = await this.generateAndSendFeedback(candidateId);
        results.push({
          candidate_id: candidateId,
          success: result.success,
          message: result.message
        });
        
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount > 0,
        results
      };
    }
  }

  static async getFeedbackReport(candidateId: string) {
    const { data, error } = await supabase
      .from('feedback_reports')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to get feedback report: ${error.message}`);
    }

    return data;
  }

  static async trackEmailOpen(candidateId: string, emailId: string) {
    // Track email open event
    await supabase
      .from('analytics_events')
      .insert({
        candidate_id: candidateId,
        event_type: 'email_opened',
        event_data: { email_id: emailId }
      });

    // Update candidate email opens count
    await supabase.rpc('increment_email_opens', { 
      candidate_id: candidateId 
    });
  }

  static async trackEmailClick(candidateId: string, emailId: string, linkUrl: string) {
    // Track email click event
    await supabase
      .from('analytics_events')
      .insert({
        candidate_id: candidateId,
        event_type: 'email_clicked',
        event_data: { 
          email_id: emailId,
          link_url: linkUrl 
        }
      });

    // Update candidate email clicks count
    await supabase.rpc('increment_email_clicks', { 
      candidate_id: candidateId 
    });
  }

  static async trackCourseEnrollment(candidateId: string, courseTitle: string, courseProvider: string) {
    // Track course enrollment event
    await supabase
      .from('analytics_events')
      .insert({
        candidate_id: candidateId,
        event_type: 'course_enrolled',
        event_data: { 
          course_title: courseTitle,
          course_provider: courseProvider
        }
      });

    // Update candidate course enrollments count
    await supabase.rpc('increment_course_enrollments', { 
      candidate_id: candidateId 
    });
  }

  static async generateFeedback(candidateId: string, jobDescription: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate_feedback', {
        body: { candidateId, jobDescription }
      });
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error generating feedback:', err);
      throw new Error(`Failed to generate feedback: ${err.message}`);
    }
  }

  static async generateFeedbackPDF(feedbackData: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback-pdf', {
        body: { data: feedbackData }
      });

      if (error) {
        throw new Error(`PDF generation failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  }

  static async getFeedbackDraft(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('feedback_drafts')
        .select('*')
        .eq('candidate_id', candidateId)
        .single();
        
      if (error) {
        // If no draft exists, don't throw an error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching feedback draft:', err);
      return { data: null, error: err.message };
    }
  }
  
  static async saveFeedbackDraft(candidateId: string, content: string, highlights: string[]) {
    try {
      // Check if draft already exists
      const { data: existingDraft } = await this.getFeedbackDraft(candidateId);
      
      if (existingDraft) {
        // Update existing draft
        const { error } = await supabase
          .from('feedback_drafts')
          .update({
            content,
            highlights,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDraft.id);
          
        if (error) throw error;
      } else {
        // Create new draft
        const { error } = await supabase
          .from('feedback_drafts')
          .insert({
            candidate_id: candidateId,
            content,
            highlights,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Error saving feedback draft:', err);
      return { success: false, error: err.message };
    }
  }
}