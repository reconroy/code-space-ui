import React from 'react';
import { Link } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';

const AccessDenied = ({ owner }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg text-center`}>
        <div className="mb-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
            <svg
              className={`w-8 h-8 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V6m0 2h2M9 8h2m0 0h2"
              />
            </svg>
          </div>
        </div>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Access Denied
        </h2>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          This is a private CodeSpace belonging to{' '}
          <span className="font-semibold text-indigo-500">{owner}</span>
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return Home
          </Link>
          {!localStorage.getItem('token') && (
            <Link
              to="/login"
              className={`block w-full px-4 py-2 text-sm font-medium rounded-md 
                ${isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;