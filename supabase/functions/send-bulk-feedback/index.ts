import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { candidateIds } = await req.json();
    
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new Error('Missing or invalid candidateIds array');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    );

    const results = [];
    const batchSize = 5; // Process in batches to avoid overloading
    
    // Process candidates in batches
    for (let i = 0; i < candidateIds.length; i += batchSize) {
      const batch = candidateIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (candidateId) => {
        try {
          // Generate PDF
          const pdfResponse = await supabaseClient.functions.invoke('generate-feedback-pdf', {
            body: { candidate_id: candidateId }
          });

          if (pdfResponse.error) {
            throw new Error(`PDF generation failed for candidate ${candidateId}: ${pdfResponse.error.message}`);
          }

          const { pdf_url, feedback_report_id, content } = pdfResponse.data;

          // Get candidate data
          const { data: candidate, error: candidateError } = await supabaseClient
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
            throw new Error(`Candidate not found: ${candidateId}`);
          }

          // Get company email settings
          const emailSettings = candidate.companies.settings?.email || {};
          
          const feedbackData = {
            candidate_id: candidate.id,
            company_id: candidate.company_id,
            to_email: candidate.email,
            to_name: candidate.name,
            subject: emailSettings.subject_line || `Feedback on your application for ${candidate.position}`,
            html_content: generateEmailHTML(candidate, content, pdf_url),
            text_content: generateEmailText(candidate, content),
            pdf_url
          };

          // Send email
          const emailResponse = await supabaseClient.functions.invoke('send-feedback-email', {
            body: feedbackData
          });

          if (emailResponse.error) {
            throw new Error(`Email sending failed for candidate ${candidateId}: ${emailResponse.error.message}`);
          }

          // Update candidate status
          await supabaseClient
            .from('candidates')
            .update({
              feedback_status: 'sent',
              updated_at: new Date().toISOString()
            })
            .eq('id', candidateId);

          results.push({
            candidate_id: candidateId,
            success: true,
            message: 'Feedback email sent successfully'
          });
        } catch (error) {
          console.error(`Error processing candidate ${candidateId}:`, error);
          results.push({
            candidate_id: candidateId,
            success: false,
            message: error.message
          });
        }
      });

      // Wait for the current batch to complete
      await Promise.all(batchPromises);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < candidateIds.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        results,
        summary: `Successfully sent ${successCount} of ${candidateIds.length} emails`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk email sending:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        results: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function generateEmailHTML(candidate: any, content: any, pdfUrl: string): string {
  const companyName = candidate.companies.name;
  const companyLogo = candidate.companies.logo_url;
  const primaryColor = candidate.companies.primary_color || '#4F46E5';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Application Feedback</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 180px; margin-bottom: 15px; }
        h1 { color: ${primaryColor}; }
        .btn { display: inline-block; background-color: ${primaryColor}; color: white; padding: 10px 20px; 
               text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
          <h1>Feedback on Your Application</h1>
        </div>
        
        <p>Dear ${candidate.name},</p>
        
        <p>Thank you for applying for the ${candidate.position} role at ${companyName}.</p>
        
        <p>${content.summary}</p>
        
        <p>${content.motivational_message}</p>
        
        <h3>Key Areas for Development:</h3>
        <ul>
          ${content.skill_gaps.map((skill: string) => `<li>${skill}</li>`).join('')}
        </ul>
        
        <p>We've prepared a detailed feedback report for you that includes personalized recommendations for skill development and future opportunities.</p>
        
        <p><a href="${pdfUrl}" class="btn">View Your Feedback Report</a></p>
        
        <p>We appreciate your interest in ${companyName} and wish you the best in your career journey.</p>
        
        <div class="footer">
          <p>This email was sent to you as part of our candidate feedback process. 
          Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(candidate: any, content: any): string {
  const companyName = candidate.companies.name;
  
  return `
Feedback on Your Application

Dear ${candidate.name},

Thank you for applying for the ${candidate.position} role at ${companyName}.

${content.summary}

${content.motivational_message}

Key Areas for Development:
${content.skill_gaps.map((skill: string) => `- ${skill}`).join('\n')}

We've prepared a detailed feedback report for you that includes personalized recommendations for skill development and future opportunities.

We appreciate your interest in ${companyName} and wish you the best in your career journey.

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
  `;
}
