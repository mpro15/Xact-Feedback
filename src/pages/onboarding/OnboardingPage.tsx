import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Upload, Palette, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    logo: null as File | null,
    primaryColor: '#2563EB',
    secondaryColor: '#059669',
    emailSender: '',
    emailSignature: ''
  });

  const { user, updateUser } = useAuth();
  const { updateTheme } = useTheme();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Enterprise: Redirect if already onboarded
  useEffect(() => {
    if (user?.isOnboarded) {
      navigate('/dashboard');
      return;
    }
    // If user is not onboarded, stay on onboarding page
  }, [user, navigate]);

  const steps = [
    { id: 1, title: 'Company Branding', icon: Palette },
    { id: 2, title: 'Email Configuration', icon: Mail },
    { id: 3, title: 'Setup Complete', icon: CheckCircle }
  ];

  const validateForm = () => {
    if (!formData.primaryColor || !formData.secondaryColor) {
      return 'Branding colors are required.';
    }
    if (!formData.logo) {
      return 'Company logo is required.';
    }
    if (!formData.emailSender || formData.emailSender.length < 2) {
      return 'Sender name is required.';
    }
    if (!formData.emailSignature || formData.emailSignature.length < 2) {
      return 'Email signature is required.';
    }
    if (formData.logo && formData.logo.size > 2 * 1024 * 1024) {
      return 'Logo file size must be less than 2MB.';
    }
    return null;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (!user || !user.id) {
        throw new Error('User not found. Please log in again.');
      }
      // Validate all form fields
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }
      // Upload logo to Supabase Storage (if needed)
      let logoUrl = user.logoUrl || '';
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, formData.logo, { upsert: true });
        if (uploadError) {
          throw uploadError;
        }
        logoUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/company-logos/${fileName}`;
      }
      // Update theme (only known properties)
      updateTheme({
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        companyName: user?.companyName || 'Your Company'
      });
      // Update user onboarding status and branding in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          isOnboarded: true,
          logoUrl,
          emailSender: formData.emailSender,
          emailSignature: formData.emailSignature
        })
        .eq('id', user.id);
      if (updateError) {
        throw updateError;
      }
      // Refetch user profile from Supabase to ensure context is up-to-date
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (fetchError || !profile) {
        throw fetchError || new Error('Failed to fetch updated user profile.');
      }
      updateUser({ ...profile });
      addNotification({
        type: 'success',
        title: 'Setup Complete',
        message: 'Your account is now ready to use!'
      });
      console.log('[OnboardingPage] Onboarding completed for user:', user.id);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('[OnboardingPage] Setup Failed:', error);
      addNotification({
        type: 'error',
        title: 'Setup Failed',
        message: error?.message || 'Failed to complete setup. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Branding</h3>
              <p className="text-sm text-gray-600 mb-6">
                Customize your company's branding for feedback emails and PDFs.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or SVG (MAX. 2MB)</p>
                  </div>
                  <input
                    type="file"
                    data-cy="logo-upload"
                    className={typeof window !== 'undefined' && (window as any).Cypress ? "" : "hidden"}
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  data-cy="primary-color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  data-cy="secondary-color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure how feedback emails will be sent to candidates.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                data-cy="email-sender"
                value={formData.emailSender}
                onChange={(e) => setFormData(prev => ({ ...prev, emailSender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="HR Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Signature
              </label>
              <textarea
                data-cy="email-signature"
                value={formData.emailSignature}
                onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Best regards,&#10;HR Team&#10;Your Company"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Setup Complete!</h3>
              <p className="text-sm text-gray-600">
                Your account is now configured and ready to use. You can always update these settings later.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center text-red-600 font-bold p-8">Invalid onboarding step: {currentStep}</div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Xact Feedback
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your account in just a few steps
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;