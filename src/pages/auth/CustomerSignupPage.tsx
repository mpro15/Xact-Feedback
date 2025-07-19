import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, User, Building, Eye, EyeOff, CheckCircle, ArrowRight, CreditCard, Phone, Users, Crown, Zap, Shield } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const CustomerSignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    domain: '',
    employees: '',
    industry: '',
    
    // Step 2: Admin Details
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Plan Selection
    plan: 'professional' as const,
    billingCycle: 'monthly', // string type
    
    // Step 4: Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    
    // Additional
    department: 'Human Resources',
    timezone: 'America/New_York'
  });
  
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Company Details', icon: Building, description: 'Tell us about your organization' },
    { id: 2, title: 'Admin Account', icon: User, description: 'Create your administrator account' },
    { id: 3, title: 'Choose Plan', icon: Crown, description: 'Select your subscription plan' },
    { id: 4, title: 'Payment & Launch', icon: CreditCard, description: 'Complete payment and launch' }
  ];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 100 candidates/month',
        'Basic email templates',
        'Standard analytics',
        'Email support',
        'Basic integrations',
        '5 team members'
      ],
      recommended: false,
      gradient: 'from-gray-500 to-gray-600',
      popular: false,
      badge: null
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 149,
      yearlyPrice: 1490,
      description: 'Most popular choice for growing companies',
      features: [
        'Up to 500 candidates/month',
        'Custom branding & templates',
        'Advanced analytics & reporting',
        'ATS integrations',
        'Priority support',
        'A/B testing',
        'Custom workflows',
        '15 team members'
      ],
      recommended: true,
      gradient: 'from-blue-500 to-indigo-600',
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 399,
      yearlyPrice: 3990,
      description: 'Advanced features for large organizations',
      features: [
        'Unlimited candidates',
        'White-label solution',
        'Custom integrations & API',
        'Dedicated support manager',
        'SLA guarantee',
        'Advanced security',
        'Custom training',
        'Unlimited team members'
      ],
      recommended: false,
      gradient: 'from-purple-500 to-pink-600',
      popular: false,
      badge: 'Enterprise'
    }
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Other'
  ];

  const employeeRanges = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-100', label: '51-100 employees' },
    { value: '101-500', label: '101-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.companyName.trim() || !formData.employees) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required company information'
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required admin details'
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        addNotification({
          type: 'error',
          title: 'Password Mismatch',
          message: 'Passwords do not match'
        });
        return;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.plan) {
        addNotification({
          type: 'error',
          title: 'Plan Selection Required',
          message: 'Please select a subscription plan'
        });
        return;
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentAndLaunch = async () => {
    setIsLoading(true);
    try {
      // 1. Signup logic (create company & user)
      // const signupRes = await signup({
      //   name: formData.name,
      //   email: formData.email,
      //   password: formData.password,
      //   companyName: formData.companyName,
      //   domain: formData.domain,
      //   employees: formData.employees,
      //   industry: formData.industry,
      //   department: formData.department,
      //   timezone: formData.timezone,
      // });
      // if (!signupRes?.companyId) throw new Error('Signup failed');
      // 2. Create Razorpay order
      const orderRes = await fetch('/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // companyId: signupRes.companyId,
          plan: formData.plan,
          billingCycle: formData.billingCycle,
        })
      });
      const { order, key_id } = await orderRes.json();
      // 3. Launch Razorpay checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: formData.companyName,
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Verify payment
          const verifyRes = await fetch('/functions/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // companyId: signupRes.companyId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            })
          });
          const verify = await verifyRes.json();
          if (verify.success) {
            addNotification({ type: 'success', title: 'Payment', message: 'Payment successful! You can now log in.' });
            navigate('/login');
          } else {
            addNotification({ type: 'error', title: 'Payment', message: 'Payment verification failed.' });
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#22c55e' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Payment', message: err.message || 'Payment error' });
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getSelectedPlan = () => plans.find(p => p.id === formData.plan);
  const selectedPlan = getSelectedPlan();
  const planPrice = formData.billingCycle === 'yearly' ? selectedPlan?.yearlyPrice : selectedPlan?.monthlyPrice;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Building className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Company Information</h3>
              <p className="text-lg text-gray-600">Let's start by learning about your organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Website
                </label>
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                  placeholder="www.company.com"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-3">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg appearance-none"
                >
                  <option value="">Select industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="employees" className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Size *
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="employees"
                    name="employees"
                    value={formData.employees}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg appearance-none"
                  >
                    <option value="">Select company size</option>
                    {employeeRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Administrator Account</h3>
              <p className="text-lg text-gray-600">Create your admin account to manage the platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-3">
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                  placeholder="HR Director"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12 pr-12 w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h3>
              <p className="text-lg text-gray-600">Select the perfect plan for your organization</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    formData.billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'yearly' }))}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    formData.billingCycle === 'yearly'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly <span className="text-green-600 text-sm ml-1">(Save 17%)</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const price = formData.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                const period = formData.billingCycle === 'yearly' ? '/year' : '/month';
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
                    className={`relative p-8 border-3 rounded-3xl cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl ${
                      formData.plan === plan.id
                        ? 'border-blue-500 bg-blue-50 shadow-2xl ring-4 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl bg-white'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg text-white ${
                          plan.popular ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'
                        }`}>
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        {plan.id === 'starter' && <Zap className="w-8 h-8 text-white" />}
                        {plan.id === 'professional' && <Crown className="w-8 h-8 text-white" />}
                        {plan.id === 'enterprise' && <Shield className="w-8 h-8 text-white" />}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h4>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-bold text-gray-900">${price}</span>
                        <span className="text-gray-600 ml-2 text-lg">{period}</span>
                      </div>
                      {formData.billingCycle === 'yearly' && (
                        <p className="text-green-600 text-sm font-medium">
                          Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice} per year
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {formData.plan === plan.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-3xl pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Setup</h3>
              <p className="text-lg text-gray-600">Secure payment and launch your platform</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Payment Form */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h4>
                
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 mb-3">
                    Card Number *
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-3">
                      Expiry Date *
                    </label>
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      required
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 mb-3">
                      CVV *
                    </label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      required
                      value={formData.cvv}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="billingAddress" className="block text-sm font-semibold text-gray-700 mb-3">
                    Billing Address
                  </label>
                  <input
                    id="billingAddress"
                    name="billingAddress"
                    type="text"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h4>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium text-gray-900">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Admin:</span>
                    <span className="font-medium text-gray-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-blue-600 capitalize">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.billingCycle}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">${planPrice}{formData.billingCycle === 'yearly' ? '/year' : '/month'}</span>
                  </div>
                  {formData.billingCycle === 'yearly' && (
                    <p className="text-green-600 text-sm mt-2">
                      You're saving ${((selectedPlan?.monthlyPrice || 0) * 12) - (selectedPlan?.yearlyPrice || 0)} per year!
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">What happens next?</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Instant access to your dashboard</li>
                    <li>• Complete onboarding setup</li>
                    <li>• Start sending feedback immediately</li>
                    <li>• 24/7 support available</li>
                  </ul>
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
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              Start Your Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your recruitment process with AI-powered candidate feedback. Join thousands of companies already using Xact Feedback.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-8">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                        currentStep >= step.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transform scale-110' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <step.icon className="w-8 h-8" />
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p className={`text-sm font-bold ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400 hidden sm:block mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-20 h-2 mx-6 rounded-full transition-all duration-500 ${
                        currentStep > step.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="px-8 py-12">
              <div className="max-w-5xl mx-auto">
                {renderStepContent()}
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 py-8">
              <div className="flex justify-between max-w-5xl mx-auto">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-8 py-4 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Previous
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePaymentAndLaunch}
                    disabled={isLoading}
                    className="px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Complete Payment & Launch</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Looking to join an existing team?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                User signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};