import React, { useEffect, useState } from 'react';
import { Palette, Settings, Shield, Zap, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { BrandingEmailSettings } from '../../components/settings/BrandingEmailSettings';
import { BehaviorSettings } from '../../components/settings/BehaviorSettings';
import { PrivacySettings } from '../../components/settings/PrivacySettings';
import { APIConnectorSettings } from '../../components/settings/APIConnectorSettings';
import { PreviewSettings } from '../../components/settings/PreviewSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding-email');
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    email_limit: 0,
    auto_send: false,
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
  });
  const [saving, setSaving] = useState(false);

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
        setCompany(data);
        setForm({
          name: data.name || '',
          logo_url: data.logo_url || '',
          email_limit: data.email_limit || 0,
          auto_send: !!data.auto_send,
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port ? String(data.smtp_port) : '',
          smtp_user: data.smtp_user || '',
          smtp_pass: data.smtp_pass || '',
          smtp_secure: !!data.smtp_secure,
        });
      }
    }
    fetchCompany();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    await supabase.from('companies').update({
      name: form.name,
      logo_url: form.logo_url,
      email_limit: form.email_limit,
      auto_send: form.auto_send,
      smtp_host: form.smtp_host,
      smtp_port: form.smtp_port ? parseInt(form.smtp_port) : null,
      smtp_user: form.smtp_user,
      smtp_pass: form.smtp_pass,
      smtp_secure: form.smtp_secure,
    }).eq('id', company.id);
    setSaving(false);
  };

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
          {/* Company Settings Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input name="logo_url" value={form.logo_url} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Limit</label>
              <input name="email_limit" type="number" value={form.email_limit} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="flex items-center">
              <input name="auto_send" type="checkbox" checked={form.auto_send} onChange={handleChange} className="mr-2" />
              <label className="text-sm font-medium text-gray-700">Auto-send Feedback</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input name="smtp_host" value={form.smtp_host} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input name="smtp_port" type="number" value={form.smtp_port} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
              <input name="smtp_user" value={form.smtp_user} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
              <input name="smtp_pass" type="password" value={form.smtp_pass} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="flex items-center">
              <input name="smtp_secure" type="checkbox" checked={form.smtp_secure} onChange={handleChange} className="mr-2" />
              <label className="text-sm font-medium text-gray-700">Use TLS/SSL</label>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
          </form>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};