import { serve } from 'edge-runtime';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export default serve(async (req) => {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  if (signature !== expectedSignature) {
    return new Response('Signature mismatch', { status: 401 });
  }

  // Check event type
  if (
    payload.event === 'payment.captured' ||
    payload.event === 'order.paid'
  ) {
    const companyId = payload.payload?.payment?.entity?.notes?.company_id || payload.payload?.order?.entity?.notes?.company_id;
    if (companyId) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('companies').update({ subscription_active: true }).eq('id', companyId);
    }
  }

  return new Response('OK', { status: 200 });
});
