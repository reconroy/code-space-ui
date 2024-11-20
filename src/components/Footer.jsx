import React from 'react';
import useThemeStore from '../store/useThemeStore';

const Footer = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const appVersion = import.meta.env.VITE_APP_VERSION;

  return (
    <footer className={`${isDarkMode ? 'bg-gray-800 text-gray-300 border-t border-gray-700' : 'bg-gray-100 text-gray-600 border-t-2 border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]'} py-3 sm:py-4 absolute bottom-0 w-full transition-colors duration-300 z-10`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-row justify-between items-center">
          {/* Copyright text - Responsive text size and spacing */}
          <p className="text-xs sm:text-sm md:text-base">
            &copy; 2024 Codespaces | All rights reserved.
          </p>

          {/* Version tag */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-200 text-gray-600'
          } px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap`}>
            v{appVersion}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;        
  
{/* <nav className="order-2 w-full sm:w-auto">
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
          </nav> */}