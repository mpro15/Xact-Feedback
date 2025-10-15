import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileModal } from '../../components/profile/UserProfileModal';

// Ensure the UserProfilePage is correctly set up for navigation
const UserProfilePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/dashboard'); // Redirect to dashboard or another page
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <UserProfileModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
};

export default UserProfilePage;
