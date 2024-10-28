import React from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';

const UnauthorizedModal = ({ isOpen }) => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  if (!isOpen) return null;

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className={`relative px-8 py-6 rounded-lg shadow-xl w-96 transform transition-all
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-2xl font-semibold mb-2">Authorization Required</h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Oops! It seems your session has expired or you've been logged out. Please log in again to continue coding.
          </p>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleBackToHome}
              className={`w-full px-4 py-3 rounded-md transition-colors duration-200 
                ${isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
            >
              Back to Home
            </button>
          </div>

          <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Pro tip: Stay logged in to enjoy all CodeSpace features! 💻
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedModal;