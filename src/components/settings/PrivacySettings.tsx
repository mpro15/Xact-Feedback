import React, { useState } from 'react';
import { Save, RefreshCw, Shield, FileText, Users, Globe } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const PrivacySettings: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    gdprCompliance: true,
    ccpaCompliance: true,
    dataRetention: 365,
    autoDeleteRejected: false,
    allowCandidateDataExport: true,
    allowCandidateDataDeletion: true,
    trackingCookies: false,
    emailTracking: true,
    anonymizeAnalytics: false,
    requireConsent: true,
    consentText: 'I agree to receive feedback emails and understand my data will be processed according to the privacy policy.',
    privacyPolicyUrl: '',
    dataProcessingBasis: 'legitimate_interest'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your privacy settings have been updated successfully.'
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

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNumberChange = (key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy & Compliance</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure privacy settings and compliance requirements
        </p>
      </div>

      <div className="space-y-6">
        {/* Compliance Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Compliance Standards</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  GDPR Compliance
                </label>
                <p className="text-xs text-gray-500">
                  Enable GDPR-compliant data processing for EU candidates
                </p>
              </div>
              <button
                onClick={() => handleToggle('gdprCompliance')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.gdprCompliance ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.gdprCompliance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  CCPA Compliance
                </label>
                <p className="text-xs text-gray-500">
                  Enable CCPA-compliant data processing for California candidates
                </p>
              </div>
              <button
                onClick={() => handleToggle('ccpaCompliance')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.ccpaCompliance ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.ccpaCompliance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data processing basis
              </label>
              <select
                value={settings.dataProcessingBasis}
                onChange={(e) => handleSelectChange('dataProcessingBasis', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="legitimate_interest">Legitimate Interest</option>
                <option value="consent">Consent</option>
                <option value="contract">Contract</option>
                <option value="legal_obligation">Legal Obligation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Data Management</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data retention period (days)
              </label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleNumberChange('dataRetention', parseInt(e.target.value))}
                min="30"
                max="2555"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to keep candidate data (30-2555 days)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto-delete rejected candidates
                </label>
                <p className="text-xs text-gray-500">
                  Automatically delete candidate data after retention period
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoDeleteRejected')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.autoDeleteRejected ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoDeleteRejected ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow candidate data export
                </label>
                <p className="text-xs text-gray-500">
                  Let candidates request their data in portable format
                </p>
              </div>
              <button
                onClick={() => handleToggle('allowCandidateDataExport')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.allowCandidateDataExport ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowCandidateDataExport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow candidate data deletion
                </label>
                <p className="text-xs text-gray-500">
                  Let candidates request deletion of their data
                </p>
              </div>
              <button
                onClick={() => handleToggle('allowCandidateDataDeletion')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.allowCandidateDataDeletion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowCandidateDataDeletion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tracking & Analytics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">Tracking & Analytics</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email tracking
                </label>
                <p className="text-xs text-gray-500">
                  Track email opens and clicks for analytics
                </p>
              </div>
              <button
                onClick={() => handleToggle('emailTracking')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.emailTracking ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailTracking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Anonymize analytics
                </label>
                <p className="text-xs text-gray-500">
                  Remove personally identifiable information from analytics
                </p>
              </div>
              <button
                onClick={() => handleToggle('anonymizeAnalytics')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.anonymizeAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.anonymizeAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tracking cookies
                </label>
                <p className="text-xs text-gray-500">
                  Use cookies for enhanced tracking capabilities
                </p>
              </div>
              <button
                onClick={() => handleToggle('trackingCookies')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.trackingCookies ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.trackingCookies ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-gray-900">Consent Management</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Require consent for feedback
                </label>
                <p className="text-xs text-gray-500">
                  Ask candidates to consent before sending feedback
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireConsent')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.requireConsent ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireConsent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consent text
              </label>
              <textarea
                value={settings.consentText}
                onChange={(e) => setSettings(prev => ({ ...prev, consentText: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy policy URL
              </label>
              <input
                type="url"
                value={settings.privacyPolicyUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, privacyPolicyUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourcompany.com/privacy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
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