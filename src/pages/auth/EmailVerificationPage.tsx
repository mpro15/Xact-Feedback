import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const EmailVerificationPage: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [email, setEmail] = useState('');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (type === 'signup' && token) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email verification error:', error);
            setVerificationError(error.message);
          } else if (data.user) {
            setIsVerified(true);
            addNotification({
              type: 'success',
              title: 'Email Verified!',
              message: 'Your email has been verified successfully. You can now set up your password.'
            });
            
            // Redirect to password setup page after a short delay
            setTimeout(() => {
              navigate('/auth/setup-password');
            }, 2000);
          }
        } catch (error: any) {
          console.error('Verification error:', error);
          setVerificationError(error.message || 'Failed to verify email');
        }
      } else {
        setVerificationError('Invalid verification link');
      }
      
      setIsVerifying(false);
    };

    verifyEmail();
  }, [searchParams, navigate, addNotification]);

  const handleResendEmail = async () => {
    if (!email) {
      addNotification({
        type: 'error',
        title: 'Email Required',
        message: 'Please enter your email address to resend the verification email.'
      });
      return;
    }

    setResendingEmail(true);
    
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
      addNotification({
        type: 'error',
        title: 'Failed to Resend',
        message: error.message || 'Failed to resend verification email.'
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 text-center p-8">
          <div>
            <LoadingSpinner size="large" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 text-center p-8">
          <div>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified. You'll be redirected to set up your password.
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verificationError || 'There was an issue verifying your email address.'}
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resend Verification Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a new verification link.
            </p>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={resendingEmail || !email}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendingEmail ? (
              <>
                <LoadingSpinner size="small" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
