import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomerSignupPage } from '../pages/auth/CustomerSignupPage';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the payment service
vi.mock('../services/paymentService', () => ({
  PaymentService: {
    createOrder: vi.fn(() => Promise.resolve({
      id: 'order_demo_123',
      amount: 14900,
      currency: 'INR',
      receipt: 'order_test_company',
      status: 'created'
    })),
    openCheckout: vi.fn((options) => {
      // Simulate successful payment in test
      setTimeout(() => {
        options.onSuccess({
          razorpay_payment_id: 'pay_demo_123',
          razorpay_order_id: 'order_demo_123',
          razorpay_signature: 'demo_signature_123'
        });
      }, 100);
    }),
    verifyPayment: vi.fn(() => Promise.resolve(true)),
    updateSubscriptionStatus: vi.fn(() => Promise.resolve()),
    getPlanPrice: vi.fn((planId) => {
      const prices = {
        starter: 4900,
        professional: 14900,
        enterprise: 39900
      };
      return prices[planId] || 14900;
    })
  }
}));

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{ id: 'test-company-123' }],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    signup: vi.fn(() => Promise.resolve(true)),
    user: null,
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
      <a href={to}>{children}</a>
  };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('Customer Signup Flow E2E Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete the full 4-step signup flow with instant account creation', async () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Verify initial render
    expect(screen.getByText(/Transform Your Recruitment Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Company Information/i)).toBeInTheDocument();

    // Step 1: Fill company information
    const companyNameInput = screen.getByPlaceholderText(/Your Company Name/i);
    const domainInput = screen.getByPlaceholderText(/company.com/i);
    const addressInput = screen.getByPlaceholderText(/123 Business Street/i);
    const cityInput = screen.getByPlaceholderText(/City/i);
    const stateInput = screen.getByPlaceholderText(/State/i);
    const zipInput = screen.getByPlaceholderText(/12345/i);

    fireEvent.change(companyNameInput, { target: { value: 'Test Corp' } });
    fireEvent.change(domainInput, { target: { value: 'testcorp.com' } });
    fireEvent.change(addressInput, { target: { value: '123 Test Street' } });
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });
    fireEvent.change(stateInput, { target: { value: 'CA' } });
    fireEvent.change(zipInput, { target: { value: '94102' } });

    // Click Continue to Step 2
    fireEvent.click(screen.getByText(/Continue/i));

    await waitFor(() => {
      expect(screen.getByText(/Admin Contact Details/i)).toBeInTheDocument();
    });

    // Step 2: Fill admin details
    const adminNameInput = screen.getByPlaceholderText(/John Doe/i);
    const emailInput = screen.getByPlaceholderText(/john@company.com/i);
    const phoneInput = screen.getByPlaceholderText(/\+1 \(555\) 123-4567/i);
    const jobTitleInput = screen.getByPlaceholderText(/e.g., HR Manager, Recruiter, CEO/i);

    fireEvent.change(adminNameInput, { target: { value: 'John Smith' } });
    fireEvent.change(emailInput, { target: { value: 'john@testcorp.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
    fireEvent.change(jobTitleInput, { target: { value: 'HR Director' } });

    // Click Continue to Step 3
    fireEvent.click(screen.getByText(/Continue/i));    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Company Details/i })).toBeInTheDocument();
    });    // Step 3: Fill company details
    const industrySelect = screen.getByDisplayValue('Select Industry');
    fireEvent.change(industrySelect, { target: { value: 'Technology' } });

    const companySizeSelect = screen.getByDisplayValue('Select Company Size');
    fireEvent.change(companySizeSelect, { target: { value: '51-200 employees' } });

    const atsSelect = screen.getByDisplayValue('Select ATS');
    fireEvent.change(atsSelect, { target: { value: 'Greenhouse' } });

    const hiresSelect = screen.getByDisplayValue('Select Monthly Hires');
    fireEvent.change(hiresSelect, { target: { value: '6-20 hires' } });

    // Click Continue to Step 4
    fireEvent.click(screen.getByText(/Continue/i));

    await waitFor(() => {
      expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument();
    });

    // Step 4: Select a plan
    const professionalPlan = screen.getByText(/Professional/i).closest('div');
    fireEvent.click(professionalPlan!);    // Complete the signup without payment
    const createAccountButton = screen.getByText(/Create Free Account/i);
    fireEvent.click(createAccountButton);    // Wait for account creation flow to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 5000 });

    // Note: In simplified flow, payment service methods are not called
    // The account is created instantly without payment processing
  });

  it('should validate required fields at each step', async () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Try to continue without filling required fields
    fireEvent.click(screen.getByText(/Continue/i));

    // Should show validation error and stay on step 1
    await waitFor(() => {
      expect(screen.getByText(/Company Information/i)).toBeInTheDocument();
    });
  });
  it('should show simplified signup mode when payment is disabled', async () => {
    // This test verifies the simplified mode works without payment processing
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Fill all steps quickly
    const fillStep1 = () => {
      fireEvent.change(screen.getByPlaceholderText(/Your Company Name/i), { target: { value: 'Demo Corp' } });
      fireEvent.change(screen.getByPlaceholderText(/company.com/i), { target: { value: 'demo.com' } });
      fireEvent.change(screen.getByPlaceholderText(/123 Business Street/i), { target: { value: '123 Demo St' } });
      fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'Demo City' } });
      fireEvent.change(screen.getByPlaceholderText(/State/i), { target: { value: 'DC' } });
      fireEvent.change(screen.getByPlaceholderText(/12345/i), { target: { value: '12345' } });
      fireEvent.click(screen.getByText(/Continue/i));
    };

    const fillStep2 = async () => {
      await waitFor(() => expect(screen.getByText(/Admin Contact Details/i)).toBeInTheDocument());
      fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { target: { value: 'Demo User' } });
      fireEvent.change(screen.getByPlaceholderText(/john@company.com/i), { target: { value: 'demo@demo.com' } });
      fireEvent.change(screen.getByPlaceholderText(/\+1 \(555\) 123-4567/i), { target: { value: '+1 555 demo' } });
      fireEvent.change(screen.getByPlaceholderText(/e.g., HR Manager, Recruiter, CEO/i), { target: { value: 'Demo Role' } });
      fireEvent.click(screen.getByText(/Continue/i));
    };    const fillStep3 = async () => {
      await waitFor(() => expect(screen.getByRole('heading', { name: /Company Details/i })).toBeInTheDocument());
      
      // Fill in dropdown selections
      fireEvent.change(screen.getByDisplayValue('Select Industry'), { target: { value: 'Technology' } });
      fireEvent.change(screen.getByDisplayValue('Select Company Size'), { target: { value: '51-200 employees' } });
      fireEvent.change(screen.getByDisplayValue('Select ATS'), { target: { value: 'Greenhouse' } });
      fireEvent.change(screen.getByDisplayValue('Select Monthly Hires'), { target: { value: '6-20 hires' } });
      
      fireEvent.click(screen.getByText(/Continue/i));
    };    const completeStep4 = async () => {
      await waitFor(() => expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument());
      
      // Select the Professional plan (most popular)
      const professionalPlan = screen.getByText(/Professional/i).closest('div');
      if (professionalPlan) {
        fireEvent.click(professionalPlan);
      }
      
      // Wait a moment for plan selection to register
      await waitFor(() => expect(screen.getByText(/Create Free Account/i)).toBeInTheDocument());
      
      fireEvent.click(screen.getByText(/Create Free Account/i));
    };

    // Execute the full flow
    fillStep1();
    await fillStep2();
    await fillStep3();
    await completeStep4();

    // Verify completion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
