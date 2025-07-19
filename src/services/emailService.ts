import { supabase } from '../lib/supabaseClient';

interface EmailTrackingData {
  candidate_id: string;
  email_id: string;
  campaign_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

interface EmailDeliveryResult {
  success: boolean;
  email_id?: string;
  error?: string;
  message_id?: string;
  queued?: boolean;
}

export class EmailService {
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_DELAY = 1000; // 1 second

  static async sendFeedbackEmail(
    candidateId: string,
    emailContent: any,
    pdfUrl: string
  ): Promise<EmailDeliveryResult> {
    try {
      // Get candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            primary_color,
            secondary_color,
            settings,
            daily_email_limit
          )
        `)
        .eq('id', candidateId)
        .single();

      if (candidateError || !candidate) {
        throw new Error('Candidate not found');
      }

      // Generate tracking ID
      const emailId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create email campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          company_id: candidate.company_id,
          name: `Feedback - ${candidate.name}`,
          template_id: 'feedback_template',
          recipients_count: 1,
          sent_count: 0,
          status: 'sending',
          created_by: null // Will be set by RLS
        })
        .select()
        .single();

      if (campaignError) {
        throw new Error(`Failed to create email campaign: ${campaignError.message}`);
      }

      // Prepare email request
      const emailRequest = {
        candidate_id: candidateId,
        company_id: candidate.company_id,
        to_email: candidate.email,
        to_name: candidate.name,
        subject: `Thank you for your application - ${candidate.name}`,
        html_content: emailContent.html || this.generateDefaultHtml(candidate, pdfUrl),
        text_content: emailContent.text || this.generateDefaultText(candidate, pdfUrl),
        pdf_url: pdfUrl,
        campaign_id: campaign.id,
        tracking_id: emailId
      };

      // Send email via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-feedback-email', {
        body: emailRequest
      });

      if (error) {
        throw new Error(`Email sending failed: ${error.message}`);
      }

      if (!data.success && data.queued) {
        return {
          success: false,
          email_id: emailId,
          queued: true,
          error: 'Daily email limit reached. Email queued for tomorrow.'
        };
      }

      return {
        success: data.success,
        email_id: data.email_id,
        message_id: data.message_id
      };

    } catch (error) {
      console.error('Email service error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async sendBulkFeedback(
    candidateIds: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number; queued: number; results: any[] }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    let queuedCount = 0;

    for (let i = 0; i < candidateIds.length; i++) {
      const candidateId = candidateIds[i];
      
      try {
        // Add delay between emails to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Generate mock PDF URL for this example
        const mockPdfUrl = `https://example.com/feedback-${candidateId}.pdf`;
        
        const result = await this.sendFeedbackEmail(candidateId, {}, mockPdfUrl);
        
        if (result.success) {
          successCount++;
        } else if (result.queued) {
          queuedCount++;
        } else {
          failedCount++;
        }

        results.push({
          candidate_id: candidateId,
          success: result.success,
          queued: result.queued,
          error: result.error
        });

        onProgress?.(i + 1, candidateIds.length);

      } catch (error) {
        failedCount++;
        results.push({
          candidate_id: candidateId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success: successCount, failed: failedCount, queued: queuedCount, results };
  }

  static async trackEmailOpen(candidateId: string, emailId: string): Promise<void> {
    try {
      // Update candidate email opens
      await supabase.rpc('increment_email_opens', { 
        candidate_id: candidateId 
      });

      // Log analytics event
      await supabase.from('analytics_events').insert({
        candidate_id: candidateId,
        event_type: 'email_opened',
        event_data: { 
          email_id: emailId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Failed to track email open:', error);
    }
  }

  static async trackLinkClick(
    candidateId: string, 
    emailId: string, 
    linkUrl: string,
    utmParams: any
  ): Promise<void> {
    try {
      // Update candidate email clicks
      await supabase.rpc('increment_email_clicks', { 
        candidate_id: candidateId 
      });

      // Log analytics event
      await supabase.from('analytics_events').insert({
        candidate_id: candidateId,
        event_type: 'email_clicked',
        event_data: { 
          email_id: emailId,
          link_url: linkUrl,
          utm_params: utmParams,
          timestamp: new Date().toISOString()
        }
      });

      // Track course enrollment if it's a course link
      if (this.isCourseLink(linkUrl)) {
        await this.trackCourseEnrollment(candidateId, linkUrl);
      }

    } catch (error) {
      console.error('Failed to track link click:', error);
    }
  }

  static async trackCourseEnrollment(candidateId: string, courseUrl: string): Promise<void> {
    try {
      await supabase.rpc('increment_course_enrollments', { 
        candidate_id: candidateId 
      });

      await supabase.from('analytics_events').insert({
        candidate_id: candidateId,
        event_type: 'course_enrolled',
        event_data: { 
          course_url: courseUrl,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track course enrollment:', error);
    }
  }

  private static isCourseLink(url: string): boolean {
    const courseProviders = [
      'coursera.org',
      'udemy.com',
      'edx.org',
      'pluralsight.com',
      'linkedin.com/learning',
      'freecodecamp.org',
      'codecademy.com',
      'upgrad.com'
    ];

    return courseProviders.some(provider => url.includes(provider));
  }

  private static generateDefaultHtml(candidate: any, pdfUrl: string): string {
    const companyName = candidate.companies.name;
    const companyColor = candidate.companies.primary_color || '#A8D5BA';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
        }
        .header { 
            background: ${companyColor}; 
            color: white; 
            padding: 20px; 
            text-align: center;
        }
        .content { 
            padding: 20px; 
        }
        .button {
            display: inline-block;
            background: ${companyColor};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin: 10px 5px;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Application</h1>
        </div>
        <div class="content">
            <p>Dear ${candidate.name},</p>
            
            <p>Thank you for your interest in the <strong>${candidate.position}</strong> position at ${companyName}. 
            While we were impressed with your background and experience, we have decided to move forward with another candidate.</p>
            
            <p>We believe in helping candidates grow, so we've prepared personalized feedback to help you in your future applications. 
            Please find the detailed feedback report attached to this email.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="${pdfUrl}" class="button">View Feedback Report</a>
                <a href="https://learning-platform.com" class="button">Start Learning</a>
            </div>
            
            <p>We encourage you to apply again in the future as your skills develop.</p>
            
            <p>Best regards,<br>HR Team<br>${companyName}</p>
        </div>
        <div class="footer">
            <p>This email was sent to ${candidate.email}.</p>
            <p>If you no longer wish to receive these emails, you can <a href="#">unsubscribe</a>.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private static generateDefaultText(candidate: any, pdfUrl: string): string {
    const companyName = candidate.companies.name;
    
    return `
Dear ${candidate.name},

Thank you for your interest in the ${candidate.position} position at ${companyName}. While we were impressed with your background and experience, we have decided to move forward with another candidate.

We believe in helping candidates grow, so we've prepared personalized feedback to help you in your future applications. Please find the detailed feedback report attached to this email.

View Feedback Report: ${pdfUrl}
Start Learning: https://learning-platform.com

We encourage you to apply again in the future as your skills develop.

Best regards,
HR Team
${companyName}

---
This email was sent to ${candidate.email}.
If you no longer wish to receive these emails, you can unsubscribe by replying to this email.
    `;
  }
}