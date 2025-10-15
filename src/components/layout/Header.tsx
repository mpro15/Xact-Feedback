import React, { useState, useRef } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { TopRightProfileSection } from './Sidebar'; // Import TopRightProfileSection
import { useFilters } from '../../contexts/FilterContext';
import { supabase } from '../../lib/supabaseClient';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { notifications } = useNotification();
  const { filters, updateCandidateFilters } = useFilters();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    updateCandidateFilters({ searchTerm });

    if (searchTerm.length > 2) {
      // Query the database using Supabase to fetch public data
      const { data, error } = await supabase
        .from('public_data')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data.map((item) => item.name));
      }
    } else {
      setSearchResults([]);
    }
  };

  React.useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isDropdownOpen]);

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

          <div className="neumorphic-search hidden sm:flex items-center px-4 py-3 w-80 relative">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search candidates, settings..."
              className="flex-1 bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
              value={filters.candidates.searchTerm}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-50">
                {searchResults.map((result, index) => (
                  <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
                    {result}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-10"> {/* Adjusted space-x to 10 for more spacing */}
          <div className="relative flex-shrink-0 w-12 h-12"> {/* Reduced area for notification button */}
            <button
              className="neumorphic-btn p-3 relative w-full h-full"
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

          <div className="flex items-center flex-shrink-0 w-12 h-12"> {/* User button area remains consistent */}
            <TopRightProfileSection />
          </div>
        </div>
      </div>
    </header>
  );
};