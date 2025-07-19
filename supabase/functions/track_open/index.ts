import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export default serve(async (req: Request) => {
  const url = new URL(req.url);
  const fid = url.searchParams.get('fid');
  if (fid) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('email_campaigns').update({ opened_at: new Date().toISOString() }).eq('feedback_id', fid);
  }
  const gif = new Uint8Array([
    71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 1, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59
  ]);
  return new Response(gif, { status: 200, headers: { 'Content-Type': 'image/gif' } });
});
