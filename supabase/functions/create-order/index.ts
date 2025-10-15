import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export default serve(async (req: Request) => {
  const body = await req.json();
  const { companyId, amount, notes } = body;
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
  
  const orderData = { 
    amount, 
    currency: 'INR', 
    receipt: `order_${companyId}`,
    notes: notes || { company_id: companyId }
  };
  
  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  const order = await orderRes.json();
  return new Response(JSON.stringify(order), { headers: { 'Content-Type': 'application/json' } });
});
