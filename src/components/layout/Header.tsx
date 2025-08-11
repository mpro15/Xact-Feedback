import React, { useState, useRef } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to access user context
import { UserProfileModal } from '../profile/UserProfileModal'; // Correct the import path for UserProfileModal

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { notifications } = useNotification();
  const { user } = useAuth(); // Access user context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State to manage profile modal open/close
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <header className="neumorphic-header h-20 lg:border-l lg:border-shadow/20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden neumorphic-btn p-3"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="neumorphic-search hidden sm:flex items-center px-4 py-3 w-80">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="flex-1 bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 relative">
          <div
            className="relative"
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="neumorphic-btn p-3 relative"
              onClick={handleIconClick}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-full text-xs text-white flex items-center justify-center shadow-neumorphic-sm">
                {notifications.length}
              </span>
            </button>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50"
              >
                {notifications.length > 0 ? (
                  <ul className="space-y-2">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="p-2 border-b last:border-b-0 border-gray-200"
                      >
                        <h4 className="font-bold text-gray-800 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          {notification.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No notifications</p>
                )}
              </div>
            )}
          </div>

          {/* User Name and Icon */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleProfileClick}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-neumorphic-sm flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {user?.name || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <UserProfileModal isOpen={isProfileModalOpen} onClose={handleProfileClose} />
        </div>
      )}
    </header>
  );
};