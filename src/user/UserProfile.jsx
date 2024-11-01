import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const UserProfile = () => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const { user, isLoading, fetchUserData } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [fetchUserData]);

  const handleSettingsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/settings');
  };

  return (
    <div className={`p-4 flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex items-center min-w-0">
        <div className={`w-10 h-10 rounded-full 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} 
          flex items-center justify-center flex-shrink-0`}
        >
          {isLoading ? (
            <div className="animate-pulse w-6 h-6 bg-gray-500 rounded-full" />
          ) : (
            user?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <span className="ml-3 font-medium truncate">
          {isLoading ? (
            <div className="animate-pulse w-24 h-4 bg-gray-500 rounded" />
          ) : (
            user?.username || 'Not logged in'
          )}
        </span>
      </div>
      
      <button 
        onClick={handleSettingsClick}
        className={`p-2 rounded-full 
          ${isDarkMode 
            ? 'hover:bg-gray-700 text-gray-300' 
            : 'hover:bg-gray-200 text-gray-600'} 
          transition-colors duration-200 flex-shrink-0 ml-2`}
        title="Settings"
      >
        <FaCog className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserProfile;