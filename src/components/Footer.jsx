import React from 'react';
import useThemeStore from '../store/useThemeStore';

const Footer = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <footer className={`${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} py-4 absolute bottom-0 w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="mb-2 md:mb-0">&copy; 2024 CUPL | All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} transition-colors duration-300`}>Terms of Service</a>
            <a href="#" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} transition-colors duration-300`}>Privacy Policy</a>
            <a href="#" className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} transition-colors duration-300`}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;