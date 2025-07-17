import React, { useState } from 'react';
import { Upload, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

export const BrandingSettings: React.FC = () => {
  const { primaryColor, secondaryColor, logo, companyName, updateTheme } = useTheme();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryColor,
    secondaryColor,
    companyName,
    logo
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateTheme(formData);
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your branding settings have been updated successfully.'
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
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Company Branding</h3>
        <p className="text-sm text-gray-600 mt-1">
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
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Brand Preview</h4>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            {formData.logo && (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="font-medium" style={{ color: formData.primaryColor }}>
              {formData.companyName}
            </span>
          </div>
          <div className="space-y-2">
            <div
              className="w-full h-2 rounded"
              style={{ backgroundColor: formData.primaryColor }}
            />
            <div
              className="w-3/4 h-2 rounded"
              style={{ backgroundColor: formData.secondaryColor }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Reset to Default
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