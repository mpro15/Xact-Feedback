import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);
      // Fetch company subscription status
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) {
        setSubscriptionActive(false);
        setLoading(false);
        return;
      }
      const { data: company } = await supabase.from('companies').select('subscription_active').eq('id', profile.company_id).single();
      setSubscriptionActive(!!company?.subscription_active);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.accountType === 'user' && !user.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. Please wait for an administrator to approve your access.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionActive) {
    return <Navigate to="/payment-pending" replace />;
  }

  return <Outlet />;
};