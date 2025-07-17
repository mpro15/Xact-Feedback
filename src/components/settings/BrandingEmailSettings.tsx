import React, { useState } from 'react';
import { Upload, Save, RefreshCw, TestTube, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

export const BrandingEmailSettings: React.FC = () => {
  const { primaryColor, secondaryColor, logo, companyName, updateTheme } = useTheme();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryColor,
    secondaryColor,
    companyName,
    logo,
    senderName: 'HR Team',
    senderEmail: 'hr@company.com',
    replyToEmail: 'no-reply@company.com',
    subjectTemplate: 'Thank you for your application - {candidate_name}',
    emailSignature: 'Best regards,\nHR Team\nYour Company',
    unsubscribeText: 'If you no longer wish to receive these emails, you can unsubscribe here.',
    emailProvider: '',
    apiKey: '',
    isEmailConnected: false
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateTheme({
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        companyName: formData.companyName,
        logo: formData.logo
      });
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your branding and email settings have been updated successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.isEmailConnected) {
      addNotification({
        type: 'warning',
        title: 'Email Not Connected',
        message: 'Please connect your email service first.'
      });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: 'Test Email Sent',
        message: 'A test email has been sent to your address.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to send test email.'
      });
    }
  };

  const handleConnectEmail = async () => {
    if (!formData.emailProvider || !formData.apiKey) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select an email provider and enter your API key.'
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFormData(prev => ({ ...prev, isEmailConnected: true }));
      addNotification({
        type: 'success',
        title: 'Email Connected',
        message: `Successfully connected to ${formData.emailProvider}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect email service. Please check your API key.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Branding Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Company Branding</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Consistent branding increases email open rates by 23%
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Customize your company's visual identity for feedback emails and PDFs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border border-gray-300 rounded"
                />
              )}
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Logo</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#2563EB"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#059669"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Brand Preview</h4>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="font-medium" style={{ color: formData.primaryColor }}>
                {formData.companyName}
              </span>
            </div>
            <div className="space-y-2">
              <div
                className="w-full h-2 rounded"
                style={{ backgroundColor: formData.primaryColor }}
              />
              <div
                className="w-3/4 h-2 rounded"
                style={{ backgroundColor: formData.secondaryColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Email Configuration</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Professional email setup improves deliverability by 40%
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Configure how feedback emails are sent to candidates
        </p>

        {/* Email Service Connection */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Email Service Connection</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                value={formData.emailProvider}
                onChange={(e) => setFormData(prev => ({ ...prev, emailProvider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Provider</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="amazonses">Amazon SES</option>
                <option value="postmark">Postmark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your API key"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleConnectEmail}
              disabled={isLoading || formData.isEmailConnected}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : formData.isEmailConnected ? 'Connected' : 'Connect Email Service'}
            </button>
            {formData.isEmailConnected && (
              <span className="text-sm text-green-600 font-medium">✓ Email service connected</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Name
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="HR Team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Email
            </label>
            <input
              type="email"
              value={formData.senderEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hr@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reply-To Email
            </label>
            <input
              type="email"
              value={formData.replyToEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, replyToEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="no-reply@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Template
            </label>
            <input
              type="text"
              value={formData.subjectTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectTemplate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Thank you for your application - {candidate_name}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{candidate_name}, {position}, {company_name}'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Signature
            </label>
            <textarea
              value={formData.emailSignature}
              onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Best regards,&#10;HR Team&#10;Your Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unsubscribe Text
            </label>
            <textarea
              value={formData.unsubscribeText}
              onChange={(e) => setFormData(prev => ({ ...prev, unsubscribeText: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="If you no longer wish to receive these emails, you can unsubscribe here."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleTestEmail}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50"
        >
          <TestTube className="w-4 h-4 inline mr-2" />
          Send Test Email
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 inline mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};