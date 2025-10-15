import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomerSignupPage } from '../pages/auth/CustomerSignupPage';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [{}],
          error: null
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

describe('Simplified Customer Signup Flow - Working Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the customer signup page', () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Check for basic elements on step 1
    expect(screen.getByText(/Transform Your Recruitment Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Company Information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your Company Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/company.com/i)).toBeInTheDocument();
  });

  it('should allow filling out step 1 form fields', () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Fill out step 1 fields
    const companyNameInput = screen.getByPlaceholderText(/Your Company Name/i);
    const domainInput = screen.getByPlaceholderText(/company.com/i);
    
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });
    fireEvent.change(domainInput, { target: { value: 'test.com' } });

    expect(companyNameInput).toHaveValue('Test Company');
    expect(domainInput).toHaveValue('test.com');
  });

  it('should show simplified signup elements on initial render', () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Check for expected elements
    expect(screen.getByText('Transform Your Recruitment Process')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of companies using Xact Feedback to provide meaningful insights to candidates')).toBeInTheDocument();
    
    // Check step indicator
    expect(screen.getByText('Company Info')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Company Details')).toBeInTheDocument();
    expect(screen.getByText('Choose Plan')).toBeInTheDocument();
  });

  it('should show continue button on step 1', () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Check for continue button
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });
});
