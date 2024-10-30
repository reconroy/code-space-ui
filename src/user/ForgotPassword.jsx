import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import OTPInput from '../components/OTPInput';

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
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!email || !/\S+@\S+\.\S+/.test(email) || !emailExists) {
      setError('Please enter a valid registered email address');
      return;
    }

    setIsSendingOTP(true);
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      setOtpSent(true);
      setError('');
      startResendCooldown();
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
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
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
              <svg 
                className="h-16 w-16 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Password Reset Successful!
            </h2>
            
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your password has been successfully updated.
            </p>

            {/* Pro Tip */}
            <div className={`p-4 rounded-lg mb-8 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="flex items-center mb-2">
                <svg 
                  className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Pro Tip
                </span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                For better security, avoid using the same password across different websites. Consider using a password manager to keep track of unique, strong passwords.
              </p>
            </div>

            {/* Login Button */}
            <Link 
              to="/login"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
            >
              <svg 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          {!otpVerified && !otpSent && (
            <div>
              {email && emailExists && /\S+@\S+\.\S+/.test(email) ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isSendingOTP
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                >
                  {isSendingOTP ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Please enter a valid registered email address
                </p>
              )}
            </div>
          )}

          {otpSent && !otpVerified && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-4">
                Enter verification code
              </label>
              <div className="space-y-4">
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerifyOTP}
                  isDarkMode={isDarkMode}
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6}
                    className={`flex-1 mr-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${otp.length === 6
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                      } 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    Verify Code
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!resendEnabled}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${resendEnabled
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400'
                      } 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
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
                <label className="block text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Confirm your new password"
                    minLength="8"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
