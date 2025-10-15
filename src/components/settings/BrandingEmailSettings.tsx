import React, { useState, useEffect } from 'react';
import { Upload, Save, RefreshCw, TestTube, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';
import { EmailTemplatePreview } from './EmailTemplatePreview';

export const BrandingEmailSettings: React.FC = () => {
  const { primaryColor, secondaryColor, logo, companyName, updateTheme } = useTheme();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    primaryColor,
    secondaryColor,
    companyName,
    logo,
    senderName: 'HR Team',
    senderEmail: 'hr@company.com',
    replyToEmail: 'no-reply@company.com',
    subjectTemplate: 'Thank you for your application - {candidate_name}',
    emailSignature: 'Best regards,\\nHR Team\\nYour Company',
    unsubscribeText: 'If you no longer wish to receive these emails, you can unsubscribe here.'
  });
  
  // Fetch company settings on component mount
  useEffect(() => {
    async function fetchCompanySettings() {
      try {
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
          
        if (profileError || !profile) {
          console.error('Failed to get user profile', profileError);
          return;
        }
        
        setCompanyId(profile.company_id);
        
        // Fetch company data
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
          
        if (companyError || !company) {
          console.error('Failed to fetch company data', companyError);
          return;
        }
        
        // Get email settings from company
        const emailSettings = company.settings?.email || {};
        
        // Update theme context with company branding
        updateTheme({
          primaryColor: company.primary_color || '#2563EB',
          secondaryColor: company.secondary_color || '#059669',
          companyName: company.name || 'Xact Feedback',
          logo: company.logo_url || null
        });
        
        // Update form data with company settings
        setFormData({
          primaryColor: company.primary_color || '#2563EB',
          secondaryColor: company.secondary_color || '#059669',
          companyName: company.name || 'Xact Feedback',
          logo: company.logo_url || null,
          senderName: emailSettings.sender_name || 'HR Team',
          senderEmail: emailSettings.sender_email || `hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          replyToEmail: emailSettings.reply_to_email || `no-reply@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          subjectTemplate: emailSettings.subject_template || 'Thank you for your application - {candidate_name}',
          emailSignature: emailSettings.email_signature || 'Best regards,\\nHR Team\\n' + company.name,
          unsubscribeText: emailSettings.unsubscribe_text || 'If you no longer wish to receive these emails, you can unsubscribe here.'
        });
      } catch (error) {
        console.error('Error fetching company settings:', error);
      }
    }
    
    fetchCompanySettings();
  }, [updateTheme]);
  const handleSave = async () => {
    if (!companyId) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Company information not found.'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Update theme context first for immediate UI feedback
      updateTheme({
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        companyName: formData.companyName,
        logo: formData.logo
      });
      
      // Prepare the email settings object
      const emailSettings = {
        sender_name: formData.senderName,
        sender_email: formData.senderEmail,
        reply_to_email: formData.replyToEmail,
        subject_template: formData.subjectTemplate,
        email_signature: formData.emailSignature,
        unsubscribe_text: formData.unsubscribeText
      };
      
      // Get current company data first
      const { data: currentCompany } = await supabase
        .from('companies')
        .select('settings')
        .eq('id', companyId)
        .single();
      
      // Merge existing settings with new email settings
      const mergedSettings = {
        ...(currentCompany?.settings || {}),
        email: emailSettings
      };
      
      // Update company record in database
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.companyName,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          logo_url: formData.logo,
          settings: mergedSettings
        })
        .eq('id', companyId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your branding and email settings have been updated successfully.'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
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
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleTestEmail = async () => {
    if (!companyId) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Company information not found.'
      });
      return;
    }
    
    if (!formData.senderEmail) {
      addNotification({
        type: 'warning',
        title: 'Email Not Set',
        message: 'Please set a sender email address first.'
      });
      return;
    }

    setSendingTestEmail(true);
    setTestEmailSent(false);
    
    try {
      // Generate test email content
      const testEmailContent = {
        to_email: formData.senderEmail,
        to_name: formData.senderName,
        subject: 'Test Feedback Email Template',
        company_id: companyId,
        company_name: formData.companyName,
        company_logo: formData.logo,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        sender_name: formData.senderName,
        sender_email: formData.senderEmail,
        reply_to_email: formData.replyToEmail,
        email_signature: formData.emailSignature,
        unsubscribe_text: formData.unsubscribeText,
        template_type: 'test',
        candidate_data: {
          name: "Test Candidate",
          position: "Software Developer",
          rejection_stage: "Technical Interview",
          highlights: [
            "Strong communication skills",
            "Good problem-solving approach",
            "Consider gaining more experience with cloud technologies",
            "Further development of system design skills recommended"
          ]
        }
      };
      
      // Send test email using Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: testEmailContent
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setTestEmailSent(true);      addNotification({
        type: 'success',
        title: 'Test Email Sent',
        message: `A test email has been sent to ${formData.senderEmail}. Please check your inbox. When integrated with your ATS, emails will be automatically sent to rejected candidates.`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to send test email. Please try again.'
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Branding Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Company Branding</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Consistent branding increases email open rates by 23%
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Customize your company's visual identity for feedback emails and PDFs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border border-gray-300 rounded"
                />
              )}
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
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
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#2563EB"
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
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#059669"
              />
            </div>
          </div>
        </div>        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Feedback Email Template Preview</h4>
          <p className="text-sm text-gray-600 mb-4">
            This is how your feedback email will appear to candidates. All settings are reflected in this preview.
          </p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <EmailTemplatePreview
              logo={formData.logo}
              companyName={formData.companyName}
              primaryColor={formData.primaryColor}
              secondaryColor={formData.secondaryColor}
              senderName={formData.senderName}
              senderEmail={formData.senderEmail}
              replyToEmail={formData.replyToEmail}
              subjectTemplate={formData.subjectTemplate}
              emailSignature={formData.emailSignature}
              unsubscribeText={formData.unsubscribeText}
            />
          </div>
        </div>
      </div>

      {/* Email Configuration Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Email Configuration</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Professional email setup improves deliverability by 40%
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Configure how feedback emails are sent to candidates
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Name
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Email
            </label>
            <input
              type="email"
              value={formData.senderEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reply-To Email
            </label>
            <input
              type="email"
              value={formData.replyToEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, replyToEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="no-reply@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Template
            </label>
            <input
              type="text"
              value={formData.subjectTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectTemplate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Subject line for feedback emails"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Signature
            </label>
            <textarea
              value={formData.emailSignature}
              onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Best regards,&#10;HR Team&#10;Your Company"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unsubscribe Text
            </label>
            <input
              type="text"
              value={formData.unsubscribeText}
              onChange={(e) => setFormData(prev => ({ ...prev, unsubscribeText: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unsubscribe instructions"
            />
          </div>
        </div>
      </div>      {/* Test Email Result Message */}
      {testEmailSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-700">Test email sent!</p>
            <p className="text-sm text-green-600">
              A test email has been sent to {formData.senderEmail}. Please check your inbox to verify how it looks.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleTestEmail}
          disabled={sendingTestEmail}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingTestEmail ? (
            <>
              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 inline mr-2" />
              Send Test Email
            </>
          )}
        </button>
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