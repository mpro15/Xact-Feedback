import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FilterProvider } from './contexts/FilterContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerSignupPage } from './pages/auth/CustomerSignupPage';
import { UserSignupPage } from './pages/auth/UserSignupPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CandidatesPage } from './pages/candidates/CandidatesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { BillingPage } from './pages/billing/BillingPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { NotificationContainer } from './components/ui/NotificationContainer';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
        <NotificationProvider>
          <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/customer-signup" element={<CustomerSignupPage />} />
                <Route path="/signup" element={<UserSignupPage />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <NotificationContainer />
          </Router>
        </NotificationProvider>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;