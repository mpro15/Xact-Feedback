import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileModal } from '../../components/profile/UserProfileModal';

const UserProfilePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/dashboard'); // Redirect to dashboard or another page
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <UserProfileModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
};

export default UserProfilePage;
