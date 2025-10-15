import { supabase } from '../lib/supabaseClient';

interface CreateOrderRequest {
  companyId: string;
  amount: number; // in paise (smallest currency unit)
  plan: string;
}

interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

interface VerifyPaymentRequest {
  companyId: string;
  paymentId: string;
  orderId: string;
  razorpaySignature: string;
}

export class PaymentService {
  private static readonly RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key';

  /**
   * Create a Razorpay order
   */
  static async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // In demo mode, return a mock order
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID === 'rzp_test_your_key_id_here') {
        return {
          id: 'order_demo_' + Date.now(),
          amount: request.amount,
          currency: 'INR',
          receipt: `order_${request.companyId}`,
          status: 'created'
        };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          companyId: request.companyId,
          amount: request.amount,
          notes: {
            plan: request.plan,
            company_id: request.companyId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Verify payment with Razorpay
   */
  static async verifyPayment(request: VerifyPaymentRequest): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to verify payment: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
  /**
   * Open Razorpay checkout
   */
  static openCheckout(options: {
    orderId: string;
    amount: number;
    companyName: string;
    customerEmail: string;
    customerName: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  }) {
    const { orderId, amount, companyName, customerEmail, customerName, onSuccess, onError } = options;

    // In demo mode, simulate successful payment
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID === 'rzp_test_your_key_id_here') {
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: 'pay_demo_' + Date.now(),
          razorpay_order_id: orderId,
          razorpay_signature: 'demo_signature_' + Date.now()
        });
      }, 2000); // Simulate 2 second payment processing
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => this.openCheckout(options);
      script.onerror = () => onError(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
      return;
    }

    const rzp = new window.Razorpay({
      key: this.RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR',
      name: 'Xact Feedback',
      description: `Subscription for ${companyName}`,
      image: '/logo.png', // Add your logo here
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: ''
      },
      theme: {
        color: '#2563EB'
      },
      handler: function (response: any) {
        onSuccess(response);
      },
      modal: {
        ondismiss: function () {
          onError(new Error('Payment cancelled by user'));
        }
      }
    });

    rzp.open();
  }

  /**
   * Get plan price in paise
   */
  static getPlanPrice(planId: string): number {
    const prices = {
      starter: 49 * 100, // $49 converted to paise (assuming 1 USD = 100 paise for demo)
      professional: 149 * 100, // $149
      enterprise: 399 * 100 // $399
    };
    
    return prices[planId as keyof typeof prices] || 0;
  }

  /**
   * Update company subscription status
   */
  static async updateSubscriptionStatus(companyId: string, planId: string, active: boolean = true) {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          subscription_active: active,
          subscription_plan: planId,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
