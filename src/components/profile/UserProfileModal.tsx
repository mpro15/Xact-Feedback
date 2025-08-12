import React, { useState, useEffect } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
    bio: user?.bio || '',
    timezone: user?.timezone || 'America/New_York',
    profile_image_url: user?.profile_image_url || '' // Updated to use empty string instead of null
  });

  // Fix for fetching profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/users?id=eq.${user?.id}&select=*`,
          {
            method: 'GET',
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error('Error fetching profile data:', response.statusText);
          return;
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setProfileData(data[0]);
        } else {
          console.warn('No profile data found for the user.');
        }
      } catch (err) {
        console.error('Unexpected error fetching profile data:', err);
      }
    };

    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  if (!isOpen) return null;

  const allowedRoles = ['HR Director', 'Recruiter', 'Manager', 'Employee']; // Add all valid roles here

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate profile data before sending
      if (!allowedRoles.includes(profileData.role)) {
        addNotification({
          type: 'error',
          title: 'Invalid Role',
          message: 'The selected role is not valid. Please choose a valid role.'
        });
        setIsLoading(false);
        return;
      }

      const validProfileData = {
        name: profileData.name || null,
        email: profileData.email || null,
        phone: profileData.phone || null,
        department: profileData.department || null,
        role: profileData.role || null, // Updated from jobTitle to role
        bio: profileData.bio || null,
        profile_image_url: profileData.profile_image_url || null,
      };

      // Log the payload for debugging
      console.log('Payload being sent to Supabase:', JSON.stringify(validProfileData, null, 2));

      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user?.id, // Ensure the user ID is included for upsert
          ...validProfileData,
        }, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update profile. Please try again.'
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.'
        });
        if (data && data.length > 0) {
          setProfileData(data[0]); // Update local state with the latest data from the database
        }
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error updating profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix for file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
      console.error('File is too large');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      console.error('Unsupported file type');
      return;
    }

    try {
      const filePath = `${user?.id}/${encodeURIComponent(file.name)}`; // Encode file name to handle special characters
      console.log('Uploading file to:', filePath);

      const { error: storageError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) {
        console.error('Storage error:', storageError.message || storageError);
        return;
      }

      const { data: publicUrlData, error: publicUrlError } = await supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (publicUrlError) {
        console.error('Error fetching public URL:', publicUrlError.message || publicUrlError);
        return;
      }

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Public URL data is invalid');
        return;
      }

      setProfileData((prev) => ({ ...prev, profile_image_url: publicUrlData.publicUrl }));

      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user?.id,
          profile_image_url: publicUrlData.publicUrl,
        }, { onConflict: 'id' });

      if (dbError) {
        console.error('Database error:', dbError.message || dbError);
        return;
      }

      addNotification({
        type: 'success',
        title: 'Image Uploaded',
        message: 'Your profile image has been updated successfully.'
      });
    } catch (err) {
      console.error('Unexpected error uploading profile image:', err);
    }
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profileData.profile_image_url ? (
                <img
                  src={profileData.profile_image_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-2xl">
                    {profileData.name.charAt(0)}
                  </span>
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
              <p className="text-gray-600">{profileData.role}</p>
              <p className="text-sm text-gray-500">{user?.companyName}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <select
                value={profileData.role}
                onChange={(e) => setProfileData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="" disabled>Select a role</option>
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={profileData.timezone}
                onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};