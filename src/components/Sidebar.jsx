import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import CodespaceList from './Sidebar/CodespaceList';
import UserProfile from '../user/UserProfile';
import useCodespaceStore from '../store/useCodespaceStore';

const Sidebar = ({ isOpen, onClose, isDarkMode }) => {
  const { fetchUserCodespaces } = useCodespaceStore();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isOpen && localStorage.getItem('token')) {
      fetchUserCodespaces();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full 
          w-64 sm:w-72 md:w-80 lg:w-96  // Responsive widths for different screen sizes
          ${isDarkMode 
            ? 'bg-gray-800 text-white border-r border-gray-700' 
            : 'bg-gray-100 text-gray-800 border-r border-gray-200'} 
          shadow-lg flex flex-col
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-all duration-300 ease-in-out z-50`}
      >
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
          flex justify-between items-center`}
        >
          <h2 className="text-xl font-bold">Your CodeSpaces</h2>
          <button 
            className={`${isDarkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-500 hover:text-gray-600'} 
              focus:outline-none`}
            onClick={onClose}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <CodespaceList />
        </div>

        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <UserProfile />
        </div>
      </div>
    </>
  );
};

export default Sidebar;