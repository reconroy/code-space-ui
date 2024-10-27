import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, isDarkMode }) => {
  return (
    <div className={`fixed top-0 left-0 h-full w-64 
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
        shadow-lg shadow-r-lg
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out z-50`}>
      <div className="p-5">
        <button 
          className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-600'} absolute top-4 right-4 focus:outline-none`}
          onClick={onClose}
        >
          <FaTimes className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-5">Menu</h2>
        <ul>
          <li className="mb-3">
            <a href="#" className={`${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>Home</a>
          </li>
          <li className="mb-3">
            <a href="#" className={`${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>Projects</a>
          </li>
          <li className="mb-3">
            <a href="#" className={`${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>Settings</a>
          </li>
          <li className="mb-3">
            <a href="#" className={`${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>Help</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;