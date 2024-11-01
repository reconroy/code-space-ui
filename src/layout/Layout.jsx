import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

const Layout = ({ children }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { fetchUserData } = useAuthStore();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUserData();
    }
  }, []);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <header className={`flex-shrink-0 ${!isDarkMode && 'shadow-lg'}`}>
        <Navbar />
      </header>

      <main className="flex-grow overflow-hidden">
        {children}
      </main>

      <footer className="flex-shrink-0">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;