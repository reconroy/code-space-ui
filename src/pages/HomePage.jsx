import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useTypingEffect from './../animations/useTypingEffect';
import useThemeStore from '.././store/useThemeStore';
import '../styles/HomePage.css';
import { getPatternBackground } from '../utils/backgroundPattern';

const HomePage = () => {
  const navigate = useNavigate();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [codespaceId, setCodespaceId] = useState('');
  const [error, setError] = useState('');
  const [userCount, setUserCount] = useState(0);

  const phrases = [
    "Welcome to CodeSpace ",
    "An AI code editor",
    "Share code safely", 
    "Collaborate in real-time",
    "Keep your code private",
    `${userCount}+ users on CodeSpace!`,
    "Enjoy the simplicity",
    "Focus on coding !",
  ];

  const typingSpeed = 50;
  const deletingSpeed = 50;
  const pauseDuration = 3000;

  const animatedText = useTypingEffect(phrases, typingSpeed, deletingSpeed, pauseDuration);

  const createNewCodespace = async (customSlug = null) => {
    const newSlug = customSlug || Math.random().toString(36).substr(2, 9);
    try {
      await axios.post('/api/codespace', { 
        slug: newSlug,
        isPublic: true
      });
      navigate(`/${newSlug}`);
    } catch (error) {
      console.error('Failed to create new codespace:', error);
      setError('Failed to create codespace. Please try again.');
    }
  };

  const handleJoinCodespace = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!codespaceId.trim()) {
      return;
    }
  
    if (codespaceId.length > 16) {
      setError('Codespace ID cannot be longer than 16 characters');
      return;
    }
  
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/codespace/${codespaceId}`);
      
      // Check if the response indicates a successful codespace fetch
      if (response.data.status === 'success' && response.data.data) {
        navigate(`/${codespaceId}`);
      } else if (response.data.status === 'error') {
        setError('This codespace does not exist. Would you like to create it?');
      }
    } catch (err) {
      console.error('Error checking codespace:', err);
      if (err.response?.status === 404) {
        setError('This codespace does not exist. Would you like to create it?');
      } else if (err.response?.status === 403) {
        const ownerName = err.response.data.owner || 'another user';
        setError(`You do not have access to this codespace. This codespace is already owned by ${ownerName}.`);
      } else {
        setError('This codespace does not exist. Would you like to create it?');
      }
    }
  };

  // Function to round number to nearest multiple of 5
  const roundToNearest5 = (num) => {
    return Math.floor(num / 5) * 5 || 5; // Return at least 5
  };

  // Fetch user count on component mount
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/count`);
        const count = response.data.count;
        setUserCount(roundToNearest5(count));
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        setUserCount(5); // Fallback to 5 if fetch fails
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div 
      className="home-page flex-grow flex flex-col items-center justify-center p-4 min-h-screen -mt-16"
      style={{ backgroundImage: getPatternBackground(isDarkMode) }}
    >
      <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl px-4">
        <h1 className={`animated-heading ${isDarkMode ? 'text-white' : 'text-gray-800'} text-xl sm:text-2xl md:text-4xl lg:text-5xl whitespace-nowrap overflow-hidden`}>
          {animatedText}
        </h1>
        <p className={`mt-4 mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'} text-xs sm:text-sm md:text-base`}>
          Create a new codespace or use a slug in the URL to edit an existing one.
        </p>
        <button 
          onClick={() => createNewCodespace()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-xs sm:text-sm md:text-base"
        >
          Create New Codespace
        </button>

        {/* Join Codespace Section */}
        <div className="mt-6 w-full max-w-md mx-auto">
          <p className={`text-xs sm:text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Or join an existing codespace
          </p>
          <form onSubmit={handleJoinCodespace} className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={codespaceId}
                onChange={(e) => {
                  setCodespaceId(e.target.value);
                  if (!e.target.value.trim()) {
                    setError('');
                  }
                }}
                placeholder="Enter Codespace Name"
                maxLength={16}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="submit"
                disabled={!codespaceId.trim()}
                className={`
                  relative overflow-hidden w-full sm:w-auto
                  ${!codespaceId.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  }
                  text-white font-bold py-2 px-4 sm:px-6 rounded-lg
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-lg
                  active:scale-95
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-blue-500 before:to-purple-500
                  before:opacity-0 before:transition-opacity before:duration-300
                  hover:before:opacity-100
                  text-sm
                `}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <span className="mr-1">Join</span>
                  <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
            {error && codespaceId.trim() && (
              <div className="mt-2 text-center">
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
                {error.includes('does not exist') && (
                  <button
                    onClick={() => createNewCodespace(codespaceId)}
                    className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm mt-1 transition-colors duration-300"
                  >
                    Create "{codespaceId}" as a public codespace?
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* New user section */}
        <div className="mt-8 sm:mt-12 text-center mb-24">
          <hr className={`my-6 sm:my-8 w-full sm:w-1/2 mx-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
          <div className="flex flex-row justify-center gap-4 sm:gap-6">
            <Link 
              to="/login" 
              className={`group relative overflow-hidden px-6 sm:px-8 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600 before:to-blue-700 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="transform group-hover:scale-110 transition-transform duration-300">Login</span>
              </span>
            </Link>
            <Link 
              to="/register" 
              className={`group relative overflow-hidden px-6 sm:px-8 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-600 before:to-green-700 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="transform group-hover:scale-110 transition-transform duration-300">Sign Up</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;