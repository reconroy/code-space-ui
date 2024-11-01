import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to parse duration strings from env variables
const parseDuration = (durationString) => {
  if (!durationString) return 600000; // fallback: 10 minutes in ms
  
  const value = parseInt(durationString);
  const unit = durationString.slice(-1).toLowerCase();
  
  switch(unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value;
  }
};

// Get durations from env variables
const SESSION_DURATION = parseDuration(import.meta.env.VITE_SESSION_DURATION);
const WARNING_TIME = parseDuration(import.meta.env.VITE_WARNING_TIME);

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  showSessionWarning: false,
  showSessionExpired: false,

  login: async (emailOrUsername, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        emailOrUsername,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const expiryTime = Date.now() + SESSION_DURATION;
        set({ 
          user: response.data.user,
          isLoading: false,
          sessionExpiry: expiryTime,
          showSessionWarning: false,
          showSessionExpired: false
        });
        return true;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'An error occurred during login',
        isLoading: false 
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const expiryTime = Date.now() + SESSION_DURATION;
        set({ 
          user: response.data.user,
          isLoading: false,
          sessionExpiry: expiryTime,
          showSessionWarning: false,
          showSessionExpired: false
        });
        return true;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'An error occurred during registration',
        isLoading: false 
      });
      return false;
    }
  },

  extendSession: () => {
    const newExpiry = Date.now() + SESSION_DURATION;
    set({ 
      sessionExpiry: newExpiry,
      showSessionWarning: false 
    });
  },

  checkSession: () => {
    const { sessionExpiry } = useAuthStore.getState();
    if (!sessionExpiry) return;

    const timeLeft = sessionExpiry - Date.now();
    
    if (timeLeft <= 0) {
      set({ 
        showSessionWarning: false,
        showSessionExpired: true,
        user: null 
      });
      localStorage.removeItem('token');
    } 
    else if (timeLeft <= WARNING_TIME) {
      set({ showSessionWarning: true });
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ 
        user: null,
        error: null,
        sessionExpiry: null,
        showSessionWarning: false,
        showSessionExpired: false
      });
    }
  },

  fetchUserData: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/auth/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.user) {
        const expiryTime = Date.now() + SESSION_DURATION;
        set({ 
          user: response.data.user,
          sessionExpiry: expiryTime
        });
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        set({ 
          user: null,
          sessionExpiry: null,
          showSessionWarning: false,
          showSessionExpired: true
        });
      }
    }
  },

  setShowSessionWarning: (show) => set({ showSessionWarning: show }),
  setShowSessionExpired: (show) => set({ showSessionExpired: show }),
  setSessionExpiry: (time) => set({ sessionExpiry: time }),
  clearError: () => set({ error: null })
}));

export default useAuthStore;
