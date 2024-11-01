import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import useAuthStore from './../store/useAuthStore';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <span className="ml-3 font-medium truncate">
          {user.username}
        </span>
      </div>
      
      <button 
        onClick={() => navigate('/settings')}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                   transition-colors duration-200"
        title="Settings"
      >
        <FaCog className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserProfile;