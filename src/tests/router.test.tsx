import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function DummyPage() {
  return <div>Protected Content</div>;
}
function PaymentPendingPage() {
  return <div>Payment Pending</div>;
}

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { is_onboarded: true }, loading: false }),
}));

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test' } } })) },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
    })),
  },
}));

describe('ProtectedRoute payment guard', () => {
  it('redirects to /payment-pending if subscription_active=false', async () => {
    require('../lib/supabaseClient').supabase.from().select().eq().single.mockResolvedValueOnce({ data: { subscription_active: false }, error: null });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><DummyPage /></ProtectedRoute>} />
          <Route path="/payment-pending" element={<PaymentPendingPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Payment Pending/)).toBeInTheDocument();
  });

  it('renders child if subscription_active=true', async () => {
    require('../lib/supabaseClient').supabase.from().select().eq().single.mockResolvedValueOnce({ data: { subscription_active: true }, error: null });
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><DummyPage /></ProtectedRoute>} />
          <Route path="/payment-pending" element={<PaymentPendingPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Protected Content/)).toBeInTheDocument();
  });
});
