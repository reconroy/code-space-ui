import React, { useState, useEffect, useRef } from 'react';
import useThemeStore from '../store/useThemeStore';
import { FaBell, FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Notification = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([
    // Sample notifications - replace with actual data fetching
    {
      id: 1,
      type: 'info',
      message: 'Welcome to CodeSpace! Start creating your first workspace.',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2, 
      type: 'success',
      message: 'Your code was successfully saved.',
      read: true,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date - new Date()) / (1000 * 60 * 60)),
      'hour'
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative z-10" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors duration-200 ${
          isDarkMode 
            ? 'hover:bg-gray-700 text-gray-300' 
            : 'hover:bg-gray-200 text-gray-600'
        }`}
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className={`p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-4 text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } ${!notification.read && (isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50/30')}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={`text-xs ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className={`text-xs ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-600 hover:text-gray-700'
                        }`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
