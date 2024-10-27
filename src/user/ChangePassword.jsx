import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChangePassword = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/api/change-password`,
          {
            currentPassword,
            newPassword
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

      setSuccess('Password changed successfully');
      setError('');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Password change failed', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Password change failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
      <div className={`w-full max-w-md p-8 space-y-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-200'} rounded-lg shadow-lg`}>
        <h2 className="text-2xl font-bold text-center">Change Password</h2>
        
        {error && (
          <div className={`${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} border border-red-400 px-4 py-3 rounded relative`} role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className={`${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'} border border-green-400 px-4 py-3 rounded relative`} role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium">
              Current Password
            </label>
            <div className="mt-1 relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                className={`block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEye />:  <FaEyeSlash /> }
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              New Password
            </label>
            <div className="mt-1 relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                className={`block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEye />  :<FaEyeSlash /> }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDarkMode ? 'focus:ring-offset-gray-800' : ''}`}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
