import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';

// Helper to send email via SMTP (example using Postal API)
async function sendEmail({ to, subject, html }) {
  const postalApiKey = Deno.env.get('POSTAL_API_KEY');
  const postalServer = Deno.env.get('POSTAL_SERVER');
  const postalFrom = Deno.env.get('POSTAL_FROM');
  const res = await fetch(`${postalServer}/api/v1/send/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Server-API-Key': postalApiKey,
    },
    body: JSON.stringify({
      from: postalFrom,
      to,
      subject,
      html,
    }),
  });
  return res.ok;
}

serve({
  async POST(request) {
    try {
      const { candidate_id, feedback_id } = await request.json();
      const userId = request.headers.get('x-user-id');
      if (!candidate_id || !feedback_id || !userId) {
        return new Response(JSON.stringify({ error: 'Missing candidate_id, feedback_id, or x-user-id header' }), { status: 400 });
      }

      // Fetch candidate email and PDF URL
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      // Get feedback row
      const feedbackRes = await fetch(`${supabaseUrl}/rest/v1/feedback?id=eq.${feedback_id}`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      });
      const feedbackRows = await feedbackRes.json();
      const feedback = feedbackRows[0];
      if (!feedback) {
        return new Response(JSON.stringify({ error: 'Feedback not found' }), { status: 404 });
      }
      // Get candidate row
      const candidateRes = await fetch(`${supabaseUrl}/rest/v1/candidates?id=eq.${candidate_id}`, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      });
      const candidateRows = await candidateRes.json();
      const candidate = candidateRows[0];
      if (!candidate) {
        return new Response(JSON.stringify({ error: 'Candidate not found' }), { status: 404 });
      }
      const toEmail = candidate.email;
      const pdfUrl = feedback.pdf_url;

      // Send email
      const subject = 'Your Feedback Report';
      const html = `<p>Dear ${candidate.name},</p><p>Your feedback report is ready.</p><p><a href="${pdfUrl}">Download PDF</a></p>`;
      const emailSent = await sendEmail({ to: toEmail, subject, html });
      if (!emailSent) {
        return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
      }

      // Insert row into email_campaigns
      const campaignRes = await fetch(`${supabaseUrl}/rest/v1/email_campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          candidate_id,
          feedback_id,
          user_id: userId,
          status: 'sent',
          snapshot: { email: toEmail, pdf_url: pdfUrl },
        }),
      });
      const campaignData = await campaignRes.json();
      const campaign_id = Array.isArray(campaignData) ? campaignData[0]?.id : campaignData?.id;

      // Call deduct_credits RPC
      await fetch(`${supabaseUrl}/rest/v1/rpc/deduct_credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ user_id: userId, amount: 1 }),
      });

      return new Response(JSON.stringify({ status: 'sent', campaign_id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
});
