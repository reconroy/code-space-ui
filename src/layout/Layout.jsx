import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SessionCountdown from '../sub_components/SessionCountdown';
import SessionExpiredModal from '../sub_components/SessionExpiredModal';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

const Layout = ({ children }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { 
    fetchUserData, 
    checkSession,
    sessionExpiry,
    showSessionWarning,
    showSessionExpired,
    extendSession
  } = useAuthStore();

  // Initial user data fetch
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUserData();
    }
  }, []);

  // Session check interval
  useEffect(() => {
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time left for countdown
  const timeLeft = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - Date.now()) / 1000)) : 0;

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <header className={`flex-shrink-0 ${!isDarkMode && 'shadow-lg'}`}>
        <Navbar />
      </header>

      <main className="flex-grow overflow-hidden">
        {children}
      </main>

      <footer className="flex-shrink-0">
        <Footer />
      </footer>

      {/* Session Management Components */}
      {showSessionWarning && !showSessionExpired && (
        <SessionCountdown 
          timeLeft={timeLeft}
          onContinue={extendSession}
        />
      )}
      
      {showSessionExpired && (
        <SessionExpiredModal />
      )}
    </div>
  );
};

export default Layout;