import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    const body = await req.json();
    const { companyId, paymentId, orderId } = body;
    if (!companyId || !paymentId || !orderId) {
      return new Response(JSON.stringify({ error: 'Missing companyId, paymentId, or orderId' }), { status: 400 });
    }
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay API keys missing' }), { status: 500 });
    }
    const verifyRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
      }
    });
    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      return new Response(JSON.stringify({ error: 'Razorpay API error', details: errorText }), { status: 502 });
    }
    const payment = await verifyRes.json();
    if (payment.status === 'captured') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Supabase env vars missing' }), { status: 500 });
      }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('companies').update({ subscription_active: true }).eq('id', companyId);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
    }
    return new Response(JSON.stringify({ success: false, error: payment.status }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
