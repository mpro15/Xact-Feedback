import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export default serve(async (req: Request) => {
  const url = new URL(req.url);
  const fid = url.searchParams.get('fid');
  const link = url.searchParams.get('link');
  if (fid && link) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('email_campaigns').update({ clicked_at: new Date().toISOString() }).eq('feedback_id', fid);
    return new Response(null, { status: 302, headers: { Location: link } });
  }
  return new Response('Missing fid or link', { status: 400 });
});
