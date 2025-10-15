import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, LayoutDashboard, Users, BarChart3, Settings, MessageSquare, User, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileModal } from '../profile/UserProfileModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 neumorphic-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:flex lg:flex-col`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-shadow/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl shadow-neumorphic-sm flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/dashboard')}>Xact Feedback</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden neumorphic-btn p-2"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-8 px-4">
            <div className="space-y-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'neumorphic-tab-active shadow-neumorphic-inset text-white'
                        : 'neumorphic-tab text-gray-700 hover:text-primary-700'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

// Merged the top-right corner user profile button and the user button into a single component, ensuring dropdown and modal functionality are intact
const TopRightProfileSection: React.FC = () => {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 right-0 p-4 flex items-center space-x-4 z-50" style={{ overflow: 'visible' }}>
      <button
        className="neumorphic-btn flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-700"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <User className="w-4 h-4" />
        <span>User</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsProfileModalOpen(true)}
          >
            Profile
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      )}

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default TopRightProfileSection;
export { TopRightProfileSection };