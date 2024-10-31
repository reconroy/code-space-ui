import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useThemeStore from '../store/useThemeStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useTypingEffect from '../animations/useTypingEffect';
import debounce from 'lodash/debounce';
import OTPInput from '../components/OTPInput';
import { getPatternBackground } from '../utils/backgroundPattern';

const API_URL = import.meta.env.VITE_API_URL;

const Registration = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const navigate = useNavigate();

  const phrases = [
    "Welcome to coding community!",
    "We're thrilled to have you join us!",
    "Register to get more from CodeSpace!",
    "Get ready for secure coding sessions!"
  ];

  const animatedText = useTypingEffect(phrases, 50, 50, 2000);
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

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        setError(''); // Clear any existing error
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/check-username/${username}`);
        setUsernameAvailable(response.data.available);
        if (!response.data.available) {
          setError(response.data.message);
        } else {
          setError(''); // Clear error when username is available
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
        setError('');
      }
    }, 300),
    []
  );

  const checkEmail = useCallback(
    debounce(async (email) => {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailAvailable(null);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/check-email/${email}`);
        setEmailAvailable(response.data.available);
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailAvailable(null);
      }
    }, 300),
    []
  );

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    checkUsername(newUsername);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkEmail(newEmail);
  };
  const handleSendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email) || !emailAvailable) {
      setError('Please enter a valid and available email address');
      return;
    }

    setIsSendingOTP(true);
    try {
      await axios.post(`${API_URL}/api/send-otp`, { email });
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
      const response = await axios.post(`${API_URL}/api/verify-otp`, { email, otp });
      console.log('Verification response:', response.data);
      setOtpVerified(true);
      setError('');
    } catch (error) {
      console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.message : 'Failed to verify OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !otpVerified) {
      setError('All fields are required and email must be verified');
      return;
    }

    if (!usernameAvailable || !emailAvailable) {
      setError('Username or email is not available');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/register`,
        {
          username,
          email,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Registration successful', response.data);

      // Store token and username
      localStorage.setItem('token', response.data.token);
      // localStorage.setItem('username', response.data.data.user.username);

      // Navigate directly to user's default codespace
      navigate(`/${username}`);
    } catch (error) {
      console.error('Registration failed', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailKeyPress = async (e) => {
    if (e.key === 'Enter' && !otpSent) {
      e.preventDefault(); // Prevent form submission
      if (username && 
          email && 
          usernameAvailable && 
          emailAvailable && 
          username.length >= 3 && 
          /\S+@\S+\.\S+/.test(email)) {
        await handleSendOTP();
      }
    }
  };

  return (
    <div 
      className={`flex items-center justify-center min-h-screen shadow-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
      style={{ backgroundImage: getPatternBackground(isDarkMode) }}
    >
      <div
        className={`w-full mb-24 max-w-md p-4 sm:p-8 space-y-4 mx-4 sm:mx-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-200'} rounded-lg transform transition-all duration-300 hover:scale-105`}
        style={{
          boxShadow: isDarkMode
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4), inset 0 -5px 10px -5px rgba(255, 255, 255, 0.1)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), inset 0 -5px 10px -5px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
          Create your account
        </h2>
        <div className="h-12 text-center text-base sm:text-lg font-medium mb-1 whitespace-nowrap overflow-hidden">
          {animatedText}
          <span className="animate-pulse animate-faster">|</span>
        </div>
        {error && (
          <div className={`${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} border border-red-400 px-4 py-3 rounded relative`} role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <div className="mt-1 relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                maxLength={30}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                pattern="^\S*$"
                className={`block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${otpSent ? 'opacity-75' : ''}`}
                value={username}
                onChange={(e) => {
                  // Remove any spaces from input
                  const noSpaces = e.target.value.replace(/\s/g, '');
                  handleUsernameChange({ ...e, target: { ...e.target, value: noSpaces } });
                }}
                disabled={otpSent}
              />
              {username.length > 2 && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {usernameAvailable === true && (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {usernameAvailable === false && (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {username.length > 2 && usernameAvailable === false && (
              <p className="mt-2 text-sm text-red-600">
                {error.includes('codespace')
                  ? "This username conflicts with an existing codespace. Please choose another."
                  : "This username is already taken."}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                autofill="off"
                pattern="^\S*$"
                className={`block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${otpSent ? 'opacity-75' : ''}`}
                value={email}
                onChange={(e) => {
                  const noSpaces = e.target.value.replace(/\s/g, '');
                  handleEmailChange({ ...e, target: { ...e.target, value: noSpaces } });
                }}
                onKeyPress={handleEmailKeyPress}
                disabled={otpSent}
              />
              {email && /\S+@\S+\.\S+/.test(email) && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {emailAvailable === true && (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {emailAvailable === false && (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            {email && /\S+@\S+\.\S+/.test(email) && emailAvailable === false && (
              <p className="mt-2 text-sm text-red-600">This email is already in use.</p>
            )}
            {otpVerified && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Email verified successfully
              </p>
            )}
          </div>
          {!otpVerified && !otpSent && (
            <div>
              {username &&
                email &&
                usernameAvailable &&
                emailAvailable &&
                username.length >= 3 &&
                /\S+@\S+\.\S+/.test(email) ? (
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
                  Please complete both username and email fields with valid values
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6}
                    className={`w-full sm:flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
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
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
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
                  autofill="off"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
          )}
          {otpVerified && password && (
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 hover:scale-105 relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
              >
                <span className="relative z-10">Sign Up</span>
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
          )}
        </form>
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;