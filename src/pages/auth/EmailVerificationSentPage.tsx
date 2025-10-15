import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const EmailVerificationSentPage: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
  
  // Get email from navigation state
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      addNotification({
        type: 'error',
        title: 'Email Required',
        message: 'No email address found. Please try signing up again.'
      });
      navigate('/customer-signup');
      return;
    }

    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: 'A new verification email has been sent to your email address.'
      });
    } catch (error: any) {
      console.error('Resend email error:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Resend',
        message: error.message || 'Failed to resend verification email. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="relative">
              <Mail className="w-16 h-16 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to
          </p>
          {email && (
            <p className="mt-1 text-sm font-semibold text-blue-600">
              {email}
            </p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h3>
            
            <div className="text-left space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check your email</p>
                  <p className="text-xs text-gray-600">Look for an email from Xact Feedback with a verification link</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                  <p className="text-xs text-gray-600">This will verify your email address</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Set up your password</p>
                  <p className="text-xs text-gray-600">Create a secure password for your account</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-green-600">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Access your dashboard</p>
                  <p className="text-xs text-gray-600">Start using Xact Feedback with your 30-day free trial</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <p className="text-xs text-gray-500 text-center">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>
            
            <button
              onClick={handleResendEmail}
              disabled={isResending || !email}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </div>

          <div className="border-t pt-6 text-center">
            <button
              onClick={() => navigate('/customer-signup')}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
