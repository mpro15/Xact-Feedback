import React, { useState } from 'react';
import { Save, RefreshCw, CheckCircle, XCircle, Key, Globe } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const IntegrationSettings: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState({
    coursera: { enabled: true, apiKey: '', connected: true },
    udemy: { enabled: true, apiKey: '', connected: false },
    edx: { enabled: true, apiKey: '', connected: true },
    pluralsight: { enabled: false, apiKey: '', connected: false },
    linkedin: { enabled: true, apiKey: '', connected: false },
    freecodecamp: { enabled: true, apiKey: '', connected: true },
    codecademy: { enabled: false, apiKey: '', connected: false },
    upgrad: { enabled: true, apiKey: '', connected: true }
  });

  const platformInfo = {
    coursera: { name: 'Coursera', description: 'University courses and professional certificates', icon: '📚' },
    udemy: { name: 'Udemy', description: 'Practical skills and professional development', icon: '🎯' },
    edx: { name: 'edX', description: 'University-level courses from top institutions', icon: '🎓' },
    pluralsight: { name: 'Pluralsight', description: 'Technology and creative skills', icon: '💻' },
    linkedin: { name: 'LinkedIn Learning', description: 'Professional development and business skills', icon: '💼' },
    freecodecamp: { name: 'freeCodeCamp', description: 'Free coding bootcamp and tutorials', icon: '🔥' },
    codecademy: { name: 'Codecademy', description: 'Interactive coding lessons', icon: '⚡' },
    upgrad: { name: 'UpGrad', description: 'Higher education and professional upskilling', icon: '🚀' }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your integration settings have been updated successfully.'
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

  const handleToggle = (platform: string) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        enabled: !prev[platform as keyof typeof prev].enabled
      }
    }));
  };

  const handleApiKeyChange = (platform: string, apiKey: string) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        apiKey
      }
    }));
  };

  const handleTestConnection = async (platform: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform as keyof typeof prev],
          connected: true
        }
      }));
      addNotification({
        type: 'success',
        title: 'Connection Successful',
        message: `Successfully connected to ${platformInfo[platform as keyof typeof platformInfo].name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to connect to ${platformInfo[platform as keyof typeof platformInfo].name}`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Learning Platform Integrations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect with learning platforms to provide course recommendations
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(integrations).map(([platform, config]) => {
          const info = platformInfo[platform as keyof typeof platformInfo];
          return (
            <div key={platform} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {config.connected ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Disconnected</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleToggle(platform)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {config.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => handleApiKeyChange(platform, e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => handleTestConnection(platform)}
                      className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Integration Tips</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• API keys are encrypted and stored securely</li>
          <li>• Enabled platforms will be used for course recommendations</li>
          <li>• Test connections regularly to ensure proper functionality</li>
          <li>• Free platforms like freeCodeCamp don't require API keys</li>
        </ul>
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