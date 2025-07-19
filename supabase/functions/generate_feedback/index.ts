import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';

serve({
  async POST(request) {
    try {
      const { candidate_id, job_description } = await request.json();
      if (!candidate_id || !job_description) {
        return new Response(JSON.stringify({ error: 'Missing candidate_id or job_description' }), { status: 400 });
      }

      // Call OpenAI Completion API
      const openaiRes = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-instruct',
          prompt: `Summarize feedback for candidate ${candidate_id} based on job description: ${job_description}`,
          max_tokens: 150,
        }),
      });
      const openaiData = await openaiRes.json();
      const summary = openaiData.choices?.[0]?.text?.trim() || '';

      // Write to feedback table using Supabase service role key
      const supabaseRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          candidate_id,
          job_description,
          summary,
        }),
      });
      const feedback = await supabaseRes.json();
      const feedback_id = Array.isArray(feedback) ? feedback[0]?.id : feedback?.id;

      return new Response(JSON.stringify({ summary, feedback_id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
});
