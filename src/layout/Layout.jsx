import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useThemeStore from '../store/useThemeStore';
import HomePage from '../pages/HomePage';
import CodespacePage from '../pages/Codespace';
import DiffChecker from '../pages/DiffChecker';
import Login from './../user/Login';
import Registration from './../user/Resgistration';
import ForgotPassword from './../user/ForgotPassword';
import ChangePassword from './../user/ChangePassword';

const Layout = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <header className="flex-shrink-0">
        <Navbar />
      </header>

      <main className="flex-grow overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<CodespacePage />} />
          <Route path="/diff-checker" element={<DiffChecker />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="flex-shrink-0">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;