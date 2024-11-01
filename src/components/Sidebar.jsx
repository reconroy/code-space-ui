import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import CodespaceList from './Sidebar/CodespaceList';
import UserProfile from '../user/UserProfile';
import useCodespaceStore from '../store/useCodespaceStore';
import useThemeStore from '../store/useThemeStore';

const Sidebar = ({ isOpen, onClose }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const { fetchUserCodespaces } = useCodespaceStore();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isOpen && localStorage.getItem('token')) {
      fetchUserCodespaces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay with higher z-index */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={onClose}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Sidebar with highest z-index */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full 
          w-64 sm:w-72 md:w-80 lg:w-96
          ${isDarkMode 
            ? 'bg-gray-800 text-white border-r border-gray-700' 
            : 'bg-gray-100 text-gray-800 border-r border-gray-200'} 
          shadow-lg flex flex-col
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-all duration-300 ease-in-out z-[999]`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className={`flex-shrink-0 p-4 border-b 
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex justify-between items-center">
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <CodespaceList />
        </div>

        {/* User Profile - Fixed at bottom */}
        <div className={`flex-shrink-0 border-t 
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
          bg-inherit`}
        >
          <UserProfile />
        </div>
      </div>
    </>
  );
};

export default Sidebar;