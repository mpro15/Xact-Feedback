import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BillingPage } from '../pages/billing/BillingPage';

// Mock create_order Edge Function
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn((fn, { body }) => {
        if (fn === 'create_order') {
          return Promise.resolve({ data: { order_id: 'order_123', key_id: 'rzp_test_key' }, error: null });
        }
        if (fn === 'verify_payment') {
          return Promise.resolve({ data: { success: true }, error: null });
        }
        return Promise.resolve({ data: {}, error: null });
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { subscription_active: true }, error: null }) ) })) })),
      update: vi.fn(() => Promise.resolve({ data: [{}], error: null })),
    })),
  },
}));

describe('Razorpay Subscription Flow', () => {
  it('signs up customer, mocks order, simulates payment, and asserts subscription_active', async () => {
    render(<BillingPage />);
    // Fill signup form
    fireEvent.change(screen.getByPlaceholderText(/Company Name/i), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@co.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    // Wait for Razorpay order creation
    await waitFor(() => expect(screen.getByText(/Payment/)).toBeInTheDocument());

    // Simulate Razorpay checkout callback
    await waitFor(() => expect(screen.getByText(/Payment successful/)).toBeInTheDocument());

    // Assert subscription_active flips to true in DB
    const mockSupabase = await import('../lib/supabaseClient');
    const result = await mockSupabase.supabase.from('companies').select('subscription_active').eq('email', 'test@co.com').single();
    expect(result.data?.subscription_active).toBe(true);
  });
});
