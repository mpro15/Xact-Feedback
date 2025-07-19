import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const { candidate_id, feedback_id } = await req.json();
  const userId = req.headers.get('x-user-id');
  if (!candidate_id || !feedback_id || !userId) {
    return new Response('Missing required fields', { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch candidate, feedback, and company info
  const { data: candidate } = await supabase.from('candidates').select('email,company_id').eq('id', candidate_id).single();
  if (!candidate) return new Response('Candidate not found', { status: 404 });
  const { data: feedback } = await supabase.from('feedback').select('feedback_pdf_url,summary').eq('id', feedback_id).single();
  if (!feedback) return new Response('Feedback not found', { status: 404 });
  const { data: company } = await supabase.from('companies').select('smtp_host,smtp_port,smtp_user,smtp_pass,smtp_secure,name').eq('id', candidate.company_id).single();
  if (!company) return new Response('Company not found', { status: 404 });

  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    host: company.smtp_host,
    port: company.smtp_port,
    secure: !!company.smtp_secure,
    auth: {
      user: company.smtp_user,
      pass: company.smtp_pass,
    },
  });

  // Generate tracking pixel and links
  const pixelUrl = `${supabaseUrl}/functions/v1/track-email-open?candidate_id=${candidate_id}&campaign=feedback`;
  const feedbackLink = `${feedback.feedback_pdf_url}?track=${candidate_id}`;
  const html = `
    <div>
      <p>Dear Candidate,</p>
      <p>Your feedback summary: ${feedback.summary}</p>
      <p><a href="${feedbackLink}">Download your feedback PDF</a></p>
      <img src="${pixelUrl}" width="1" height="1" style="display:none" />
    </div>
  `;

  // Send email
  let mailResult;
  try {
    mailResult = await transporter.sendMail({
      from: `${company.name} <${company.smtp_user}>`,
      to: candidate.email,
      subject: 'Your Feedback Report',
      html,
    });
  } catch (err) {
    return new Response('Email send failed', { status: 500 });
  }

  // Insert into email_campaigns
  const { data: campaignData, error: campaignError } = await supabase
    .from('email_campaigns')
    .insert({
      candidate_id,
      feedback_id,
      user_id: userId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      email: candidate.email,
      feedback_pdf_url: feedback.feedback_pdf_url,
    })
    .select();
  if (campaignError || !campaignData || !campaignData[0]) {
    return new Response('Campaign insert failed', { status: 500 });
  }

  // Call deduct_credits RPC
  await supabase.rpc('deduct_credits', { company_id: candidate.company_id, amount: 1 });

  return new Response(JSON.stringify({ campaign_id: campaignData[0].id, status: 'sent' }), { status: 200 });
});
