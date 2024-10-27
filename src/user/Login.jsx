import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); // Redirect to dashboard after successful login
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
      console.error('Login error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
      <div 
        className={`w-full max-w-md p-8 space-y-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-200'} rounded-lg transform transition-all duration-300 hover:scale-105`}
        style={{ 
          boxShadow: isDarkMode 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4), inset 0 -5px 10px -5px rgba(255, 255, 255, 0.1)' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), inset 0 -5px 10px -5px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-10px)'
        }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          Login
        </h2>
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <FaEye /> :<FaEyeSlash /> }
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 hover:scale-105 relative overflow-hidden"
              style={{ 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              <span className="relative z-10">Sign In</span>
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(45deg, rgba(66, 153, 225, 0.5), rgba(129, 140, 248, 0.5))',
                  filter: 'blur(4px)',
                  zIndex: 0
                }}
              ></div>
            </button>
          </div>
        </form>
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm">
            New user?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </p>
          <p className="text-sm">
            Forgot password?{' '}
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Reset here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
