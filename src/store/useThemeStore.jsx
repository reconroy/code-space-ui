import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDarkMode: (() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === null ? true : JSON.parse(savedMode);
  })(),
  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    return { isDarkMode: newMode };
  }),
}));

export default useThemeStore;