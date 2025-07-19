import React, { useState } from 'react';
import { Building, Users, CreditCard, Check, ArrowRight, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';

interface CustomerApplication {
  id: string;
  companyName: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  employees: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface CustomerApplicationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerApplicationFlow: React.FC<CustomerApplicationFlowProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<CustomerApplication[]>([]);

  React.useEffect(() => {
    async function fetchApplications() {
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (!profile?.company_id) {
        return;
      }
      // Fetch customer applications for company
      const { data: apps, error: appError } = await supabase
        .from('customer_applications')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });
      if (appError) {
        return;
      }
      setApplications(apps || []);
    }
    if (isOpen) fetchApplications();
  }, [isOpen]);

  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    employees: '',
    plan: 'professional' as const
  });

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: 'Company Information', icon: Building },
    { id: 2, title: 'Admin Details', icon: Users },
    { id: 3, title: 'Plan Selection', icon: CreditCard },
    { id: 4, title: 'Review & Submit', icon: Check }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
      period: '/month',
      features: ['Up to 100 candidates/month', 'Basic email templates', 'Standard analytics', 'Email support'],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$149',
      period: '/month',
      features: ['Up to 500 candidates/month', 'Custom branding', 'Advanced analytics', 'ATS integrations', 'Priority support'],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$399',
      period: '/month',
      features: ['Unlimited candidates', 'White-label solution', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
      recommended: false
    }
  ];

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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newApplication: CustomerApplication = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setApplications(prev => [newApplication, ...prev]);
      
      addNotification({
        type: 'success',
        title: 'Application Submitted',
        message: 'Customer application has been submitted successfully. You will receive a confirmation email shortly.'
      });
      
      setFormData({
        companyName: '',
        domain: '',
        adminName: '',
        adminEmail: '',
        phone: '',
        employees: '',
        plan: 'professional'
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit application. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    );
    
    addNotification({
      type: newStatus === 'approved' ? 'success' : 'warning',
      title: `Application ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Customer application has been ${newStatus}.`
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Domain *
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </label>
              <select
                value={formData.employees}
                onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="101-500">101-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name *
              </label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email *
              </label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1-555-0123"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.recommended ? 'ring-2 ring-blue-200' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-2 left-4 bg-blue-600 text-white px-2 py-1 text-xs rounded">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Your Application</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Company:</span>
                  <p className="text-sm text-gray-900">{formData.companyName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Domain:</span>
                  <p className="text-sm text-gray-900">{formData.domain}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Admin:</span>
                  <p className="text-sm text-gray-900">{formData.adminName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-sm text-gray-900">{formData.adminEmail}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Employees:</span>
                  <p className="text-sm text-gray-900">{formData.employees}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Plan:</span>
                  <p className="text-sm text-gray-900 capitalize">{formData.plan}</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Applications</h2>
            <p className="text-sm text-gray-600">Manage new customer onboarding</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Application Form */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Application</h3>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-1 mx-2 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="w-1/2 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{application.companyName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Admin:</span> {application.adminName}</p>
                    <p><span className="font-medium">Email:</span> {application.adminEmail}</p>
                    <p><span className="font-medium">Plan:</span> {application.plan}</p>
                    <p><span className="font-medium">Applied:</span> {application.createdAt}</p>
                  </div>
                  {application.status === 'pending' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleStatusChange(application.id, 'approved')}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};