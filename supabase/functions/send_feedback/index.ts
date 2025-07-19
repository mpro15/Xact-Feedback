import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export default serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const userId = req.headers.get('x-user-id');
    const { candidate_id, feedback_id } = await req.json();
    if (!candidate_id || !feedback_id || !userId) {
      return new Response(JSON.stringify({ error: 'Missing candidate_id, feedback_id, or x-user-id' }), { status: 400 });
    }
    const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
    // Query feedback, candidate, company
    const { data: feedback, error: feedbackError } = await supabase.from('feedback').select('*').eq('id', feedback_id).single();
    if (feedbackError || !feedback) {
      return new Response(JSON.stringify({ error: 'Feedback not found', details: feedbackError }), { status: 404 });
    }
    const { data: candidate, error: candidateError } = await supabase.from('candidates').select('*').eq('id', candidate_id).single();
    if (candidateError || !candidate) {
      return new Response(JSON.stringify({ error: 'Candidate not found', details: candidateError }), { status: 404 });
    }
    const { data: company, error: companyError } = await supabase.from('companies').select('id, name, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure').eq('id', candidate.company_id).single();
    if (companyError || !company) {
      return new Response(JSON.stringify({ error: 'Company not found', details: companyError }), { status: 404 });
    }
    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: company.smtp_host,
      port: company.smtp_port,
      secure: !!company.smtp_secure,
      auth: {
        user: company.smtp_user,
        pass: company.smtp_pass,
      },
    });
    // Compose email
    const pixelUrl = `${process.env.PUBLIC_URL || ''}/track_open?cid=${candidate_id}`;
    const clickUrl = `${process.env.PUBLIC_URL || ''}/track_click?cid=${candidate_id}&fid=${feedback_id}`;
    const html = `
      <div>
        <h2>Feedback for ${candidate.name}</h2>
        <p>${feedback.summary}</p>
        <a href="${clickUrl}" style="color:#2563eb">View Details</a>
        <img src="${pixelUrl}" width="1" height="1" style="display:none" />
      </div>
    `;
    // Send email
    await transporter.sendMail({
      from: company.smtp_user,
      to: candidate.email,
      subject: `Your Feedback from ${company.name}`,
      html,
    });
    // Insert email_campaigns row
    const { data: campaign, error: campaignError } = await supabase.from('email_campaigns').insert({
      candidate_id,
      feedback_id,
      status: 'sent',
      attempt_count: 1,
      sent_at: new Date().toISOString(),
    }).select('id').single();
    if (campaignError || !campaign?.id) {
      return new Response(JSON.stringify({ error: 'Campaign insert error', details: campaignError }), { status: 500 });
    }
    // Deduct credits
    const { error: deductError } = await supabase.rpc('deduct_credits', {
      p_company_id: company.id,
      p_amount: 5,
      p_feature: 'email_feedback',
      p_description: 'Sent feedback',
      p_user_id: userId,
    });
    if (deductError) {
      return new Response(JSON.stringify({ error: 'Credit deduction error', details: deductError }), { status: 500 });
    }
    return new Response(JSON.stringify({ campaign_id: campaign.id, status: 'sent' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
