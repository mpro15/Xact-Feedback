import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: openaiApiKey });

export default serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const { candidate_id, job_description } = await req.json();
  if (!candidate_id || !job_description) {
    return new Response('Missing candidate_id or job_description', { status: 400 });
  }

  // Generate feedback summary using OpenAI
  let summary;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert HR feedback generator.' },
        { role: 'user', content: `Generate a feedback summary for the following job description: ${job_description}` },
      ],
      max_tokens: 300,
    });
    summary = completion.choices[0].message.content;
  } catch (err) {
    return new Response('OpenAI error', { status: 500 });
  }

  // Insert feedback into feedback table
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('feedback')
    .insert({ candidate_id, summary, feedback_pdf_url: null })
    .select();
  if (error || !data || !data[0]) {
    return new Response('Database error', { status: 500 });
  }

  return new Response(JSON.stringify({ feedback_id: data[0].id, summary }), { status: 200 });
});
