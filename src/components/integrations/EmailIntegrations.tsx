import React, { useState } from 'react';
import { CheckCircle, XCircle, Mail, RefreshCw, Key } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const EmailIntegrations: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState([
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Email delivery service for reliable messaging',
      icon: '📧',
      connected: true,
      apiKey: '••••••••••••••••',
      config: {
        fromEmail: 'hr@company.com',
        fromName: 'HR Team',
        dailyLimit: 10000,
        currentUsage: 2847
      },
      stats: {
        sent: 15420,
        delivered: 15234,
        opened: 10267,
        clicked: 3456
      }
    },
    {
      id: 'mailgun',
      name: 'Mailgun',
      description: 'Email API service for developers',
      icon: '🔫',
      connected: false,
      apiKey: '',
      config: {
        fromEmail: '',
        fromName: '',
        dailyLimit: 0,
        currentUsage: 0
      },
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0
      }
    },
    {
      id: 'amazonses',
      name: 'Amazon SES',
      description: 'Scalable email service from AWS',
      icon: '📮',
      connected: false,
      apiKey: '',
      config: {
        fromEmail: '',
        fromName: '',
        dailyLimit: 0,
        currentUsage: 0
      },
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0
      }
    },
    {
      id: 'postmark',
      name: 'Postmark',
      description: 'Fast and reliable transactional email',
      icon: '📬',
      connected: false,
      apiKey: '',
      config: {
        fromEmail: '',
        fromName: '',
        dailyLimit: 0,
        currentUsage: 0
      },
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0
      }
    }
  ]);

  const handleConnect = async (integrationId: string) => {
    setIsLoading(integrationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { 
                ...integration, 
                connected: true,
                config: {
                  ...integration.config,
                  fromEmail: 'hr@company.com',
                  fromName: 'HR Team',
                  dailyLimit: 10000
                }
              }
            : integration
        )
      );
      
      addNotification({
        type: 'success',
        title: 'Email Service Connected',
        message: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to the email service. Please try again.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              connected: false,
              config: {
                fromEmail: '',
                fromName: '',
                dailyLimit: 0,
                currentUsage: 0
              }
            }
          : integration
      )
    );
    
    addNotification({
      type: 'info',
      title: 'Email Service Disconnected',
      message: `Disconnected from ${integrations.find(i => i.id === integrationId)?.name}`
    });
  };

  const handleTest = async (integrationId: string) => {
    setIsLoading(integrationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Test Email Sent',
        message: `Test email sent successfully via ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to send test email. Please check your configuration.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email Service Integrations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect with email delivery services to ensure reliable feedback email delivery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {integration.connected && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Email Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sent:</span>
                    <span className="font-medium text-gray-900 ml-2">{integration.stats.sent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivered:</span>
                    <span className="font-medium text-gray-900 ml-2">{integration.stats.delivered.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Opened:</span>
                    <span className="font-medium text-gray-900 ml-2">{integration.stats.opened.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Clicked:</span>
                    <span className="font-medium text-gray-900 ml-2">{integration.stats.clicked.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

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

              {integration.connected && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={integration.config.fromEmail}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={integration.config.fromName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {integration.connected && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">Daily Usage</span>
                    <span className="text-blue-900 font-medium">
                      {integration.config.currentUsage} / {integration.config.dailyLimit}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(integration.config.currentUsage / integration.config.dailyLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={isLoading === integration.id}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {isLoading === integration.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Send Test'
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
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Email Service Recommendations</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• SendGrid offers excellent deliverability and detailed analytics</li>
          <li>• Mailgun provides developer-friendly APIs and powerful automation</li>
          <li>• Amazon SES is cost-effective for high-volume email sending</li>
          <li>• Postmark excels in transactional email speed and reliability</li>
        </ul>
      </div>
    </div>
  );
};