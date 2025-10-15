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
    const { 
      to_email, 
      to_name, 
      subject, 
      company_id, 
      company_name,
      company_logo,
      primary_color,
      secondary_color,
      sender_name,
      sender_email,
      reply_to_email,
      email_signature,
      unsubscribe_text,
      candidate_data
    } = await req.json();

    // Validate required fields
    if (!to_email || !company_id) {
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
    );

    // Generate HTML content for test email
    const htmlContent = generateTestEmailHTML({
      companyName: company_name,
      companyLogo: company_logo,
      primaryColor: primary_color,
      secondaryColor: secondary_color,
      candidateName: candidate_data?.name || 'Test Candidate',
      position: candidate_data?.position || 'Software Developer',
      rejectionStage: candidate_data?.rejection_stage || 'Technical Interview',
      emailSignature: email_signature || `Best regards,\nHR Team\n${company_name}`,
      unsubscribeText: unsubscribe_text,
      highlights: candidate_data?.highlights || [
        "Strong communication skills",
        "Good problem-solving approach",
        "Consider gaining more experience with cloud technologies",
        "Further development of system design skills recommended"
      ]
    });

    // Generate plain text version
    const textContent = generateTextVersion({
      companyName: company_name,
      candidateName: candidate_data?.name || 'Test Candidate',
      position: candidate_data?.position || 'Software Developer',
      emailSignature: email_signature,
      unsubscribeText: unsubscribe_text
    });

    // Use Supabase's built-in email service
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/admin/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
      },
      body: JSON.stringify({
        email: to_email,
        subject: subject || `Test Feedback Email from ${company_name}`,
        data: {
          html_content: htmlContent,
          text_content: textContent
        },
        template: 'custom-email'
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Email service error: ${JSON.stringify(errorData)}`);
    }

    // Log the test email delivery
    await supabaseClient
      .from('email_delivery_log')
      .insert({
        company_id: company_id,
        candidate_id: null,
        email_id: `test_${Date.now()}`,
        status: 'sent',
        message_id: `test_${Date.now()}`,
        delivered_at: new Date().toISOString(),
        recipient: to_email,
        template: 'test_feedback'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending test email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function generateTestEmailHTML({ 
  companyName, 
  companyLogo, 
  primaryColor, 
  secondaryColor,
  candidateName,
  position,
  rejectionStage,
  emailSignature,
  unsubscribeText,
  highlights
}) {
  // Parse email signature to handle line breaks
  const formattedSignature = emailSignature.replace(/\\n/g, '<br>');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Feedback on Your Application</title>
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
        }
        .header { 
          background-color: ${primaryColor}10;
          border-bottom: 1px solid ${primaryColor}30;
          padding: 20px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .company-info {
          display: flex;
          align-items: center;
        }
        .logo {
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }
        .company-name {
          color: ${primaryColor};
          font-weight: bold;
        }
        .email-body {
          padding: 30px 20px;
        }
        .highlight-box {
          background-color: ${primaryColor}10;
          border: 1px solid ${primaryColor}30;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .highlight-title {
          color: ${primaryColor};
          font-weight: bold;
          margin-bottom: 10px;
        }
        .highlight-list {
          margin: 0;
          padding-left: 20px;
        }
        .cta-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
        }
        .primary-button {
          background-color: ${primaryColor};
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: medium;
        }
        .secondary-button {
          color: ${secondaryColor};
          border: 1px solid ${secondaryColor};
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: medium;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #777;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="company-info">
              ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
              <span class="company-name">${companyName}</span>
            </div>
            <div class="email-metadata">TEST EMAIL</div>
          </div>
          <h2>Thank you for your application - ${candidateName}</h2>
        </div>
        
        <div class="email-body">
          <p>Dear ${candidateName},</p>
          
          <p>
            Thank you for your interest in the <strong>${position}</strong> position at ${companyName}. 
            After careful consideration of your application, we've decided to move forward with other candidates 
            who more closely match our current requirements at the ${rejectionStage} stage.
          </p>
          
          <div class="highlight-box">
            <div class="highlight-title">Your Feedback Highlights:</div>
            <ul class="highlight-list">
              ${highlights.map(highlight => `<li>${highlight}</li>`).join('')}
            </ul>
          </div>
          
          <p>
            We've included personalized course recommendations in the attached PDF report to help you 
            strengthen relevant skills for similar positions.
          </p>
          
          <div class="cta-container">
            <a href="#" class="primary-button">Download Full Feedback</a>
            <a href="#" class="secondary-button">View Course Recommendations</a>
          </div>
          
          <p>
            We appreciate your interest in ${companyName} and encourage you to apply for future positions 
            that match your qualifications as you continue to grow in your career.
          </p>
          
          <div class="signature">
            ${formattedSignature}
          </div>
          
          <div class="footer">
            <p>${unsubscribeText}</p>
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            <p><strong>This is a TEST EMAIL - No action is required.</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTextVersion({ companyName, candidateName, position, emailSignature, unsubscribeText }) {
  // Parse email signature to handle line breaks for text
  const formattedSignature = emailSignature.replace(/\\n/g, '\n');

  return `
TEST EMAIL - FEEDBACK ON YOUR APPLICATION

Dear ${candidateName},

Thank you for your interest in the ${position} position at ${companyName}. After careful consideration of your application, we've decided to move forward with other candidates who more closely match our current requirements.

YOUR FEEDBACK HIGHLIGHTS:
- Strong communication skills
- Good problem-solving approach
- Consider gaining more experience with cloud technologies
- Further development of system design skills recommended

We've included personalized course recommendations in the attached PDF report to help you strengthen relevant skills for similar positions.

We appreciate your interest in ${companyName} and encourage you to apply for future positions that match your qualifications as you continue to grow in your career.

${formattedSignature}

${unsubscribeText}
© ${new Date().getFullYear()} ${companyName}. All rights reserved.

THIS IS A TEST EMAIL - NO ACTION IS REQUIRED.
  `;
}
