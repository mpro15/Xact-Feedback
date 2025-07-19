import { serve } from 'edge-runtime';
import { createClient } from '@supabase/supabase-js';

export default serve(async (req) => {
  const body = await req.json();
  const { companyId, paymentId, orderId } = body;

  // Call Razorpay API to verify payment
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const verifyRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
    }
  });
  const payment = await verifyRes.json();

  // If payment is successful, update company subscription_active
  if (payment.status === 'captured') {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('companies').update({ subscription_active: true }).eq('id', companyId);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ success: false, error: payment.status }), { headers: { 'Content-Type': 'application/json' } });
});
