import React, { useState } from 'react';
import { Save, RefreshCw, TestTube } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const EmailSettings: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    senderName: 'HR Team',
    senderEmail: 'hr@company.com',
    replyToEmail: 'no-reply@company.com',
    subjectTemplate: 'Thank you for your application - {candidate_name}',
    emailSignature: 'Best regards,\nHR Team\nYour Company',
    unsubscribeText: 'If you no longer wish to receive these emails, you can unsubscribe here.'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your email settings have been updated successfully.'
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

  const handleTestEmail = async () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email Configuration</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure how feedback emails are sent to candidates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="If you no longer wish to receive these emails, you can unsubscribe here."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Email Preview</h4>
        <div className="bg-white rounded border border-blue-200 p-3 text-sm">
          <div className="mb-2">
            <strong>From:</strong> {formData.senderName} &lt;{formData.senderEmail}&gt;
          </div>
          <div className="mb-2">
            <strong>Subject:</strong> {formData.subjectTemplate.replace('{candidate_name}', 'John Doe')}
          </div>
          <div className="mt-4 border-t pt-2">
            <p>Dear John Doe,</p>
            <p>Thank you for your application...</p>
            <div className="mt-4 whitespace-pre-line text-gray-600">
              {formData.emailSignature}
            </div>
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