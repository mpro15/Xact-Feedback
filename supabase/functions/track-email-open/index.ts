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
    const url = new URL(req.url);
    const emailId = url.searchParams.get('eid');
    const candidateId = url.searchParams.get('cid');
    const companyId = url.searchParams.get('coid');
    if (!emailId || !candidateId || !companyId) {
      throw new Error('Missing required tracking parameters');
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    );
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    const userAgent = req.headers.get('user-agent');
    await supabaseClient
      .from('email_tracking_pixels')
      .insert({
        email_id: emailId,
        candidate_id: candidateId,
        company_id: companyId,
        ip_address: ipAddress,
        user_agent: userAgent,
        opened_at: new Date().toISOString(),
      });
    // Increment candidate email opens
    await supabaseClient.rpc('increment_email_opens', { candidate_id: candidateId });

    // Increment campaign opened count
    await supabaseClient.rpc('increment_campaign_stat', { 
      email_id: emailId,
      stat_column: 'opened_count'
    })

    // Return tracking pixel
    const gif = new Uint8Array([71,73,70,56,57,97,1,0,1,0,128,0,0,0,0,0,255,255,255,33,249,4,1,0,0,1,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59]);
    return new Response(gif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        ...corsHeaders,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});