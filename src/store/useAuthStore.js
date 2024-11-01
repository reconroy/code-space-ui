import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Login user
  login: async (emailOrUsername, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        emailOrUsername,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        set({ 
          user: response.data.user,
          isLoading: false 
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

  // Register user
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
        set({ 
          user: response.data.user,
          isLoading: false 
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

  // Logout user
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
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
        error: null 
      });
    }
  },

  // Fetch user data
  fetchUserData: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      // First verify the token
      const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (verifyResponse.data.valid) {
        // Get default codespace info which includes user data
        const userResponse = await axios.get(`${API_URL}/api/auth/user/default-codespace`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        set({ 
          user: {
            username: userResponse.data.username,
            // Add other user fields you need
          }, 
          isLoading: false, 
          error: null 
        });
      } else {
        localStorage.removeItem('token');
        set({ user: null, isLoading: false, error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      set({ error: error.message, isLoading: false });
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    }
  },

  // Clear any errors
  clearError: () => set({ error: null }),

  // Update user profile
  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      set({ 
        user: response.data.user,
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false 
      });
      return false;
    }
  },

  // Clear user data (for logout)
  clearUser: () => set({ user: null, error: null }),
}));

export default useAuthStore;
