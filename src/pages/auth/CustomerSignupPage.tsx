import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Building, User, Mail, Phone, MapPin, 
  Users, CreditCard, Check, ArrowRight, ArrowLeft, 
  Crown, Shield, Star, Globe, HeadphonesIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';

interface FormData {
  // Step 1: Company Information
  companyName: string;
  companyDomain: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Step 2: Admin Details
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  jobTitle: string;
  
  // Step 3: Company Details
  industry: string;
  companySize: string;
  currentATS: string;
  monthlyHires: string;
  
  // Step 4: Selected Plan
  selectedPlan: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
  description: string;
}

export const CustomerSignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyDomain: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    jobTitle: '',
    industry: '',
    companySize: '',
    currentATS: '',
    monthlyHires: '',
    selectedPlan: 'professional'
  });

  const { signup } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      period: '/month',
      description: 'Perfect for small teams starting their feedback journey',
      features: [
        'Up to 100 candidates/month',
        'Basic email templates',
        'Standard analytics',
        'Email support',
        'PDF feedback reports',
        'Basic ATS integration'
      ],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 149,
      originalPrice: 199,
      period: '/month',
      description: 'Ideal for growing companies with active recruitment',
      features: [
        'Up to 500 candidates/month',
        'Custom branding',
        'Advanced analytics & insights',
        'Multi-ATS integrations',
        'Priority support',
        'Custom email templates',
        'White-label reports',
        'Team collaboration tools',
        'API access'
      ],
      recommended: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      period: '/month',
      description: 'For large organizations with complex requirements',
      features: [
        'Unlimited candidates',
        'Full white-label solution',
        'Custom integrations',
        'Dedicated support manager',
        'SLA guarantee (99.9% uptime)',
        'Advanced security features',
        'Custom workflows',
        'Multi-language support',
        'Advanced reporting & BI',
        'SSO integration',
        'Custom onboarding'
      ],
      recommended: false
    }
  ];

  const steps = [
    { id: 1, title: 'Company Info', icon: Building },
    { id: 2, title: 'Contact Details', icon: User },
    { id: 3, title: 'Company Details', icon: Users },
    { id: 4, title: 'Choose Plan', icon: CreditCard }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
    'Education', 'Consulting', 'Real Estate', 'Media', 'Non-profit', 'Other'
  ];

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const atsOptions = [
    'Workday', 'BambooHR', 'Greenhouse', 'Lever', 'SmartRecruiters',
    'iCIMS', 'Taleo', 'Jobvite', 'None', 'Other'
  ];

  const monthlyHiresOptions = [
    '1-5 hires', '6-20 hires', '21-50 hires', '51-100 hires', '100+ hires'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.companyDomain && formData.address && 
                 formData.city && formData.state && formData.zipCode);
      case 2:
        return !!(formData.adminName && formData.adminEmail && formData.adminPhone && formData.jobTitle);
      case 3:
        return !!(formData.industry && formData.companySize && formData.currentATS && formData.monthlyHires);
      case 4:
        return !!formData.selectedPlan;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      addNotification({
        type: 'error',
        title: 'Please Complete All Fields',
        message: 'All fields are required to continue to the next step.'
      });
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };  const generateUniqueSubdomain = (companyName: string) => {
    // Generate a unique subdomain with timestamp to avoid conflicts
    const timestamp = Date.now();
    const baseName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 10); // Limit length
    return `${baseName}${timestamp}`;
  };  const handlePaymentAndSignup = async () => {
    // Validate form data before proceeding
    if (!validateStep(4)) {
      addNotification({
        type: 'error',
        title: 'Please Select a Plan',
        message: 'Please choose a plan to continue.'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail)) {
      addNotification({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.'
      });
      return;
    }    setIsLoading(true);
    
    try {
      // Generate unique company name with subdomain number to avoid conflicts
      const uniqueSubdomain = generateUniqueSubdomain(formData.companyName);
      const uniqueCompanyName = `${formData.companyName} (${uniqueSubdomain})`;
      
      console.log('Creating account with email verification for:', {
        email: formData.adminEmail,
        companyName: uniqueCompanyName
      });

      // Create user account with email verification
      const { data, error } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: 'temporary-password', // Will be set by user after email verification
        options: {
          data: {
            name: formData.adminName,
            company_name: uniqueCompanyName,
            company_domain: formData.companyDomain,
            company_address: formData.address,
            company_city: formData.city,
            company_state: formData.state,
            company_zip: formData.zipCode,
            company_country: formData.country,
            admin_phone: formData.adminPhone,
            job_title: formData.jobTitle,
            industry: formData.industry,
            company_size: formData.companySize,
            current_ats: formData.currentATS,
            monthly_hires: formData.monthlyHires,
            selected_plan: formData.selectedPlan
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Failed to create account');
      }

      if (data.user && !data.session) {
        // Email verification required
        console.log('Account created, email verification required');
        
        addNotification({
          type: 'success',
          title: 'Account Created!',
          message: 'Please check your email to verify your account and complete the setup.'
        });

        // Navigate to email verification sent page
        navigate('/auth/verify-email-sent', { 
          state: { email: formData.adminEmail }
        });
      } else if (data.session) {
        // User is already confirmed (shouldn't happen with email confirmation enabled)
        console.log('User confirmed immediately');
        navigate('/auth/setup-password');
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      addNotification({
        type: 'error',
        title: 'Signup Failed',
        message: error.message || 'There was an error creating your account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h3>
              <p className="text-gray-600">Tell us about your company to get started</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Domain *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.companyDomain}
                    onChange={(e) => handleInputChange('companyDomain', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="company.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="123 Business Street"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Contact Details</h3>
              <p className="text-gray-600">Primary contact information for your account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="e.g., HR Manager, Recruiter, CEO"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Details</h3>
              <p className="text-gray-600">Help us understand your recruitment needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Size *
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Company Size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current ATS *
                </label>
                <select
                  value={formData.currentATS}
                  onChange={(e) => handleInputChange('currentATS', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="">Select ATS</option>
                  {atsOptions.map((ats) => (
                    <option key={ats} value={ats}>{ats}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Hires *
                </label>
                <select
                  value={formData.monthlyHires}
                  onChange={(e) => handleInputChange('monthlyHires', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Monthly Hires</option>
                  {monthlyHiresOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Select the perfect plan for your company's needs</p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <Star className="w-4 h-4 mr-2" />
                <span className="font-semibold">30-Day Free Trial - No Payment Required</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleInputChange('selectedPlan', plan.id)}
                  className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                    formData.selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  } ${plan.popular ? 'ring-2 ring-blue-200' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {plan.recommended && (
                    <div className="absolute top-4 right-4">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="flex items-center justify-center mb-2">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through mr-2">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        Free
                      </span>
                      <span className="text-gray-600 ml-1">for 30 days</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Then ${plan.price}{plan.period}
                    </p>

                    {plan.originalPrice && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                        Save ${plan.originalPrice - plan.price}/month
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className={`w-full py-3 px-4 rounded-xl text-center font-semibold transition-colors ${
                      formData.selectedPlan === plan.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formData.selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  SSL Encrypted
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  30-Day Free Trial
                </div>
                <div className="flex items-center">
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Transform Your Recruitment Process
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of companies using Xact Feedback to provide meaningful insights to candidates
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Step {step.id}
                  </p>
                  <p className={`text-sm ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-6 py-3 text-gray-600 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (              <button
                onClick={handlePaymentAndSignup}
                disabled={isLoading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Creating Account...</span>
                  </>
                ) : (
                  <>
                    Create Free Account
                    <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
