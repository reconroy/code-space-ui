import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import CodespaceList from './Sidebar/CodespaceList';
import UserProfile from '../user/UserProfile';
import useCodespaceStore from '../store/useCodespaceStore';

const Sidebar = ({ isOpen, onClose, isDarkMode }) => {
  const { fetchUserCodespaces } = useCodespaceStore();

  useEffect(() => {
    if (isOpen && localStorage.getItem('token')) {
      fetchUserCodespaces();
    }
  }, [isOpen]);

  return (
    <div className={`fixed top-0 left-0 h-full w-64 
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
        shadow-lg shadow-r-lg flex flex-col
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out z-50`}>
      
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Your CodeSpaces</h2>
        <button 
          className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-600'} focus:outline-none`}
          onClick={onClose}
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <CodespaceList />
      </div>

      <div className="border-t dark:border-gray-700">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;