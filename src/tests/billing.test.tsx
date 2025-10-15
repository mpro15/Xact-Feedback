import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BillingPage } from '../pages/billing/BillingPage';

// Mock create_order Edge Function
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn((fn, _options) => {
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
      select: vi.fn(() => ({ 
        eq: vi.fn(() => ({ 
          single: vi.fn(() => Promise.resolve({ 
            data: { subscription_active: true }, 
            error: null 
          })) 
        })) 
      })),
      update: vi.fn(() => Promise.resolve({ data: [{}], error: null })),
    })),
  },
}));

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    companyId: 'test-company-id',
    user: { id: 'test-user-id' }
  })
}));

// Mock notification context
vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({
    addNotification: vi.fn()
  })
}));

describe('Razorpay Subscription Flow', () => {
  it('renders billing page without crashing', async () => {
    render(<BillingPage />);
    // Just test that the component renders without errors
    // Look for any text that might be in the billing page
    expect(screen.getByText(/billing/i) || screen.getByText(/subscription/i) || screen.getByText(/credits/i)).toBeTruthy();
  });
});
