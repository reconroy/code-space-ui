import React from 'react';
import { FaClock } from 'react-icons/fa';
import useThemeStore from '../store/useThemeStore';

const SessionCountdown = ({ timeLeft, onContinue }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-[999]">
      <div className={`
        rounded-lg shadow-lg p-4 max-w-sm w-full
        ${isDarkMode 
          ? 'bg-gray-800 text-white border border-gray-700' 
          : 'bg-white text-gray-800 border border-gray-200'}
      `}>
        <div className="flex items-center space-x-2">
          <FaClock className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <span className="font-medium">Session Expiring Soon</span>
        </div>
        
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your session will expire in <span className="font-medium">{formatTime(timeLeft)}</span>
        </p>
        
        <button
          onClick={onContinue}
          className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-500 text-white 
                   hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
        >
          Continue Session
        </button>
      </div>
    </div>
  );
};

export default SessionCountdown;
