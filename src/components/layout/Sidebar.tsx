import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Users, BarChart3, Settings, MessageSquare, User, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileModal } from '../profile/UserProfileModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = React.useState(false);

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
              <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl shadow-neumorphic-sm flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Xact Feedback</span>
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

          {/* User Profile Section */}
          <div className="mt-auto border-t border-shadow/20 p-4">
            <div className="neumorphic-card p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-neumorphic-sm flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="w-full neumorphic-btn flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-700"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={logout}
                  className="w-full neumorphic-btn flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};