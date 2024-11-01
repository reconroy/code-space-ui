import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFullscreenStore = create(
    persist(
        (set) => ({
            isFullscreen: false,
            setFullscreen: (value) => set({ isFullscreen: value }),
        }),
        {
            name: 'fullscreen-storage',
            getStorage: () => localStorage,
        }
    )
);

export default useFullscreenStore;
