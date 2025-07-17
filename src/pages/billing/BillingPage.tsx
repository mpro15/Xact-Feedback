import React, { useState } from 'react';
import { CreditCard, Download, Calendar, TrendingUp, TrendingDown, Users, Mail, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for credits and billing
  const creditMetrics = {
    totalCredits: 1000,
    usedCredits: 347,
    remainingCredits: 653,
    monthlyAllowance: 1000,
    currentPlan: 'Professional',
    billingCycle: 'Monthly',
    nextBillingDate: '2024-02-15'
  };

  const creditUsage = [
    { category: 'Users', used: 45, rate: '$1 per user/month', icon: Users, color: 'text-blue-600' },
    { category: 'Emails Sent', used: 234, rate: '$1 per 10 emails', icon: Mail, color: 'text-green-600' },
    { category: 'AI Transactions', used: 68, rate: '$1 per 5 AI calls', icon: Zap, color: 'text-purple-600' }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 149.00,
      status: 'paid',
      description: 'Professional Plan - January 2024',
      credits: 1000,
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 149.00,
      status: 'paid',
      description: 'Professional Plan - December 2023',
      credits: 1000,
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 149.00,
      status: 'paid',
      description: 'Professional Plan - November 2023',
      credits: 1000,
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-010',
      date: '2023-10-15',
      amount: 149.00,
      status: 'paid',
      description: 'Professional Plan - October 2023',
      credits: 1000,
      downloadUrl: '#'
    }
  ];

  const creditHistory = [
    { date: '2024-01-20', type: 'usage', category: 'Emails Sent', amount: -23, description: '230 feedback emails sent' },
    { date: '2024-01-19', type: 'usage', category: 'AI Transactions', amount: -15, description: '75 AI feedback generations' },
    { date: '2024-01-18', type: 'usage', category: 'Users', amount: -5, description: '5 new team members added' },
    { date: '2024-01-15', type: 'credit', category: 'Monthly Allowance', amount: 1000, description: 'Monthly credit allocation' },
    { date: '2024-01-14', type: 'usage', category: 'Emails Sent', amount: -18, description: '180 feedback emails sent' },
    { date: '2024-01-12', type: 'usage', category: 'AI Transactions', amount: -12, description: '60 AI feedback generations' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'credits', label: 'Credit History', icon: Zap }
  ];

  const handleDownloadInvoice = (invoiceId: string) => {
    addNotification({
      type: 'success',
      title: 'Invoice Downloaded',
      message: `Invoice ${invoiceId} has been downloaded successfully.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neumorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-3xl font-bold text-gray-900">{creditMetrics.totalCredits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-neumorphic-sm">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Monthly allowance</p>
        </div>

        <div className="neumorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Used</p>
              <p className="text-3xl font-bold text-orange-600">{creditMetrics.usedCredits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-neumorphic-sm">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500">{((creditMetrics.usedCredits / creditMetrics.totalCredits) * 100).toFixed(1)}% of allowance</p>
        </div>

        <div className="neumorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Remaining</p>
              <p className="text-3xl font-bold text-green-600">{creditMetrics.remainingCredits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-neumorphic-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Available this month</p>
        </div>
      </div>

      {/* Credit Usage Progress */}
      <div className="neumorphic-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Usage Progress</h3>
        <div className="neumorphic-progress h-4 mb-4">
          <div 
            className="neumorphic-progress-fill h-full transition-all duration-500"
            style={{ width: `${(creditMetrics.usedCredits / creditMetrics.totalCredits) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{creditMetrics.usedCredits} used</span>
          <span>{creditMetrics.remainingCredits} remaining</span>
        </div>
      </div>

      {/* Credit Usage Breakdown */}
      <div className="neumorphic-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Credit Usage Breakdown</h3>
        <div className="space-y-4">
          {creditUsage.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 neumorphic-card bg-background-light">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-neumorphic-sm`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.category}</p>
                  <p className="text-sm text-gray-600">{item.rate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{item.used} credits</p>
                <p className="text-sm text-gray-600">this month</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Information */}
      <div className="neumorphic-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-neumorphic-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{creditMetrics.currentPlan} Plan</p>
                <p className="text-sm text-gray-600">{creditMetrics.billingCycle} billing</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Credits:</span>
                <span className="font-medium text-gray-900">{creditMetrics.monthlyAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing:</span>
                <span className="font-medium text-gray-900">{creditMetrics.nextBillingDate}</span>
              </div>
            </div>
          </div>
          <div className="neumorphic-card p-4 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">Need More Credits?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Upgrade your plan or purchase additional credits to continue using all features.
            </p>
            <button className="neumorphic-btn-primary px-4 py-2 text-sm">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
        <button className="neumorphic-btn px-4 py-2 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download All</span>
        </button>
      </div>

      <div className="neumorphic-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="neumorphic-table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shadow/20">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="neumorphic-table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{invoice.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.credits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`neumorphic-badge text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="neumorphic-btn p-2 text-blue-600 hover:text-blue-800"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreditHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Credit Transaction History</h3>
      
      <div className="space-y-3">
        {creditHistory.map((transaction, index) => (
          <div key={index} className="neumorphic-card p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-neumorphic-sm ${
                transaction.type === 'credit' 
                  ? 'bg-gradient-to-r from-green-100 to-green-200' 
                  : 'bg-gradient-to-r from-red-100 to-red-200'
              }`}>
                {transaction.type === 'credit' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.category}</p>
                <p className="text-sm text-gray-600">{transaction.description}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Billing & Credits</h1>
        <p className="text-gray-600">Manage your subscription, credits, and billing information</p>
      </div>

      {/* Credit Alert */}
      {creditMetrics.remainingCredits < 100 && (
        <div className="neumorphic-card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">Low Credit Balance</h4>
              <p className="text-sm text-yellow-800">
                You have {creditMetrics.remainingCredits} credits remaining. Consider upgrading your plan or purchasing additional credits.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="neumorphic-card">
        {/* Tabs */}
        <div className="border-b border-shadow/20">
          <nav className="flex space-x-2 px-4 sm:px-6 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'neumorphic-tab-active text-white shadow-neumorphic-inset'
                    : 'neumorphic-tab text-gray-700 hover:text-primary-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'credits' && renderCreditHistory()}
        </div>
      </div>
    </div>
  );
};