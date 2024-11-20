import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import axios from 'axios';

const logoutMessages = [
  {
    emoji: '😢',
    title: 'Leaving so soon?',
    message: "We'll miss having you around in the CodeSpace! Remember, your work will be safely waiting for your return.",
    confirmButton: 'Take a Break',
    cancelButton: 'Stay a Bit Longer',
    tip: 'You can always come back and continue where you left off! 🚀'
  },
  {
    emoji: '👋',
    title: 'Time to say goodbye?',
    message: "Your amazing code contributions made our day brighter! Hope to see you back coding with us soon.",
    confirmButton: 'Catch You Later',
    cancelButton: 'One More Commit',
    tip: 'Remember to star your favorite CodeSpaces before leaving! ⭐'
  },
  {
    emoji: '🌙',
    title: 'Calling it a day?',
    message: "Great coding session! Sometimes taking a break helps solve the trickiest bugs.",
    confirmButton: 'Time to Recharge',
    cancelButton: 'Just Getting Started',
    tip: 'Your code will be right here waiting for your next breakthrough! 💡'
  },
  {
    emoji: '🎯',
    title: 'Mission accomplished?',
    message: "You've done some fantastic work today! Ready to take a well-deserved break?",
    confirmButton: 'Save & Exit',
    cancelButton: 'Keep Coding',
    tip: 'Don\'t forget to celebrate your coding victories! 🎉'
  },
  {
    emoji: '🌟',
    title: 'Taking off?',
    message: "Your code is safely saved in the cloud. Time to rest those coding fingers?",
    confirmButton: 'Time to Float Away',
    cancelButton: 'Not Just Yet',
    tip: 'Great developers know when to take breaks! 🧘‍♂️'
  }
];

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const selectedMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * logoutMessages.length);
    return logoutMessages[randomIndex];
  }, [isOpen]); // Regenerate only when modal opens

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token); // Debug log
  
      if (!token) {
        console.log('No token found in localStorage');
        navigate('/');
        onClose();
        return;
      }
  
      // Make sure the API call is happening
      const response = await axios.post('/api/auth/logout', {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Logout response:', response.data); // Debug log
  
      if (response.data.status === 'success') {
        localStorage.removeItem('token');
        navigate('/');
        onClose();
      } else {
        console.error('Logout failed:', response.data);
      }
    } catch (error) {
      console.error('Logout error:', error.response?.data || error);
      // Still logout locally if API fails
      localStorage.removeItem('token');
      navigate('/');
      onClose();
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={`relative px-8 py-6 rounded-lg shadow-xl w-96 transform transition-all ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <div className="text-5xl mb-4">{selectedMessage.emoji}</div>
          <h3 className="text-2xl font-semibold mb-2">{selectedMessage.title}</h3>
          <p className={`mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {selectedMessage.message}
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-3 rounded-md transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {selectedMessage.confirmButton}
              {/* (Logout) */}
            </button>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-md transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {selectedMessage.cancelButton}
            </button>
          </div>

          <div className={`mt-4 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Pro tip: {selectedMessage.tip}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;


