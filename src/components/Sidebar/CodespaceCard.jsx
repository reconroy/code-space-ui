import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaEllipsisV, 
  FaLock, 
  FaGlobe, 
  FaUsers, 
  FaPencilAlt, 
  FaArchive, 
  FaShareAlt, 
  FaTrash 
} from 'react-icons/fa';
import ManageCodespaceModal from './../../sub_components/ManageCodespaceModal';

const CodespaceCard = ({ codespace, isDefault, isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const isActive = location.pathname === `/${codespace.slug}`;
  const [menuPosition, setMenuPosition] = useState('right');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate menu position on mount and window resize
  useEffect(() => {
    const calculateMenuPosition = () => {
      if (menuButtonRef.current) {
        const buttonRect = menuButtonRef.current.getBoundingClientRect();
        const spaceOnRight = window.innerWidth - buttonRect.right;
        setMenuPosition(spaceOnRight < 200 ? 'bottom' : 'right');
      }
    };

    calculateMenuPosition();
    window.addEventListener('resize', calculateMenuPosition);
    return () => window.removeEventListener('resize', calculateMenuPosition);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCardStyle = () => {
    const baseStyle = `relative group flex items-center justify-between p-3 
                      rounded-lg cursor-pointer transition-all duration-200`;
    
    if (isDefault) {
      return `${baseStyle} bg-emerald-500 hover:bg-emerald-600`;
    }
    
    switch (codespace.access_type) {
      case 'private':
        return `${baseStyle} bg-rose-500 hover:bg-rose-600`;
      case 'public':
        return `${baseStyle} bg-rose-500 hover:bg-rose-600`;
      case 'shared':
        return `${baseStyle} bg-yellow-500 hover:bg-yellow-600`;
      default:
        return `${baseStyle} bg-rose-500 hover:bg-rose-600`;
    }
  };

  const getAccessIcon = (accessType) => {
    switch (accessType) {
      case 'private':
        return <FaLock className="text-red-500" />;
      case 'public':
        return <FaGlobe className="text-green-500" />;
      case 'shared':
        return <FaUsers className="text-blue-500" />;
      default:
        return <FaLock className="text-red-500" />;
    }
  };

  const menuItems = [
    { icon: FaPencilAlt, label: 'Rename', action: () => console.log('Rename') },
    { icon: FaArchive, label: 'Archive', action: () => console.log('Archive') },
    { icon: FaShareAlt, label: 'Share', action: () => console.log('Share') },
    { 
      icon: FaTrash, 
      label: 'Delete', 
      action: () => console.log('Delete'),
      className: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  const getIconContainerStyle = () => {
    if (isDarkMode) {
      return "bg-white/10";
    }
    return "bg-white";
  };

  return (
    <>
      <div className="relative">
        <div 
          className={getCardStyle()}
          onClick={() => navigate(`/${codespace.slug}`)}
        >
          {isActive && (
            <div className="absolute -left-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          )}
          
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md ${getIconContainerStyle()}`}>
              {getAccessIcon(codespace.access_type)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-medium truncate">
                {codespace.slug}
              </span>
              {isDefault && (
                <span className="text-xs text-white/80 truncate">
                  Default Workspace
                </span>
              )}
            </div>
          </div>
          
          <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
            <button 
              ref={menuButtonRef}
              className="text-white opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200 p-2 
                       hover:bg-white/10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                className={`
                  absolute shadow-lg bg-white dark:bg-gray-800 
                  rounded-md ring-1 ring-black ring-opacity-5 z-50
                  ${menuPosition === 'right' 
                    ? 'left-full ml-2 top-0' 
                    : 'top-full mt-2 right-0'
                  }
                  w-48 transform origin-top-right
                `}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      className={`
                        ${item.className || 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}
                        group flex items-center w-full px-4 py-2 text-sm
                        transition-colors duration-150
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                        setShowMenu(false);
                      }}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ManageCodespaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
        codespace={{
          ...codespace,
          language: codespace.language
        }}
      />
    </>
  );
};

export default CodespaceCard;
