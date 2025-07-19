import { serve } from 'edge-runtime';

export default serve(async (req) => {
  const body = await req.json();
  const { companyId, plan, billingCycle } = body;

  // Example pricing logic
  let amount = 9900;
  if (plan === 'enterprise') amount = 19900;
  if (billingCycle === 'yearly') amount = amount * 12;
  const currency = 'INR';

  // Call Razorpay API to create order
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt: `company_${companyId}_${Date.now()}`,
      payment_capture: 1
    })
  });
  const order = await orderRes.json();
  return new Response(JSON.stringify({ order, key_id: razorpayKeyId }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
