import React, { useState } from 'react';
import { Plus, CheckCircle, XCircle, Settings, Zap } from 'lucide-react';
import { ATSIntegrations } from '../../components/integrations/ATSIntegrations';
import { EmailIntegrations } from '../../components/integrations/EmailIntegrations';
import { WebhookIntegrations } from '../../components/integrations/WebhookIntegrations';

export const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ats');

  const tabs = [
    { id: 'ats', label: 'ATS Systems', icon: Settings },
    { id: 'email', label: 'Email Services', icon: Zap },
    { id: 'webhooks', label: 'Webhooks', icon: Plus }
  ];

  const integrationStats = [
    { title: 'Active Integrations', value: '5', color: 'text-green-600' },
    { title: 'Available Integrations', value: '12', color: 'text-blue-600' },
    { title: 'Failed Connections', value: '1', color: 'text-red-600' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ats':
        return <ATSIntegrations />;
      case 'email':
        return <EmailIntegrations />;
      case 'webhooks':
        return <WebhookIntegrations />;
      default:
        return <ATSIntegrations />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect with external systems to streamline your workflow</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrationStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {stat.title === 'Active Integrations' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {stat.title === 'Available Integrations' && <Settings className="w-6 h-6 text-blue-600" />}
                {stat.title === 'Failed Connections' && <XCircle className="w-6 h-6 text-red-600" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};