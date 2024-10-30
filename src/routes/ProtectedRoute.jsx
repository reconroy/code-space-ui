import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsValidToken(response.data.valid);
        if (!response.data.valid) {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
