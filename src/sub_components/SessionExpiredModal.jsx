import React from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import { FaExclamationTriangle } from 'react-icons/fa';

const SessionExpiredModal = () => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
      <div className={`
        w-full max-w-md p-6 rounded-lg shadow-xl
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      `}>
        <div className="flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-yellow-500 text-3xl" />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4">
          Session Expired
        </h2>

        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your session has expired for security reasons. Please log in again to continue.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors duration-200"
          >
            Re-login
          </button>
          
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-2 rounded-lg border transition-colors duration-200
              ${isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700' 
                : 'border-gray-300 hover:bg-gray-100'}`}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
