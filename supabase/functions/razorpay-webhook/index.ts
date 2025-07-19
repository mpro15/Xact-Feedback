import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';

export default serve(async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Verify signature
  if (!webhookSecret) {
    return new Response('Webhook secret missing', { status: 500 });
  }
  // Deno-compatible HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(rawBody)
  );
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (signature !== expectedSignature) {
    return new Response('Signature mismatch', { status: 401 });
  }

  // Check event type
  if (
    payload.event === 'payment.captured' ||
    payload.event === 'order.paid'
  ) {
    const companyId = payload.payload?.payment?.entity?.notes?.company_id || payload.payload?.order?.entity?.notes?.company_id;
    if (companyId && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('companies').update({ subscription_active: true }).eq('id', companyId);
    }
  }

  return new Response('OK', { status: 200 });
});
