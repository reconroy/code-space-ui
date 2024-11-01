import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLanguageDetectionStore = create(
  persist(
    (set) => ({
      isLanguageDetectionEnabled: true,
      toggleLanguageDetection: () => 
        set((state) => ({ 
          isLanguageDetectionEnabled: !state.isLanguageDetectionEnabled 
        })),
    }),
    {
      name: 'language-detection-storage',
    }
  )
);

export default useLanguageDetectionStore; 