import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UnifiedSignupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupType, setSignupType] = useState<'admin' | 'user'>('admin');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyDomain: ''
  });
  
  const { signup } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    if (signupType === 'admin' && !formData.companyName.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Company name is required for admin accounts'
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(
        formData.email,
        formData.password,
        formData.name,
        signupType === 'admin' ? formData.companyName : undefined
      );
        if (success) {
        addNotification({
          type: 'success',
          title: 'Account Created Successfully',
          message: signupType === 'admin' 
            ? 'Welcome to Xact Feedback! Your company account has been created.' 
            : 'Your account has been created and is pending approval.'
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Signup Failed',
        message: 'Failed to create account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Join Xact Feedback
            </h1>
            <p className="text-lg text-gray-600">
              Transform your recruitment process with AI-powered feedback
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Signup Type Toggle */}
            <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSignupType('admin')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  signupType === 'admin'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Company
              </button>
              <button
                type="button"
                onClick={() => setSignupType('user')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  signupType === 'user'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Join Team
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Company Name (Admin only) */}
              {signupType === 'admin' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required={signupType === 'admin'}
                      value={formData.companyName}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
              )}

              {/* Company Domain (User only) */}
              {signupType === 'user' && (
                <div>
                  <label htmlFor="companyDomain" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Domain *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="companyDomain"
                      name="companyDomain"
                      type="text"
                      required={signupType === 'user'}
                      value={formData.companyDomain}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      placeholder="company.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your company's domain to join their workspace
                  </p>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-12 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>
                    {signupType === 'admin' ? 'Create Company Account' : 'Join Team'}
                  </span>
                )}
              </button>
            </form>

            {/* Additional Info */}
            {signupType === 'user' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your account will be created immediately, but may require admin approval before you can access all features.
                </p>
              </div>
            )}

            {/* Footer Links */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
