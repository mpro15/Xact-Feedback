// @ts-ignore
import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';

// @ts-ignore
serve({
  async GET(request) {
    try {
      const url = new URL(request.url);
      const fid = url.searchParams.get('fid');
      const link = url.searchParams.get('link');
      if (!fid || !link) {
        return new Response('Missing fid or link', { status: 400 });
      }
      // @ts-ignore
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // @ts-ignore
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      // Insert click record (optional: you may want to log more info)
      await fetch(`${supabaseUrl}/rest/v1/email_link_clicks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ email_id: fid, link_url: link }),
      });
      // Update clicked_at for email_campaigns
      await fetch(`${supabaseUrl}/rest/v1/email_campaigns?id=eq.${fid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ clicked_at: new Date().toISOString() }),
      });
      // Redirect to actual link
      return new Response(null, {
        status: 302,
        headers: {
          Location: link,
        },
      });
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  },
});
