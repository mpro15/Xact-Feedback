import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FilterProvider } from './contexts/FilterContext';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { CustomerSignupPage } from './pages/auth/CustomerSignupPage';
import { UserSignupPage } from './pages/auth/UserSignupPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

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
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/customer-signup" element={<CustomerSignupPage />} />
                <Route path="/signup" element={<UserSignupPage />} />

                {/* Onboarding Route */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />

                {/* Protected Routes with Dashboard Layout */}
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

                {/* Redirect Root */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Toast/Popup Notifications */}
              <NotificationContainer />
            </Router>
          </NotificationProvider>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
