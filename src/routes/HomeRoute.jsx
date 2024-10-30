import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const HomeRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [defaultPath, setDefaultPath] = useState('');

  useEffect(() => {
    const checkTokenAndGetDefault = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // First verify token
        const verifyResponse = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!verifyResponse.data.valid) {
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }

        // If token is valid, get default codespace
        const defaultResponse = await axios.get(`${API_URL}/api/auth/user/default-codespace`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (defaultResponse.data.defaultCodespace) {
          setDefaultPath(`/${defaultResponse.data.defaultCodespace}`);
        } else if (defaultResponse.data.username) {
          setDefaultPath(`/${defaultResponse.data.username}`);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkTokenAndGetDefault();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  // If valid token exists, redirect to default codespace
  if (localStorage.getItem('token') && defaultPath) {
    return <Navigate to={defaultPath} replace />;
  }

  // If no token or invalid token, show homepage
  return children;
};

export default HomeRoute;
