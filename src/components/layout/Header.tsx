import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

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

        <div className="flex items-center space-x-4">
          <button className="neumorphic-btn p-3 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-full text-xs text-white flex items-center justify-center shadow-neumorphic-sm">
              3
            </span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-neumorphic-sm flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};