import React from 'react';
import useThemeStore from '../store/useThemeStore';

const Footer = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const appVersion = import.meta.env.VITE_APP_VERSION;

  return (
    <footer className={`${isDarkMode ? 'bg-gray-800 text-gray-300 border-t border-gray-700' : 'bg-gray-100 text-gray-600 border-t-2 border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]'} py-3 sm:py-4 absolute bottom-0 w-full transition-colors duration-300 z-50`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col items-center space-y-3 sm:space-y-0 sm:flex-row sm:justify-between">
          {/* Copyright text - Responsive text size and spacing */}
          <p className="text-xs sm:text-sm md:text-base text-center sm:text-left order-1 sm:order-1">
            &copy; 2024 CUPL | All rights reserved.
          </p>

          {/* Links - Enhanced spacing and touch targets */}
          <nav className="order-2 w-full sm:w-auto">
            <ul className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base">
              <li>
                <a 
                  href="#" 
                  className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} 
                    transition-colors duration-300 py-1 px-2 rounded hover:bg-opacity-10 hover:bg-blue-500`}
                >
                  Terms
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} 
                    transition-colors duration-300 py-1 px-2 rounded hover:bg-opacity-10 hover:bg-blue-500`}
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} 
                    transition-colors duration-300 py-1 px-2 rounded hover:bg-opacity-10 hover:bg-blue-500`}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          
          {/* Version tag - Improved positioning and responsive sizing */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-200 text-gray-600'
          } px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium order-3 sm:order-2 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 whitespace-nowrap`}>
            v{appVersion}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;