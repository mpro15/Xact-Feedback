import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://your-supabase-url.supabase.co', 'your-supabase-anon-key');

const ProfileSection = () => {
  const [profileImage, setProfileImage] = useState(null);
  const userId = 'user-id'; // Replace with the actual user ID (e.g., from authentication)

  // Load the saved profile image from Supabase on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile image:', error);
        } else if (data && data.profile_image_url) {
          setProfileImage(data.profile_image_url);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile image:', err);
      }
    };

    fetchProfileImage();
  }, [userId]);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('File to upload:', file);

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
      console.error('File is too large');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      console.error('Unsupported file type');
      return;
    }

    try {
      const filePath = `${userId}/${file.name}`;
      console.log('File path:', filePath);

      const { data: uploadData, error: storageError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) {
        console.error('Error uploading image to storage:', storageError);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Save the image URL to the database
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, profile_image_url: publicUrlData.publicUrl }, { onConflict: 'user_id' });

      if (dbError) {
        console.error('Error saving image URL to database:', dbError);
        return;
      }

      // Update the profile image in the UI
      setProfileImage(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Unexpected error uploading profile image:', err);
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-image-container">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-image" />
        ) : (
          <div className="default-profile-icon">👤</div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="upload-input"
      />
    </div>
  );
};

export default ProfileSection;import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://your-supabase-url.supabase.co', 'your-supabase-anon-key');

const ProfileSection = () => {
  const [profileImage, setProfileImage] = useState(null);
  const userId = 'user-id'; // Replace with the actual user ID (e.g., from authentication)

  // Load the saved profile image from Supabase on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile image:', error);
        } else if (data && data.profile_image_url) {
          setProfileImage(data.profile_image_url);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile image:', err);
      }
    };

    fetchProfileImage();
  }, [userId]);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('File to upload:', file);

    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
      console.error('File is too large');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      console.error('Unsupported file type');
      return;
    }

    try {
      const filePath = `${userId}/${file.name}`;
      console.log('File path:', filePath);

      const { data: uploadData, error: storageError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) {
        console.error('Error uploading image to storage:', storageError);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Save the image URL to the database
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, profile_image_url: publicUrlData.publicUrl }, { onConflict: 'user_id' });

      if (dbError) {
        console.error('Error saving image URL to database:', dbError);
        return;
      }

      // Update the profile image in the UI
      setProfileImage(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Unexpected error uploading profile image:', err);
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-image-container">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-image" />
        ) : (
          <div className="default-profile-icon">👤</div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="upload-input"
      />
    </div>
  );
};

export default ProfileSection;