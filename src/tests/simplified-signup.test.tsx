import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomerSignupPage } from '../pages/auth/CustomerSignupPage';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock the auth context with simplified signup
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    signup: vi.fn(() => Promise.resolve(true)),
    user: null,
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
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

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe('Simplified Customer Signup Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should show simplified signup flow without payment', () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Check for key elements on step 1
    expect(screen.getByText(/Transform Your Recruitment Process/i)).toBeInTheDocument();
    expect(screen.getByText(/Company Information/i)).toBeInTheDocument();
  });

  it('should complete signup without payment processing', async () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Fill minimal required data for Step 1
    fireEvent.change(screen.getByPlaceholderText(/Your Company Name/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/company.com/i), { 
      target: { value: 'test.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/123 Business Street/i), { 
      target: { value: '123 Test St' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/City/i), { 
      target: { value: 'Test City' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/State/i), { 
      target: { value: 'TS' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/12345/i), { 
      target: { value: '12345' } 
    });

    // Go to step 2
    fireEvent.click(screen.getByText(/Continue/i));

    await waitFor(() => {
      expect(screen.getByText(/Admin Contact Details/i)).toBeInTheDocument();
    });

    // Fill Step 2
    fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { 
      target: { value: 'Test Admin' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/john@company.com/i), { 
      target: { value: 'admin@test.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/\+1 \(555\) 123-4567/i), { 
      target: { value: '+1 555 TEST' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g., HR Manager, Recruiter, CEO/i), { 
      target: { value: 'Test Role' } 
    });    // Go to step 3
    fireEvent.click(screen.getByText(/Continue/i));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Company Details/i })).toBeInTheDocument();
    });

    // Fill Step 3 required fields
    fireEvent.change(screen.getByDisplayValue('Select Industry'), { 
      target: { value: 'Technology' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select Company Size'), { 
      target: { value: '11-50 employees' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select ATS'), { 
      target: { value: 'Greenhouse' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select Monthly Hires'), { 
      target: { value: '6-20 hires' } 
    });

    // Go to step 4
    fireEvent.click(screen.getByText(/Continue/i));

    await waitFor(() => {
      expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument();
    });

    // Verify "Create Free Account" button exists
    expect(screen.getByText(/Create Free Account/i)).toBeInTheDocument();
  });

  it('should show free trial messaging on step 4', async () => {
    render(
      <TestWrapper>
        <CustomerSignupPage />
      </TestWrapper>
    );

    // Navigate through steps to reach step 4
    // Step 1: Fill company information
    fireEvent.change(screen.getByPlaceholderText(/Your Company Name/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/company.com/i), { 
      target: { value: 'test.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/123 Business Street/i), { 
      target: { value: '123 Test St' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/City/i), { 
      target: { value: 'Test City' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/State/i), { 
      target: { value: 'TS' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/12345/i), { 
      target: { value: '12345' } 
    });
    fireEvent.click(screen.getByText(/Continue/i));

    // Step 2: Fill admin details
    await waitFor(() => {
      expect(screen.getByText(/Admin Contact Details/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { 
      target: { value: 'Test Admin' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/john@company.com/i), { 
      target: { value: 'admin@test.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/\+1 \(555\) 123-4567/i), { 
      target: { value: '+1 555 TEST' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g., HR Manager, Recruiter, CEO/i), { 
      target: { value: 'Test Role' } 
    });
    fireEvent.click(screen.getByText(/Continue/i));    // Step 3: Company details
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Company Details/i })).toBeInTheDocument();
    });
    
    // Fill Step 3 required fields
    fireEvent.change(screen.getByDisplayValue('Select Industry'), { 
      target: { value: 'Technology' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select Company Size'), { 
      target: { value: '11-50 employees' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select ATS'), { 
      target: { value: 'Greenhouse' } 
    });
    fireEvent.change(screen.getByDisplayValue('Select Monthly Hires'), { 
      target: { value: '6-20 hires' } 
    });
    
    fireEvent.click(screen.getByText(/Continue/i));

    // Step 4: Check for free trial messaging
    await waitFor(() => {
      expect(screen.getByText(/Choose Your Plan/i)).toBeInTheDocument();
    });    expect(screen.getByText(/30-Day Free Trial - No Payment Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Free Account/i)).toBeInTheDocument();
    
    // Verify we can see pricing plans
    expect(screen.getByText(/Starter/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise/i)).toBeInTheDocument();
  });
});
