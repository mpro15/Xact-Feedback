import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';

export default serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const { candidate_id, job_description } = await req.json();
    if (!candidate_id || !job_description) {
      return new Response(JSON.stringify({ error: 'Missing candidate_id or job_description' }), { status: 400 });
    }
    // OpenAI call
    const openaiKey = process.env.OPENAI_API_KEY;
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert recruiter. Summarize feedback for the candidate based on the job description.' },
          { role: 'user', content: job_description }
        ],
        max_tokens: 400,
        temperature: 0.7,
      })
    });
    const openaiData = await openaiRes.json();
    if (!openaiRes.ok || !openaiData.choices?.[0]?.message?.content) {
      return new Response(JSON.stringify({ error: 'OpenAI error', details: openaiData }), { status: 500 });
    }
    const summary = openaiData.choices[0].message.content;
    // Insert feedback
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('feedback').insert({
      candidate_id,
      summary,
      feedback_pdf_url: ''
    }).select('id').single();
    if (error || !data?.id) {
      return new Response(JSON.stringify({ error: 'DB insert error', details: error }), { status: 500 });
    }
    return new Response(JSON.stringify({ feedback_id: data.id, summary }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
