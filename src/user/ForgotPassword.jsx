import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);

  const startResendCooldown = useCallback(() => {
    setResendEnabled(false);
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prevCooldown) => {
        if (prevCooldown <= 1) {
          clearInterval(timer);
          setResendEnabled(true);
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000);
  }, []);

  const handleSendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/send-otp`, { email });
      setOtpSent(true);
      setError('');
      startResendCooldown();
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    if (resendEnabled) {
      handleSendOTP();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/verify-otp`, { email, otp });
      setOtpVerified(true);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/reset-password`, {
        email,
        newPassword
      });
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
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
        <h2 className="text-2xl font-bold text-center mb-4">
          Reset Password
        </h2>

        {error && (
          <div className={`${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} border border-red-400 px-4 py-3 rounded relative`} role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpVerified}
            />
          </div>

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send OTP
            </button>
          )}

          {otpSent && !otpVerified && (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium">
                  OTP
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="otp"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!resendEnabled}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${resendEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  Resend OTP
                </button>
                {resendCooldown > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    Resend in {resendCooldown}s
                  </span>
                )}
              </div>
            </div>
          )}

          {otpVerified && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    autoFocus="off"
                    className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    autoFocus="off"
                    className={`mt-1 block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Password
              </button>
            </>
          )}
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
