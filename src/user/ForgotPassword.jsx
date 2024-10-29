import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import debounce from 'lodash/debounce';

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(null);
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

  const checkEmail = useCallback(
    debounce(async (email) => {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailExists(null);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/auth/check-email-exists/${email}`);
        setEmailExists(response.data.exists);
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailExists(null);
      }
    }, 300),
    []
  );

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkEmail(newEmail);
  };

  const handleSendOTP = async () => {
    try {
      setError('');
      
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!emailExists) {
        setError('Email not found in our records');
        return;
      }

      await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      setOtpSent(true);
      startResendCooldown();
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    if (resendEnabled) {
      handleSendOTP();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setError('');
      
      if (!otp) {
        setError('Please enter the OTP');
        return;
      }

      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { 
        email, 
        otp 
      });

      if (response.data.message === 'OTP verified successfully') {
        setOtpVerified(true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');

      if (!otpVerified) {
        setError('Please verify your email with OTP first');
        return;
      }

      if (!newPassword) {
        setError('Please enter a new password');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        newPassword
      });

      if (response.data.status === 'success') {
        alert('Password reset successful!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center mb-4">
          Reset Password
        </h2>

        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              disabled={otpVerified}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {email && /\S+@\S+\.\S+/.test(email) && (
              <div className="mt-1">
                {emailExists === false && (
                  <p className="text-red-600 text-sm">
                    This email is not registered. Please check your email or register.
                  </p>
                )}
                {emailExists === true && (
                  <p className="text-green-600 text-sm flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Email found
                  </p>
                )}
              </div>
            )}
          </div>

          {!otpVerified && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={!emailExists || otpSent}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${emailExists && !otpSent 
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                  : 'bg-gray-400 cursor-not-allowed'
                } transition-colors duration-200`}
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
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
                <label className="block text-sm font-medium">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter new password"
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
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
