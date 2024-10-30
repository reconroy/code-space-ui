import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const GuestRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [defaultPath, setDefaultPath] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // First verify if token is valid
        const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!verifyResponse.data.valid) {
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        // If token is valid, get user's default codespace
        const defaultResponse = await axios.get(`${API_URL}/api/auth/user/default-codespace`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDefaultPath(`/${defaultResponse.data.defaultCodespace || defaultResponse.data.username}`);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  // If there's a valid token, redirect to default codespace
  if (localStorage.getItem('token') && defaultPath) {
    return <Navigate to={defaultPath} replace />;
  }

  // If no token or invalid token, show guest route
  return children;
};

export default GuestRoute;
