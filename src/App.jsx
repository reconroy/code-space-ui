// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import CodespacePage from './pages/Codespace';
import DiffChecker from './pages/DiffChecker';
import Login from './user/Login';
import Registration from './user/Registration';
import ForgotPassword from './user/ForgotPassword';
import ChangePassword from './user/ChangePassword';
import Settings from './user/Settings';
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import HomeRoute from './routes/HomeRoute';
import './styles/selectionStyles.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage with route guard */}
        <Route path="/" element={
          <HomeRoute>
            <Layout>
              <HomePage />
            </Layout>
          </HomeRoute>
        } />

        {/* Guest-only routes */}
        <Route path="/login" element={
          <GuestRoute>
            <Layout>
              <Login />
            </Layout>
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <Layout>
              <Registration />
            </Layout>
          </GuestRoute>
        } />
        <Route path="/forgot-password" element={
          <GuestRoute>
            <Layout>
              <ForgotPassword />
            </Layout>
          </GuestRoute>
        } />

        {/* Protected routes */}
        <Route path="/diff-checker" element={
          <ProtectedRoute>
            <Layout>
              <DiffChecker />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <Layout>
              <ChangePassword />
            </Layout>
          </ProtectedRoute>
        } />
        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Dynamic codespace route */}
        <Route path="/:slug" element={
          <Layout>
            <CodespacePage />
          </Layout>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
