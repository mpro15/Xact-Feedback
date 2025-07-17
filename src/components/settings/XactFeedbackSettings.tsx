import React, { useState } from 'react';
import { Upload, Save, RefreshCw, Palette, Mail, FileText, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

export const XactFeedbackSettings: React.FC = () => {
  const { primaryColor, secondaryColor, logo, companyName, updateTheme } = useTheme();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('branding');

  const [settings, setSettings] = useState({
    // Branding
    companyName,
    logo,
    primaryColor,
    secondaryColor,
    
    // Email Template
    senderName: 'HR Team',
    senderEmail: 'hr@company.com',
    emailSubject: 'Thank you for your application - {candidate_name}',
    emailBody: 'Dear {candidate_name},\n\nThank you for your interest in the {position} position at {company_name}...',
    
    // PDF Control
    resumeFixUrl: 'https://resume-builder.com',
    learningUrl: 'https://learning-platform.com',
    reapplyUrl: 'https://company.com/careers',
    footerMessage: 'Keep growing, keep learning! 🚀',
    
    // Behavior Toggles
    autoSendFeedback: true,
    allowPaidCourses: true,
    enableReapplyButton: true,
    dailyEmailCap: 100
  });

  const sections = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'email', label: 'Email Template', icon: Mail },
    { id: 'pdf', label: 'PDF Control', icon: FileText },
    { id: 'behavior', label: 'Behavior Toggles', icon: SettingsIcon }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update theme with branding changes
      updateTheme({
        companyName: settings.companyName,
        logo: settings.logo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      });
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your Xact Feedback settings have been updated successfully.'
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const renderBrandingSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Company Branding</h4>
        <p className="text-sm text-gray-600 mb-6">
          Customize your company's visual identity for feedback emails and PDFs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Company Logo"
                className="w-16 h-16 object-contain border border-shadow rounded-lg shadow-neumorphic-sm"
              />
            )}
            <label className="neumorphic-btn flex items-center space-x-2 px-4 py-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Logo</span>
              <input
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="w-12 h-10 rounded-lg border border-shadow shadow-neumorphic-sm"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="neumorphic-input flex-1"
              placeholder="#A8D5BA"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              className="w-12 h-10 rounded-lg border border-shadow shadow-neumorphic-sm"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
              className="neumorphic-input flex-1"
              placeholder="#059669"
            />
          </div>
        </div>
      </div>

      <div className="neumorphic-card p-4 bg-background-light">
        <h5 className="font-medium text-gray-900 mb-3">Brand Preview</h5>
        <div className="neumorphic-card p-4 bg-white">
          <div className="flex items-center space-x-3 mb-3">
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="font-medium" style={{ color: settings.primaryColor }}>
              {settings.companyName}
            </span>
          </div>
          <div className="space-y-2">
            <div
              className="w-full h-2 rounded-full shadow-neumorphic-sm"
              style={{ backgroundColor: settings.primaryColor }}
            />
            <div
              className="w-3/4 h-2 rounded-full shadow-neumorphic-sm"
              style={{ backgroundColor: settings.secondaryColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Email Template</h4>
        <p className="text-sm text-gray-600 mb-6">
          Configure the default email template for feedback messages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sender Name
          </label>
          <input
            type="text"
            value={settings.senderName}
            onChange={(e) => setSettings(prev => ({ ...prev, senderName: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="HR Team"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sender Email
          </label>
          <input
            type="email"
            value={settings.senderEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="hr@company.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Subject
        </label>
        <input
          type="text"
          value={settings.emailSubject}
          onChange={(e) => setSettings(prev => ({ ...prev, emailSubject: e.target.value }))}
          className="neumorphic-input w-full"
          placeholder="Thank you for your application - {candidate_name}"
        />
        <p className="text-xs text-gray-500 mt-1">
          Available variables: {'{candidate_name}, {position}, {company_name}'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Email Body
        </label>
        <textarea
          value={settings.emailBody}
          onChange={(e) => setSettings(prev => ({ ...prev, emailBody: e.target.value }))}
          rows={6}
          className="neumorphic-input w-full"
          placeholder="Dear {candidate_name},&#10;&#10;Thank you for your interest in the {position} position at {company_name}..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be the default template. You can customize it per email.
        </p>
      </div>
    </div>
  );

  const renderPDFSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">PDF Control</h4>
        <p className="text-sm text-gray-600 mb-6">
          Customize the interactive buttons and links in your PDF reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            "Fix Resume" Button URL
          </label>
          <input
            type="url"
            value={settings.resumeFixUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, resumeFixUrl: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="https://resume-builder.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            "Start Learning" Button URL
          </label>
          <input
            type="url"
            value={settings.learningUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, learningUrl: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="https://learning-platform.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            "Re-Apply Later" Button URL
          </label>
          <input
            type="url"
            value={settings.reapplyUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, reapplyUrl: e.target.value }))}
            className="neumorphic-input w-full"
            placeholder="https://company.com/careers"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PDF Footer Message
        </label>
        <input
          type="text"
          value={settings.footerMessage}
          onChange={(e) => setSettings(prev => ({ ...prev, footerMessage: e.target.value }))}
          className="neumorphic-input w-full"
          placeholder="Keep growing, keep learning! 🚀"
        />
        <p className="text-xs text-gray-500 mt-1">
          This message will appear at the bottom of every PDF report
        </p>
      </div>

      <div className="neumorphic-card p-4 bg-primary-50">
        <h5 className="font-medium text-primary-900 mb-3">PDF Button Preview</h5>
        <div className="flex flex-wrap gap-3">
          <button 
            className="neumorphic-btn-primary px-4 py-2 text-sm"
            style={{ backgroundColor: settings.primaryColor }}
          >
            🔧 Fix Resume
          </button>
          <button 
            className="neumorphic-btn-primary px-4 py-2 text-sm"
            style={{ backgroundColor: settings.primaryColor }}
          >
            📚 Start Learning
          </button>
          <button 
            className="neumorphic-btn-primary px-4 py-2 text-sm"
            style={{ backgroundColor: settings.primaryColor }}
          >
            🔄 Re-Apply Later
          </button>
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Behavior Toggles</h4>
        <p className="text-sm text-gray-600 mb-6">
          Control how the feedback system behaves and operates
        </p>
      </div>

      <div className="space-y-6">
        <div className="neumorphic-card p-4">
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
              onClick={() => handleToggle('autoSendFeedback')}
              className={`neumorphic-toggle w-12 h-6 ${
                settings.autoSendFeedback ? 'neumorphic-toggle-active' : ''
              }`}
            >
              <div className={`neumorphic-toggle-thumb w-5 h-5 ${
                settings.autoSendFeedback ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="neumorphic-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Allow paid course suggestions
              </label>
              <p className="text-xs text-gray-500">
                Include both free and paid learning resources in recommendations
              </p>
            </div>
            <button
              onClick={() => handleToggle('allowPaidCourses')}
              className={`neumorphic-toggle w-12 h-6 ${
                settings.allowPaidCourses ? 'neumorphic-toggle-active' : ''
              }`}
            >
              <div className={`neumorphic-toggle-thumb w-5 h-5 ${
                settings.allowPaidCourses ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="neumorphic-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable "Re-Apply Later" CTA
              </label>
              <p className="text-xs text-gray-500">
                Include a button for candidates to re-apply in the future
              </p>
            </div>
            <button
              onClick={() => handleToggle('enableReapplyButton')}
              className={`neumorphic-toggle w-12 h-6 ${
                settings.enableReapplyButton ? 'neumorphic-toggle-active' : ''
              }`}
            >
              <div className={`neumorphic-toggle-thumb w-5 h-5 ${
                settings.enableReapplyButton ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="neumorphic-card p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily email cap
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={settings.dailyEmailCap}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyEmailCap: parseInt(e.target.value) }))}
                min="10"
                max="10000"
                className="neumorphic-input w-32"
              />
              <span className="text-sm text-gray-600">emails per day</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Start with 100 emails/day and increase gradually to avoid spam filters
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'branding':
        return renderBrandingSection();
      case 'email':
        return renderEmailSection();
      case 'pdf':
        return renderPDFSection();
      case 'behavior':
        return renderBehaviorSection();
      default:
        return renderBrandingSection();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Xact Feedback Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Customize your feedback system branding, templates, and behavior
        </p>
      </div>

      {/* Section Navigation */}
      <div className="neumorphic-card p-2">
        <nav className="flex space-x-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                activeSection === section.id
                  ? 'neumorphic-tab-active text-white shadow-neumorphic-inset'
                  : 'neumorphic-tab text-gray-700 hover:text-primary-700'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="neumorphic-card p-6">
        {renderSectionContent()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="neumorphic-btn-primary px-6 py-3 flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};