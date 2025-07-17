import React, { useState } from 'react';
import { Palette, Settings, Shield, Zap, Eye } from 'lucide-react';
import { BrandingEmailSettings } from '../../components/settings/BrandingEmailSettings';
import { BehaviorSettings } from '../../components/settings/BehaviorSettings';
import { PrivacySettings } from '../../components/settings/PrivacySettings';
import { APIConnectorSettings } from '../../components/settings/APIConnectorSettings';
import { PreviewSettings } from '../../components/settings/PreviewSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding-email');

  const tabs = [
    { id: 'branding-email', label: 'Branding & Email', icon: Palette },
    { id: 'behavior', label: 'Behavior Controls', icon: Settings },
    { id: 'privacy', label: 'Privacy & Compliance', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'preview', label: 'Preview & Test', icon: Eye }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding-email':
        return <BrandingEmailSettings />;
      case 'behavior':
        return <BehaviorSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'integrations':
        return <APIConnectorSettings />;
      case 'preview':
        return <PreviewSettings />;
      default:
        return <BrandingEmailSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Configure your feedback platform preferences</p>
      </div>

      <div className="neumorphic-card">
        {/* Tabs */}
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

        {/* Content */}
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};