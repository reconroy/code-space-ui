import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  loading: false,
  error: null,

  // Login user
  login: async (emailOrUsername, password) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        emailOrUsername,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          loading: false 
        });
        return true;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'An error occurred during login',
        loading: false 
      });
      return false;
    }
  },

  // Register user
  register: async (username, email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          loading: false 
        });
        return true;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'An error occurred during registration',
        loading: false 
      });
      return false;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ 
        user: null,
        isAuthenticated: false,
        error: null 
      });
    }
  },

  // Check auth status and refresh user data
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ 
          user: null,
          isAuthenticated: false,
          loading: false 
        });
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/verify`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.valid) {
        set({ 
          user: response.data.user,
          isAuthenticated: true,
          loading: false 
        });
      } else {
        localStorage.removeItem('token');
        set({ 
          user: null,
          isAuthenticated: false,
          loading: false 
        });
      }
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Authentication failed' 
      });
    }
  },

  // Clear any errors
  clearError: () => set({ error: null }),

  // Update user profile
  updateProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      set({ 
        user: response.data.user,
        loading: false 
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile',
        loading: false 
      });
      return false;
    }
  }
}));

export default useAuthStore;
