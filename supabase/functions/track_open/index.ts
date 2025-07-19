import { serve } from '@supabase/functions';
import { createClient } from '@supabase/supabase-js';

const GIF = Buffer.from(
  'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64'
);

export default serve(async (req: Request) => {
  const url = new URL(req.url);
  const fid = url.searchParams.get('fid');
  if (fid) {
    const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
    await supabase.from('email_campaigns').update({ opened_at: new Date().toISOString() }).eq('id', fid);
  }
  return new Response(GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Length': GIF.length.toString(),
    }
  });
});
