import React from 'react';
import useThemeStore from '../store/useThemeStore';

const Tooltip = ({ children, text, className = '' }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className={`absolute left-0 px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
        ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}
        hidden md:block`}
        style={{ top: '50%', transform: 'translateY(-50%) translateX(-100%)', marginLeft: '-0.5rem' }}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;