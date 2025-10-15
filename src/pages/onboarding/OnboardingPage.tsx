import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Building, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';

export const OnboardingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: ''
  });

  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.is_onboarded) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'User not found. Please log in again.'
      });
      return;
    }

    if (!formData.companyName.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Company name is required.'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update user profile with onboarding completion
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_onboarded: true,
          role: formData.role || 'User'
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // If user is admin, update or create company record
      if (user.account_type === 'admin' && user.company_id) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: formData.companyName
          })
          .eq('id', user.company_id);

        if (companyError) {
          console.error('Error updating company:', companyError);
          // Don't fail the onboarding if company update fails
        }
      }

      addNotification({
        type: 'success',
        title: 'Setup Complete',
        message: 'Your account is now ready to use!'
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      addNotification({
        type: 'error',
        title: 'Setup Failed',
        message: error?.message || 'Failed to complete setup. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Complete Your Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Just a few more details to get you started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Account Type Display */}
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              {user.account_type === 'admin' ? (
                <Building className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {user.account_type === 'admin' ? 'Company Administrator' : 'Team Member'}
                </p>
                <p className="text-xs text-blue-600">
                  {user.account_type === 'admin' 
                    ? 'You can manage your company settings and team members'
                    : 'You have access to company feedback tools'
                  }
                </p>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                {user.account_type === 'admin' ? 'Company Name' : 'Your Company'}
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Your Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select your role</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Setting up...</span>
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;