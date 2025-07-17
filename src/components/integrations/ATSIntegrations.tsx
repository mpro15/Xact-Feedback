import React, { useState } from 'react';
import { CheckCircle, XCircle, Settings, RefreshCw, Key } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const ATSIntegrations: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState([
    {
      id: 'workday',
      name: 'Workday',
      description: 'Enterprise HR and recruitment platform',
      icon: '🏢',
      connected: true,
      apiKey: '••••••••••••••••',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/workday',
      lastSync: '2024-01-15 10:30 AM'
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      description: 'Hiring and recruitment optimization platform',
      icon: '🌱',
      connected: false,
      apiKey: '',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/greenhouse',
      lastSync: 'Never'
    },
    {
      id: 'icims',
      name: 'iCIMS',
      description: 'Talent cloud recruitment platform',
      icon: '☁️',
      connected: true,
      apiKey: '••••••••••••••••',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/icims',
      lastSync: '2024-01-15 09:15 AM'
    },
    {
      id: 'lever',
      name: 'Lever',
      description: 'Modern recruiting and talent management',
      icon: '⚡',
      connected: false,
      apiKey: '',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/lever',
      lastSync: 'Never'
    },
    {
      id: 'bamboohr',
      name: 'BambooHR',
      description: 'HR platform for small and medium businesses',
      icon: '🎋',
      connected: true,
      apiKey: '••••••••••••••••',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/bamboohr',
      lastSync: '2024-01-15 08:45 AM'
    },
    {
      id: 'smartrecruiters',
      name: 'SmartRecruiters',
      description: 'Talent acquisition platform',
      icon: '🧠',
      connected: false,
      apiKey: '',
      webhookUrl: 'https://api.xactfeedback.com/webhooks/smartrecruiters',
      lastSync: 'Never'
    }
  ]);

  const handleConnect = async (integrationId: string) => {
    setIsLoading(integrationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, connected: true, lastSync: new Date().toLocaleString() }
            : integration
        )
      );
      
      addNotification({
        type: 'success',
        title: 'Integration Connected',
        message: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to the integration. Please try again.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, connected: false, lastSync: 'Never' }
          : integration
      )
    );
    
    addNotification({
      type: 'info',
      title: 'Integration Disconnected',
      message: `Disconnected from ${integrations.find(i => i.id === integrationId)?.name}`
    });
  };

  const handleSync = async (integrationId: string) => {
    setIsLoading(integrationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, lastSync: new Date().toLocaleString() }
            : integration
        )
      );
      
      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: `Successfully synced with ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync with the integration. Please try again.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">ATS System Integrations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect with your Applicant Tracking System to automatically trigger feedback emails
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.connected ? (
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
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={integration.apiKey}
                    readOnly={integration.connected}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={integration.webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(integration.webhookUrl)}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-500">
                  Last sync: {integration.lastSync}
                </div>
                <div className="flex items-center space-x-2">
                  {integration.connected ? (
                    <>
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={isLoading === integration.id}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {isLoading === integration.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Sync Now'
                        )}
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isLoading === integration.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading === integration.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Integration Setup Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Generate an API key from your ATS system's developer settings</li>
          <li>2. Enter the API key in the corresponding field above</li>
          <li>3. Add the webhook URL to your ATS system's rejection workflow</li>
          <li>4. Test the connection to ensure proper data flow</li>
        </ol>
      </div>
    </div>
  );
};