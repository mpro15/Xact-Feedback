// @ts-ignore
import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';

// 1x1 transparent GIF (base64)
const transparentGif =
  'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

serve({
  async GET(request) {
    try {
      const url = new URL(request.url);
      const fid = url.searchParams.get('fid');
      if (!fid) {
        return new Response('Missing fid', { status: 400 });
      }
      // @ts-ignore
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // @ts-ignore
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      // Update opened_at for email_campaigns
      await fetch(`${supabaseUrl}/rest/v1/email_campaigns?id=eq.${fid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ opened_at: new Date().toISOString() }),
      });
      // Return transparent GIF
      return new Response(Uint8Array.from(atob(transparentGif), c => c.charCodeAt(0)), {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  },
});
