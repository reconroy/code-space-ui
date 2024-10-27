import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFontSizeStore = create(
  persist(
    (set) => ({
      fontSize: 16,
      setFontSize: (size) => set({ fontSize: size }),
      showFontSizeSlider: false,
      toggleFontSizeSlider: () => set((state) => ({ showFontSizeSlider: !state.showFontSizeSlider })),
    }),
    {
      name: 'font-size-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useFontSizeStore;