import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { completeSignupSetup } from '../../services/signupService';

export const PasswordSetupPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  useEffect(() => {
    // Check if user has a valid session and needs to set up password
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        addNotification({
          type: 'error',
          title: 'Session Required',
          message: 'Please verify your email first to set up your password.'
        });
        navigate('/login');
        return;
      }

      // Check if user's email is confirmed
      if (!session.user.email_confirmed_at) {
        addNotification({
          type: 'error',
          title: 'Email Not Verified',
          message: 'Please verify your email first before setting up your password.'
        });
        navigate('/auth/verify-email-sent', { state: { email: session.user.email } });
        return;
      }

      setIsValidUser(true);
      setUserEmail(session.user.email || '');
    };

    checkUserSession();
  }, [navigate, addNotification]);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      addNotification({
        type: 'error',
        title: 'Invalid Password',
        message: 'Please ensure your password meets all requirements.'
      });
      return;
    }

    if (password !== confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match. Please try again.'
      });
      return;
    }

    setIsLoading(true);
      try {
      // Update user password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      console.log('Password updated successfully, completing signup setup...');

      // Complete the signup setup (create company and user profile)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await completeSignupSetup(user.id);
      }

      addNotification({
        type: 'success',
        title: 'Account Setup Complete!',
        message: 'Your password has been set and your account is ready. Welcome to Xact Feedback!'
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Password setup error:', error);
      addNotification({
        type: 'error',
        title: 'Password Setup Failed',
        message: error.message || 'Failed to set up password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Set Up Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to Xact Feedback! Create a secure password for your account.
          </p>
          {userEmail && (
            <p className="mt-1 text-sm text-blue-600 font-medium">
              {userEmail}
            </p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h4>
              <div className="space-y-2">
                <div className={`flex items-center text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-300'}`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-300'}`} />
                  One uppercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-300'}`} />
                  One lowercase letter
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-300'}`} />
                  One number
                </div>
                <div className={`flex items-center text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`w-4 h-4 mr-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-300'}`} />
                  One special character
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
              className="w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Setting Up Password...</span>
                </>
              ) : (
                <span>Complete Setup</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
