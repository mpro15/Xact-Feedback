import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export default serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const { candidate_id, job_description } = await req.json();
    if (!candidate_id || !job_description) {
      return new Response(JSON.stringify({ error: 'Missing candidate_id or job_description' }), { status: 400 });
    }
    // Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Generate a concise feedback summary for a candidate based on the job description.' },
          { role: 'user', content: job_description }
        ]
      })
    });
    const openaiData = await openaiRes.json();
    const summary = openaiData.choices?.[0]?.message?.content ?? '';
    // Insert feedback
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('feedback')
      .insert({ candidate_id, summary, feedback_pdf_url: null })
      .select('id, summary')
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ feedback_id: data.id, summary: data.summary }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
