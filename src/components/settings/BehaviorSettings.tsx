import React, { useState } from 'react';
import { Save, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const BehaviorSettings: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    autoSendOnRejection: true,
    includePaidCourses: false,
    enableReApplicationLink: true,
    feedbackTone: 'supportive',
    requireApproval: false,
    batchSending: true,
    sendDelay: 24,
    dailyEmailLimit: 100,
    maxCourseSuggestions: 5,
    personalizedGreeting: true,
    includeCompanyBranding: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update company settings in Supabase
      const { error } = await supabase
        .from('companies')
        .update({
          settings: {
            email: {
              auto_send: settings.autoSendOnRejection,
              include_paid_courses: settings.includePaidCourses,
              enable_reapplication: settings.enableReApplicationLink,
              feedback_tone: settings.feedbackTone,
              require_approval: settings.requireApproval,
              batch_sending: settings.batchSending,
              send_delay: settings.sendDelay
            }
          },
          daily_email_limit: settings.dailyEmailLimit
        })
        .eq('id', 'current-company-id'); // This would be the actual company ID in production
      
      if (error) throw error;
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your behavior settings have been updated successfully.'
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
        <h3 className="text-lg font-medium text-gray-900">Behavior Controls</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure how the feedback system behaves and operates
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto-Send Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Automation Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto-send feedback on rejection
                </label>
                <p className="text-xs text-gray-500">
                  Automatically send feedback emails when candidates are rejected
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoSendOnRejection')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.autoSendOnRejection ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSendOnRejection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Require approval before sending
                </label>
                <p className="text-xs text-gray-500">
                  All feedback emails need approval before being sent
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireApproval')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.requireApproval ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send delay (hours)
                <div className="group relative inline-block ml-1">
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    24-48 hours delay improves candidate perception
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={settings.sendDelay}
                onChange={(e) => handleNumberChange('sendDelay', parseInt(e.target.value))}
                min="0"
                max="168"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wait time before sending feedback emails (0 = immediate)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily email limit
                <div className="group relative inline-block ml-1">
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Start with 100 emails/day, increase gradually to avoid spam filters
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={settings.dailyEmailLimit}
                onChange={(e) => handleNumberChange('dailyEmailLimit', parseInt(e.target.value))}
                min="10"
                max="10000"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum emails to send per day (recommended: 100-500)
              </p>
              {settings.dailyEmailLimit > 500 && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <p className="text-xs text-yellow-600">
                    High volume may trigger spam filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Content Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback tone
                <div className="group relative inline-block ml-1">
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Supportive tone increases candidate satisfaction by 35%
                  </div>
                </div>
              </label>
              <select
                value={settings.feedbackTone}
                onChange={(e) => handleSelectChange('feedbackTone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="supportive">Supportive</option>
                <option value="encouraging">Encouraging</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum course suggestions
                <div className="group relative inline-block ml-1">
                  <Info className="w-3 h-3 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    3-5 courses provide optimal engagement without overwhelming
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={settings.maxCourseSuggestions}
                onChange={(e) => handleNumberChange('maxCourseSuggestions', parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of courses to recommend per candidate
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Include paid courses
                  <div className="group relative inline-block ml-1">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Mix of free and paid courses increases completion rates
                    </div>
                  </div>
                </label>
                <p className="text-xs text-gray-500">
                  Recommend both free and paid learning resources
                </p>
              </div>
              <button
                onClick={() => handleToggle('includePaidCourses')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.includePaidCourses ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.includePaidCourses ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable re-application link
                </label>
                <p className="text-xs text-gray-500">
                  Include a link for candidates to re-apply in the future
                </p>
              </div>
              <button
                onClick={() => handleToggle('enableReApplicationLink')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.enableReApplicationLink ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableReApplicationLink ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Personalization Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Personalization</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Personalized greeting
                </label>
                <p className="text-xs text-gray-500">
                  Use candidate's name in email greeting
                </p>
              </div>
              <button
                onClick={() => handleToggle('personalizedGreeting')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.personalizedGreeting ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.personalizedGreeting ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Include company branding
                </label>
                <p className="text-xs text-gray-500">
                  Apply company colors and logo to emails and PDFs
                </p>
              </div>
              <button
                onClick={() => handleToggle('includeCompanyBranding')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.includeCompanyBranding ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.includeCompanyBranding ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Batch sending
                </label>
                <p className="text-xs text-gray-500">
                  Send multiple feedback emails at once
                </p>
              </div>
              <button
                onClick={() => handleToggle('batchSending')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.batchSending ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.batchSending ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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