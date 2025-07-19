import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/emailjs@3.2.0/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const publicUrl = Deno.env.get('PUBLIC_URL') ?? '';

export default serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const userId = req.headers.get('x-user-id');
    const { candidate_id, feedback_id } = await req.json();
    if (!candidate_id || !feedback_id || !userId) {
      return new Response(JSON.stringify({ error: 'Missing candidate_id, feedback_id, or x-user-id' }), { status: 400 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Fetch candidate, feedback, company
    const { data: candidate, error: candidateError } = await supabase.from('candidates').select('email, company_id').eq('id', candidate_id).single();
    if (candidateError || !candidate) {
      return new Response(JSON.stringify({ error: 'Candidate not found' }), { status: 404 });
    }
    const { data: feedback, error: feedbackError } = await supabase.from('feedback').select('summary, feedback_pdf_url').eq('id', feedback_id).single();
    if (feedbackError || !feedback) {
      return new Response(JSON.stringify({ error: 'Feedback not found' }), { status: 404 });
    }
    const { data: company, error: companyError } = await supabase.from('companies').select('id, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure').eq('id', candidate.company_id).single();
    if (companyError || !company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), { status: 404 });
    }
    // Compose email
    const trackOpenUrl = `${publicUrl}/functions/v1/track_open?fid=${feedback_id}`;
    const trackClickUrl = (link: string) => `${publicUrl}/functions/v1/track_click?fid=${feedback_id}&link=${encodeURIComponent(link)}`;
    const html = `
      <div>
        <h2>Candidate Feedback</h2>
        <p>${feedback.summary}</p>
        <a href="${trackClickUrl(feedback.feedback_pdf_url ?? '#')}" style="color:#2563eb">View PDF</a>
        <img src="${trackOpenUrl}" width="1" height="1" style="display:none" />
      </div>
    `;
    // Send email via SMTP
    const smtp = new SMTPClient({
      host: company.smtp_host,
      port: company.smtp_port,
      user: company.smtp_user,
      password: company.smtp_pass,
      ssl: company.smtp_secure === true
    });
    await smtp.send({
      from: company.smtp_user,
      to: candidate.email,
      subject: 'Your Feedback',
      html
    });
    // Insert into email_campaigns
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        company_id: company.id,
        candidate_id,
        feedback_id,
        status: 'sent',
        attempt_count: 1,
        error_message: null
      })
      .select('id')
      .single();
    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: campaignError?.message }), { status: 500 });
    }
    // Call deduct_credits RPC
    await supabase.rpc('deduct_credits', {
      p_company_id: company.id,
      p_amount: 1,
      p_feature: 'email_feedback',
      p_description: 'Sent feedback',
      p_user_id: userId
    });
    return new Response(JSON.stringify({ campaign_id: campaign.id, status: 'sent' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
