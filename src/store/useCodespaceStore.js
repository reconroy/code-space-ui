import { create } from 'zustand';
import axios from 'axios';

const useCodespaceStore = create((set, get) => ({
  codespaces: [],
  loading: false,
  error: null,
  
  fetchUserCodespaces: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/codespace/user/codespaces`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      set({ codespaces: response.data.data, loading: false });
    } catch (error) {
      console.error('Error fetching codespaces:', error);
      set({ error: error.message, loading: false });
    }
  },

  createNewCodespace: async () => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('token');
      const randomSlug = Math.random().toString(36).substring(2, 9);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/codespace`,
        {
          slug: randomSlug,
          access_type: 'private'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      set(state => ({
        codespaces: [...state.codespaces, response.data.data],
        loading: false
      }));

      return response.data.data.slug;
    } catch (error) {
      console.error('Error creating codespace:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  updateCodespace: (updatedCodespace) => {
    console.log('Updating codespace in store:', updatedCodespace);
    set(state => ({
      codespaces: state.codespaces.map(cs => 
        cs.id === updatedCodespace.id 
          ? { ...cs, ...updatedCodespace }
          : cs
      )
    }));
  },

  deleteCodespace: (codespaceData) => {
    console.log('Deleting codespace from store:', codespaceData);
    set(state => ({
      codespaces: state.codespaces.filter(cs => cs.id !== codespaceData.id)
    }));
  }
}));

export default useCodespaceStore;
