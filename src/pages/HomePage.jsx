import React, { useState } from 'react';
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

  const phrases = [
    "Welcome to CodeSpace ",
    "An AI code editor",
    "Share code safely", 
    "Collaborate in real-time",
    "Keep your code private",
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

  return (
    <div 
      className="home-page flex-grow flex flex-col items-center justify-center p-4 min-h-screen"
      style={{ backgroundImage: getPatternBackground(isDarkMode) }}
    >
      <div className="text-center w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl">
        <h1 className={`animated-heading ${isDarkMode ? 'text-white' : 'text-gray-800'} text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap overflow-hidden`}>
          {animatedText}
        </h1>
        <p className={`mt-4 mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm sm:text-base`}>
          Create a new codespace or use a slug in the URL to edit an existing one.
        </p>
        <button 
          onClick={() => createNewCodespace()}
          className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
        >
          Create New Codespace
        </button>

        {/* Join Codespace Section */}
        <div className="mt-6 w-full max-w-md mx-auto">
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Or join an existing codespace
          </p>
          <form onSubmit={handleJoinCodespace} className="flex flex-col gap-2">
            <div className="flex gap-2">
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
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="submit"
                disabled={!codespaceId.trim()}
                className={`${
                  !codespaceId.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out`}
              >
                Join
              </button>
            </div>
            {error && codespaceId.trim() && (
              <div className="mt-2 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                {error.includes('does not exist') && (
                  <button
                    onClick={() => createNewCodespace(codespaceId)}
                    className="text-blue-500 hover:text-blue-600 text-sm mt-1 transition-colors duration-300"
                  >
                    Create "{codespaceId}" as a public codespace?
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* New user section */}
        <div className="mt-12 text-center">
          <hr className={`my-8 w-1/2 mx-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;