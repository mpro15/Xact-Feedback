import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FilterProvider } from './contexts/FilterContext';

import { NotificationContainer } from './components/ui/NotificationContainer';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { UnifiedSignupPage } from './pages/auth/UnifiedSignupPage';
import { CustomerSignupPage } from './pages/auth/CustomerSignupPage';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage';
import { EmailVerificationSentPage } from './pages/auth/EmailVerificationSentPage';
import { PasswordSetupPage } from './pages/auth/PasswordSetupPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { SupportLoginPage } from './pages/support/SupportLoginPage';
import { LandingPage } from './pages/LandingPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CandidatesPage } from './pages/candidates/CandidatesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { BillingPage } from './pages/billing/BillingPage';

import { supabase } from './lib/supabaseClient';

// Optional: create a NotFoundPage.tsx for invalid routes
const NotFoundPage = () => <div className="p-6 text-center text-red-600 font-semibold">404 – Page Not Found</div>;

function App() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      console.log('Supabase Auth user:', data.user);
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <NotificationProvider>            <Routes>              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<UnifiedSignupPage />} />
              <Route path="/customer-signup" element={<CustomerSignupPage />} />
              <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
              <Route path="/auth/verify-email-sent" element={<EmailVerificationSentPage />} />
              <Route path="/auth/setup-password" element={<PasswordSetupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/support-login" element={<SupportLoginPage />} />

              {/* Protected Routes - Require authentication only */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/candidates" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CandidatesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BillingPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* User Profile Route - Protected */}
              <Route path="/user-profile" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />              {/* Dashboard redirect for authenticated users */}
              <Route path="/dashboard-redirect" element={<Navigate to="/dashboard" replace />} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Toast/Popup Notifications */}
            <NotificationContainer />
          </NotificationProvider>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
