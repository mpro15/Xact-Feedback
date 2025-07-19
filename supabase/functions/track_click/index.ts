import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';

export default serve(async (req) => {
  const url = new URL(req.url);
  const fid = url.searchParams.get('fid');
  const link = url.searchParams.get('link');
  if (fid && link) {
    const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
    await supabase.from('email_campaigns').update({ clicked_at: new Date().toISOString() }).eq('id', fid);
    return Response.redirect(link, 302);
  }
  return new Response('Missing fid or link', { status: 400 });
});
