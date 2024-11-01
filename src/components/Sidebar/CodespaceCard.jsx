import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEllipsisV } from 'react-icons/fa';

const CodespaceCard = ({ codespace }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/${codespace.slug}`;

  const getCardStyle = () => {
    const baseStyle = "relative group flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer transition-all duration-200";
    const activeStyle = isActive ? "ring-2 ring-white ring-opacity-50 transform scale-[1.02]" : "";
    
    switch (codespace.access_type) {
      case 'default':
        return `${baseStyle} ${activeStyle} bg-blue-600 hover:bg-blue-700`;
      case 'private':
        return `${baseStyle} ${activeStyle} bg-green-600 hover:bg-green-700`;
      case 'public':
        return `${baseStyle} ${activeStyle} bg-red-500 hover:bg-red-600`;
      case 'shared':
        return `${baseStyle} ${activeStyle} bg-yellow-500 hover:bg-yellow-600`;
      default:
        return `${baseStyle} ${activeStyle} bg-gray-600 hover:bg-gray-700`;
    }
  };

  return (
    <div 
      className={getCardStyle()}
      onClick={() => navigate(`/${codespace.slug}`)}
    >
      {isActive && (
        <div className="absolute -left-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      )}
      
      <span className="text-white font-medium truncate max-w-[180px]">
        {codespace.slug}
      </span>
      
      <button 
        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Implement menu options
        }}
      >
        <FaEllipsisV />
      </button>
    </div>
  );
};

export default CodespaceCard;
