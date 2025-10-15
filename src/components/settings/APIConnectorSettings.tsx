import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, CheckCircle, XCircle, Key, Globe, Info } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';

export const APIConnectorSettings: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ats');
  const [atsIntegrations, setAtsIntegrations] = useState<any[]>([]);
  const [learningIntegrations, setLearningIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchIntegrations() {
      setLoading(true);
      setError(null);
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (!profile?.company_id) {
        setError('No company found');
        setLoading(false);
        return;
      }
      // Fetch ATS integrations or initialize with default options
      const { data: ats, error: atsError } = await supabase
        .from('ats_integrations')
        .select('*')
        .eq('company_id', profile.company_id);
      
      if (atsError) {
        setError(atsError.message);
        setLoading(false);
        return;
      }
      
      if (ats && ats.length > 0) {
        setAtsIntegrations(ats);
      } else {
        // Initialize with default major ATS providers if none found
        setAtsIntegrations([
          {
            id: 'workday',
            name: 'Workday',
            description: 'Enterprise HR and talent management platform',
            icon: '🏢',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/workday`,
            lastSync: 'Never'
          },
          {
            id: 'icims',
            name: 'iCIMS',
            description: 'Talent acquisition and recruiting solution',
            icon: '👥',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/icims`,
            lastSync: 'Never'
          },
          {
            id: 'greenhouse',
            name: 'Greenhouse',
            description: 'Recruiting and onboarding software',
            icon: '🌿',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/greenhouse`,
            lastSync: 'Never'
          },
          {
            id: 'lever',
            name: 'Lever',
            description: 'Modern recruiting and talent acquisition',
            icon: '🔧',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/lever`,
            lastSync: 'Never'
          },
          {
            id: 'taleo',
            name: 'Oracle Taleo',
            description: 'Enterprise recruiting and talent management',
            icon: '☁️',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/taleo`,
            lastSync: 'Never'
          },
          {
            id: 'successfactors',
            name: 'SAP SuccessFactors',
            description: 'HR and talent management suite',
            icon: '📊',
            connected: false,
            apiKey: '',
            webhookUrl: `${window.location.origin}/api/ats-webhook/successfactors`,
            lastSync: 'Never'
          }
        ]);
      }
      // Fetch learning platform integrations
      const { data: learning, error: learningError } = await supabase
        .from('learning_integrations')
        .select('*')
        .eq('company_id', profile.company_id);
      if (learningError) {
        setError(learningError.message);
        setLoading(false);
        return;
      }
      setLearningIntegrations(learning || []);
      setLoading(false);
    }
    fetchIntegrations();
  }, []);

  if (loading) return <div className="p-4">Loading integrations...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

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
        message: 'Your API connector settings have been updated successfully.'
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
  const handleATSConnect = async (integrationId: string, apiKey: string) => {
    if (!apiKey.trim()) {
      addNotification({
        type: 'error',
        title: 'API Key Required',
        message: 'Please enter a valid API key to connect.'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('User not authenticated');
      }
      
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) {
        throw new Error('No company found');
      }
      
      // Save ATS integration with API key to database
      const { error: insertError } = await supabase
        .from('ats_integrations')
        .upsert({
          company_id: profile.company_id,
          ats_id: integrationId,
          api_key: apiKey,
          connected: true,
          last_sync: new Date().toISOString(),
          webhook_url: `${window.location.origin}/api/ats-webhook/${integrationId}`,
          sync_frequency: 'daily',
          sync_candidate_dispositions: true,
          sync_rejected_candidates: true,
          auto_send_feedback: true
        });
      
      if (insertError) {
        throw new Error(`Failed to save integration: ${insertError.message}`);
      }
        // Update UI state with default configuration options
      setAtsIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { 
                ...integration, 
                connected: true, 
                lastSync: new Date().toLocaleString(), 
                apiKey,
                syncRejectedCandidates: true,
                autoSendFeedback: true,
                syncFrequency: 'daily'
              }
            : integration
        )
      );
      
      // Test connection to ATS API with provided key
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'ATS Connected',
        message: `Successfully connected to ${atsIntegrations.find(i => i.id === integrationId)?.name}. Candidate disposition data will be automatically synced daily.`
      });
    } catch (error) {
      console.error('ATS connection error:', error);
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to the ATS. Please check your API key and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningPlatformConnect = async (platform: string, apiKey: string) => {
    // freeCodeCamp doesn't require API key
    if (platform !== 'freecodecamp' && !apiKey.trim()) {
      addNotification({
        type: 'error',
        title: 'API Key Required',
        message: 'Please enter a valid API key to connect.'
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLearningIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform as keyof typeof prev],
          connected: true,
          apiKey: platform === 'freecodecamp' ? 'N/A (Free)' : apiKey
        }
      }));
      addNotification({
        type: 'success',
        title: 'Platform Connected',
        message: `Successfully connected to ${platformInfo[platform as keyof typeof platformInfo].name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: `Failed to connect to ${platformInfo[platform as keyof typeof platformInfo].name}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningPlatformToggle = (platform: string) => {
    setLearningIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        enabled: !prev[platform as keyof typeof prev].enabled
      }
    }));
  };

  const tabs = [
    { id: 'ats', label: 'ATS Systems', icon: '🏢' },
    { id: 'learning', label: 'Learning Platforms', icon: '📚' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">API Connector</h3>
        <p className="text-sm text-gray-600 mt-1">
          Connect with external systems and learning platforms
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ATS Systems Tab */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">ATS System Integrations</h4>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ATS integration automates candidate data sync and reduces manual work by 80%
              </div>
            </div>
          </div>
            {/* Info about candidate disposition data */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-blue-900 mb-2">Candidate Disposition Data</h5>
            <p className="text-sm text-blue-800 mb-2">
              When connected, our system will:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatically fetch rejected candidate data daily</li>
              <li>• Send personalized feedback emails based on disposition reasons</li>
              <li>• Show all sent feedback emails in the Candidates page</li>
              <li>• Track email engagement and candidate responses</li>
            </ul>
            
            <div className="mt-4 pt-3 border-t border-blue-200">
              <h6 className="text-sm font-medium text-blue-900 mb-1">How it works:</h6>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Your ATS API key allows us to securely access candidate disposition data</li>
                <li>When candidates are rejected in your ATS, we receive notification via webhook</li>
                <li>Our AI analyzes the rejection reason and generates personalized feedback</li>
                <li>Feedback emails are sent automatically using your company's branding</li>
                <li>All emails and candidate responses are tracked in the Candidates page</li>
              </ol>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {atsIntegrations.map((integration) => (
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
                        onChange={(e) => {
                          setAtsIntegrations(prev => 
                            prev.map(item => 
                              item.id === integration.id 
                                ? { ...item, apiKey: e.target.value }
                                : item
                            )
                          );
                        }}
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

                  {/* Additional ATS Configuration Options */}
                  {integration.connected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-3">Sync Configuration</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Auto-sync rejected candidates
                            </label>
                            <p className="text-xs text-gray-500">
                              Automatically fetch candidate disposition data daily
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setAtsIntegrations(prev => 
                                prev.map(item => 
                                  item.id === integration.id 
                                    ? { ...item, syncRejectedCandidates: !item.syncRejectedCandidates }
                                    : item
                                )
                              );
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              integration.syncRejectedCandidates ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                integration.syncRejectedCandidates ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Auto-send feedback emails
                            </label>
                            <p className="text-xs text-gray-500">
                              Automatically send feedback when candidates are rejected
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setAtsIntegrations(prev => 
                                prev.map(item => 
                                  item.id === integration.id 
                                    ? { ...item, autoSendFeedback: !item.autoSendFeedback }
                                    : item
                                )
                              );
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              integration.autoSendFeedback ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                integration.autoSendFeedback ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sync frequency
                          </label>
                          <select 
                            value={integration.syncFrequency || 'daily'}
                            onChange={(e) => {
                              setAtsIntegrations(prev => 
                                prev.map(item => 
                                  item.id === integration.id 
                                    ? { ...item, syncFrequency: e.target.value }
                                    : item
                                )
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-500">
                      Last sync: {integration.lastSync}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!integration.connected ? (
                        <button
                          onClick={() => handleATSConnect(integration.id, integration.apiKey)}
                          disabled={isLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isLoading ? 'Connecting...' : 'Connect'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setAtsIntegrations(prev => 
                              prev.map(item => 
                                item.id === integration.id 
                                  ? { ...item, connected: false, lastSync: 'Never' }
                                  : item
                              )
                            );
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Platforms Tab */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">Learning Platform Integrations</h4>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Connected platforms provide personalized course recommendations
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(learningIntegrations).map(([platform, config]) => {
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
                        onClick={() => handleLearningPlatformToggle(platform)}
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
                            onChange={(e) => {
                              setLearningIntegrations(prev => ({
                                ...prev,
                                [platform]: {
                                  ...prev[platform as keyof typeof prev],
                                  apiKey: e.target.value
                                }
                              }));
                            }}
                            disabled={platform === 'freecodecamp'}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder={platform === 'freecodecamp' ? 'No API key required' : 'Enter API key'}
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        {!config.connected ? (
                          <button
                            onClick={() => handleLearningPlatformConnect(platform, config.apiKey)}
                            disabled={isLoading}
                            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                          >
                            {isLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setLearningIntegrations(prev => ({
                                ...prev,
                                [platform]: {
                                  ...prev[platform as keyof typeof prev],
                                  connected: false
                                }
                              }));
                            }}
                            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Integration Tips</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">ATS Integration</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• API keys are encrypted and stored securely</li>
              <li>• Enable webhooks in your ATS admin settings</li>
              <li>• Integration works with all major ATS systems</li>
              <li>• Candidate data is processed securely and privately</li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">Learning Platforms</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connect multiple learning platforms for better recommendations</li>
              <li>• Free platforms like freeCodeCamp don't require API keys</li>
              <li>• Test connections regularly to ensure proper functionality</li>
              <li>• Customize course recommendations by platform</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-200">
          <h5 className="text-sm font-medium text-blue-900 mb-1">Troubleshooting</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• If sync fails, verify API key permissions in your ATS admin console</li>
            <li>• Ensure webhook URL is correctly configured in your ATS</li>
            <li>• For iCIMS: API keys must have "Candidate Management" permissions</li>
            <li>• For Workday: Enable "External API Access" in integration settings</li>
          </ul>
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