import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

class CodespaceService {
  async updateSettings(slug, settings) {
    try {
      const response = await axios.put(
        `${API_URL}/api/codespace/${slug}/settings`,
        settings,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async checkSlugAvailability(slug) {
    try {
      const response = await axios.get(
        `${API_URL}/api/codespace/check-slug/${slug}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteCodespace(slug) {
    try {
      const response = await axios.delete(
        `${API_URL}/api/codespace/${slug}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export const codespaceService = new CodespaceService();