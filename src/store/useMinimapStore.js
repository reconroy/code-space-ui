import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMinimapStore = create(
  persist(
    (set) => ({
      isMinimapEnabled: true, // default state
      toggleMinimap: () => 
        set((state) => ({ 
          isMinimapEnabled: !state.isMinimapEnabled 
        })),
      setMinimapEnabled: (value) => 
        set({ isMinimapEnabled: value }),
    }),
    {
      name: 'minimap-storage',
    }
  )
);

export default useMinimapStore; 