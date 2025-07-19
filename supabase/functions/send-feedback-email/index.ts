import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'npm:emailjs@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  candidate_id: string;
  company_id: string;
  to_email: string;
  to_name: string;
  subject: string;
  html_content: string;
  text_content: string;
  pdf_url?: string;
  campaign_id?: string;
  tracking_id?: string;
}

export default serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const emailRequest: EmailRequest = await req.json();
    
    // Validate required fields
    if (!emailRequest.candidate_id || !emailRequest.company_id || !emailRequest.to_email) {
      throw new Error('Missing required fields');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Check if we're under the daily email limit for this company
    const { data: isUnderLimit } = await supabaseClient.rpc(
      'check_daily_email_limit',
      { company_id: emailRequest.company_id }
    )

    if (!isUnderLimit) {
      // Queue for tomorrow morning
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0) // 8 AM tomorrow

      await supabaseClient
        .from('email_retry_queue')
        .insert({
          company_id: emailRequest.company_id,
          candidate_id: emailRequest.candidate_id,
          email_content: emailRequest,
          pdf_url: emailRequest.pdf_url,
          next_retry_at: tomorrow.toISOString(),
          status: 'pending'
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Daily email limit reached. Email queued for tomorrow.',
          queued: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company email settings
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('name, settings')
      .eq('id', emailRequest.company_id)
      .single()

    if (companyError) {
      throw new Error(`Failed to get company settings: ${companyError.message}`)
    }

    // Get SMTP configuration from environment variables or company settings
    const smtpConfig = {
      host: Deno.env.get('SMTP_HOST') || company.settings?.smtp?.host || 'localhost',
      port: parseInt(Deno.env.get('SMTP_PORT') || company.settings?.smtp?.port || '25'),
      user: Deno.env.get('SMTP_USER') || company.settings?.smtp?.user || '',
      password: Deno.env.get('SMTP_PASSWORD') || company.settings?.smtp?.password || '',
      ssl: Deno.env.get('SMTP_SSL') === 'true' || company.settings?.smtp?.ssl === true,
    }

    // Get sender information
    const fromName = company.settings?.email?.sender_name || 'HR Team'
    const fromEmail = company.settings?.email?.sender_email || `hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`

    // Generate a unique email ID if not provided
    const emailId = emailRequest.tracking_id || `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Add tracking pixel to HTML content
    const trackingPixelUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?eid=${emailId}&cid=${emailRequest.candidate_id}&coid=${emailRequest.company_id}`
    
    let htmlWithTracking = emailRequest.html_content
    
    // Add tracking pixel at the end of the email
    if (!htmlWithTracking.includes('</body>')) {
      htmlWithTracking += `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`
    } else {
      htmlWithTracking = htmlWithTracking.replace(
        '</body>',
        `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" /></body>`
      )
    }

    // Process all links to add tracking
    const trackingLinkBase = `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-link-click`
    
    // Replace links with tracking links
    htmlWithTracking = htmlWithTracking.replace(
      /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']([^>]*)>/gi,
      (match, url, rest) => {
        // Skip tracking for anchor links, mailto links, etc.
        if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
          return match
        }
        
        // Create tracking URL
        const trackingUrl = `${trackingLinkBase}?eid=${emailId}&cid=${emailRequest.candidate_id}&coid=${emailRequest.company_id}&url=${encodeURIComponent(url)}`
        
        return `<a href="${trackingUrl}"${rest}>`
      }
    )

    // Initialize SMTP client
    const smtp = new SMTPClient({
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      password: smtpConfig.password,
      ssl: smtpConfig.ssl,
    })

    // Send the email
    const message = await smtp.send({
      from: `${fromName} <${fromEmail}>`,
      to: `${emailRequest.to_name} <${emailRequest.to_email}>`,
      subject: emailRequest.subject,
      text: emailRequest.text_content,
      html: htmlWithTracking,
      attachment: emailRequest.pdf_url ? [
        {
          path: emailRequest.pdf_url,
          type: 'application/pdf',
          name: 'feedback-report.pdf'
        }
      ] : []
    })

    // Log successful delivery
    await supabaseClient
      .from('email_delivery_log')
      .insert({
        company_id: emailRequest.company_id,
        candidate_id: emailRequest.candidate_id,
        email_id: emailId,
        status: 'sent',
        message_id: message.id,
        delivered_at: new Date().toISOString()
      })

    // Update email campaign if provided
    if (emailRequest.campaign_id) {
      await supabaseClient
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_count: supabaseClient.rpc('increment', { row_id: emailRequest.campaign_id, column_name: 'sent_count' }),
          sent_at: new Date().toISOString()
        })
        .eq('id', emailRequest.campaign_id)
    }

    // Update candidate feedback status
    await supabaseClient
      .from('candidates')
      .update({
        feedback_status: 'sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', emailRequest.candidate_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailId,
        message_id: message.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    // If this is a candidate email, queue it for retry
    try {
      const emailRequest = await req.json()
      
      if (emailRequest.candidate_id && emailRequest.company_id) {
        // Calculate next retry time (5 minutes from now)
        const nextRetry = new Date()
        nextRetry.setMinutes(nextRetry.getMinutes() + 5)

        // Initialize Supabase client
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          {
            auth: {
              persistSession: false,
            },
          }
        )

        // Queue for retry
        await supabaseClient
          .from('email_retry_queue')
          .insert({
            company_id: emailRequest.company_id,
            candidate_id: emailRequest.candidate_id,
            email_content: emailRequest,
            pdf_url: emailRequest.pdf_url,
            next_retry_at: nextRetry.toISOString(),
            status: 'pending',
            last_error: error.message
          })

        // Log failed delivery
        await supabaseClient
          .from('email_delivery_log')
          .insert({
            company_id: emailRequest.company_id,
            candidate_id: emailRequest.candidate_id,
            email_id: emailRequest.tracking_id || `email_${Date.now()}`,
            status: 'failed',
            error_message: error.message,
            created_at: new Date().toISOString()
          })
      }
    } catch (queueError) {
      console.error('Error queueing email for retry:', queueError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        queued_for_retry: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})