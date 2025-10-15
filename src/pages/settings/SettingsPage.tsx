import React, { useEffect, useState } from 'react';
import { Settings, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { BehaviorSettings } from '../../components/settings/BehaviorSettings';
// Privacy settings removed as requested
import { APIConnectorSettings } from '../../components/settings/APIConnectorSettings';
import { BrandingEmailSettings } from '../../components/settings/BrandingEmailSettings';

export const SettingsPage: React.FC = () => {  const [activeTab, setActiveTab] = useState('branding-email');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      try {
        setLoading(true);
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          console.error('User not authenticated');
          return;
        }
        
        // Get user's company ID
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (profileError || !profile?.company_id) {
          console.error('Failed to get user profile or company ID');
          return;
        }
          // Fetch company data
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
          
        if (companyError || !company) {
          console.error('Failed to fetch company data');
          return;
        }
        
        // Company data loaded successfully
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, []);  const tabs = [
    { id: 'behavior', label: 'Behavior Controls', icon: Settings },
    // Privacy & Compliance tab disabled per request
    // { id: 'privacy', label: 'Privacy & Compliance', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'branding-email', label: 'Email & Branding', icon: Settings }
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case 'behavior':
        return <BehaviorSettings />;
      // Privacy tab disabled, redirecting to behavior if somehow selected
      case 'privacy':
        setActiveTab('behavior'); // Redirect to behavior tab if privacy is somehow selected
        return <BehaviorSettings />;
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
      
      {loading ? (
        <div className="neumorphic-card p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-gray-600">Loading company settings...</p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};