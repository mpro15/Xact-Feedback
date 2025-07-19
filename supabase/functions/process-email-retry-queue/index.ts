import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'npm:emailjs@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for cron job
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get SMTP configuration from environment variables
    const smtpConfig = {
      host: Deno.env.get('SMTP_HOST') || 'localhost',
      port: parseInt(Deno.env.get('SMTP_PORT') || '25'),
      user: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASSWORD') || '',
      ssl: Deno.env.get('SMTP_SSL') === 'true',
    };

    // Initialize SMTP client
    const smtp = new SMTPClient({
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      password: smtpConfig.password,
      ssl: smtpConfig.ssl,
    });

    // Get emails that need to be retried
    const { data: retryQueue, error: retryError } = await supabaseClient
      .from('email_retry_queue')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lt('retry_count', 3)
      .lte('next_retry_at', new Date().toISOString())
      .order('next_retry_at', { ascending: true })
      .limit(10) // Process 10 at a time to avoid timeouts

    if (retryError) {
      throw new Error(`Failed to fetch retry queue: ${retryError.message}`)
    }

    if (!retryQueue || retryQueue.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No emails to retry' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    // Process each email in the retry queue
    for (const item of retryQueue) {
      try {
        // Check if we're under the daily email limit for this company
        const { data: isUnderLimit } = await supabaseClient.rpc(
          'check_daily_email_limit',
          { company_id: item.company_id }
        )

        if (!isUnderLimit) {
          // Calculate next retry time (tomorrow)
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(8, 0, 0, 0) // 8 AM tomorrow

          // Update retry queue with next retry time
          await supabaseClient
            .from('email_retry_queue')
            .update({
              next_retry_at: tomorrow.toISOString(),
              last_error: 'Daily email limit reached'
            })
            .eq('id', item.id)

          results.push({
            id: item.id,
            status: 'delayed',
            message: 'Daily email limit reached, scheduled for tomorrow'
          })
          
          continue
        }

        // Get email content from the retry queue
        const emailContent = item.email_content
        
        // Send the email
        const message = await smtp.send({
          from: emailContent.from_email,
          to: emailContent.to_email,
          subject: emailContent.subject,
          text: emailContent.text_content,
          html: emailContent.html_content,
          attachment: emailContent.pdf_url ? [
            {
              path: emailContent.pdf_url,
              type: 'application/pdf',
              name: 'feedback-report.pdf'
            }
          ] : []
        })

        // Update retry queue item to completed
        await supabaseClient
          .from('email_retry_queue')
          .update({
            status: 'completed',
            retry_count: item.retry_count + 1,
            last_error: null
          })
          .eq('id', item.id)

        // Log successful delivery
        await supabaseClient
          .from('email_delivery_log')
          .insert({
            company_id: item.company_id,
            candidate_id: item.candidate_id,
            email_id: emailContent.email_id,
            status: 'sent',
            message_id: message.id,
            delivered_at: new Date().toISOString()
          })

        // Update email campaign status
        if (emailContent.campaign_id) {
          await supabaseClient
            .from('email_campaigns')
            .update({
              status: 'sent',
              sent_count: supabaseClient.rpc('increment', { row_id: emailContent.campaign_id, column_name: 'sent_count' }),
              sent_at: new Date().toISOString()
            })
            .eq('id', emailContent.campaign_id)
        }

        results.push({
          id: item.id,
          status: 'completed',
          message: 'Email sent successfully'
        })

      } catch (error) {
        console.error(`Error processing retry item ${item.id}:`, error)

        // Calculate next retry time with exponential backoff
        const nextRetry = new Date()
        const backoffMinutes = Math.pow(2, item.retry_count) * 5 // 5, 10, 20, 40 minutes
        nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes)

        // Update retry queue with next retry time
        await supabaseClient
          .from('email_retry_queue')
          .update({
            status: item.retry_count >= 2 ? 'failed' : 'retrying',
            retry_count: item.retry_count + 1,
            next_retry_at: nextRetry.toISOString(),
            last_error: error.message
          })
          .eq('id', item.id)

        // Log failed delivery
        await supabaseClient
          .from('email_delivery_log')
          .insert({
            company_id: item.company_id,
            candidate_id: item.candidate_id,
            email_id: item.email_content.email_id,
            status: 'failed',
            error_message: error.message,
            created_at: new Date().toISOString()
          })

        // Update email campaign status if this was the final retry
        if (item.retry_count >= 2 && item.email_content.campaign_id) {
          await supabaseClient
            .from('email_campaigns')
            .update({
              status: 'failed'
            })
            .eq('id', item.email_content.campaign_id)
        }

        results.push({
          id: item.id,
          status: item.retry_count >= 2 ? 'failed' : 'retrying',
          message: error.message
        })
      }

      // Add a small delay between sending emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new Response(
      JSON.stringify({ 
        processed: retryQueue.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing retry queue:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
});