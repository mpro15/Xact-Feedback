import React, { useEffect, useState } from 'react';
import { Settings, Shield, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { BehaviorSettings } from '../../components/settings/BehaviorSettings';
import { PrivacySettings } from '../../components/settings/PrivacySettings';
import { APIConnectorSettings } from '../../components/settings/APIConnectorSettings';
import { BrandingEmailSettings } from '../../components/settings/BrandingEmailSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding-email');

  useEffect(() => {
    async function fetchCompany() {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      if (!user) return;
      const profileRes = await supabase.from('users').select('company_id').eq('id', user.id).single();
      const companyId = profileRes.data?.company_id;
      if (!companyId) return;
      const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
      if (data) {
        // Company data fetched, but not used in the component
      }
    }
    fetchCompany();
  }, []);

  const tabs = [
    { id: 'behavior', label: 'Behavior Controls', icon: Settings },
    { id: 'privacy', label: 'Privacy & Compliance', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'branding-email', label: 'Brand Preview', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'behavior':
        return <BehaviorSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'integrations':
        return <APIConnectorSettings />;
      case 'branding-email':
        return <BrandingEmailSettings />;
      default:
        return <BehaviorSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Configure your feedback platform preferences</p>
      </div>
      <div className="neumorphic-card">
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
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};