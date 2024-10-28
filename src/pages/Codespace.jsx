import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import CodeEditor from './CodeEditor';
import MenuPanel from './../components/MenuPanel';
import useThemeStore from '../store/useThemeStore';
import UnauthorizedModal from '../components/UnauthorizedModal';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const AccessDenied = ({ owner, isDarkMode }) => (
  <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className={`max-w-md w-full mx-auto p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg text-center`}>
      <div className="mb-6">
        <svg
          className={`w-16 h-16 mx-auto ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        This is a private CodeSpace belonging to <span className="font-semibold">{owner}</span>.
      </p>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        You don't have permission to access this workspace.
      </p>
    </div>
  </div>
);

const CodespacePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [minimapEnabled, setMinimapEnabled] = useState(true);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [accessDenied, setAccessDenied] = useState(false);
  const [owner, setOwner] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isPrivateCodespace, setIsPrivateCodespace] = useState(false);

  // Replace the problematic useEffect
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setIsAuthenticated(false);
        // Only show modal for private codespaces
        if (isPrivateCodespace) {
          setShowUnauthorizedModal(true);
        }
      }
    };
  
    checkToken();
  }, [isPrivateCodespace]); 

  // Add this function to verify token
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setShowUnauthorizedModal(true);
      return false;
    }

    try {
      const response = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsTokenValid(response.data.valid);
      if (!response.data.valid) {
        setShowUnauthorizedModal(true);
        localStorage.removeItem('token');
      }
      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      setIsTokenValid(false);
      setShowUnauthorizedModal(true);
      localStorage.removeItem('token');
      return false;
    }
  }, []);

  const fetchCodespace = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      const response = await axios.get(`/api/codespace/${slug}`, { headers });
      
      // Set isPrivate status first
      setIsPrivateCodespace(response.data.isPrivate);
  
      // For private codespaces, verify token immediately
      if (response.data.isPrivate) {
        if (!token) {
          setAccessDenied(true);
          setOwner(response.data.owner_username);
          setShowUnauthorizedModal(true);
          return;
        }
      }
  
      // If we get here, it's either public or we have valid token for private
      setCode(response.data.content || '');
      setLanguage(response.data.language || 'javascript');
      setError(null);
    } catch (error) {
      console.error('Error fetching codespace:', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
        setOwner(error.response.data.owner);
        setShowUnauthorizedModal(true);
      } else {
        setError('Failed to fetch codespace');
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const createCodespace = async (newSlug) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post('/api/codespace',
        { slug: newSlug || slug },
        { headers }
      );

      if (response.data.status === 'success') {
        if (newSlug) {
          navigate(`/${newSlug}`);
        } else {
          await fetchCodespace();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating codespace:', error);
      setError(error.response?.data?.message || 'Failed to create codespace');
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    const initializeCodespace = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/codespace/${slug}`);
        if (response.data) {
          await fetchCodespace();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          await createCodespace();
        } else {
          setError('Failed to initialize codespace');
          setIsLoading(false);
        }
      }
    };

    initializeCodespace();
  }, [slug]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ['websocket'],
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('joinRoom', slug);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to the server. Please try again.');
      setIsLoading(false);
    });

    newSocket.on('roomJoined', () => fetchCodespace());
    newSocket.on('codeUpdate', setCode);

    return () => {
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.off('roomJoined');
      newSocket.off('codeUpdate');
      newSocket.close();
    };
  }, [slug, fetchCodespace]);

  const saveCode = useCallback(async (codeToSave, langToSave) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      // Only check token for private codespaces
      if (isPrivateCodespace && !token) {
        setShowUnauthorizedModal(true);
        return;
      }
  
      await axios.put(`/api/codespace/${slug}`,
        { content: codeToSave, language: langToSave },
        { headers }
      );
  
      if (socket?.connected) {
        socket.emit('codeChange', { slug, content: codeToSave });
      }
    } catch (error) {
      console.error('Error saving code:', error);
      if (error.response?.status === 401 && isPrivateCodespace) {
        setShowUnauthorizedModal(true);
      }
    }
  }, [slug, socket, isPrivateCodespace]);

  const debouncedSave = useCallback(
    debounce((codeToSave, langToSave) => saveCode(codeToSave, langToSave), 1000),
    [saveCode]
  );

  const handleCodeChange = (newCode) => {
    // Only check token for private codespaces
    if (isPrivateCodespace && !localStorage.getItem('token')) {
      setShowUnauthorizedModal(true);
      return;
    }
    
    setCode(newCode);
    debouncedSave(newCode, language);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    debouncedSave(code, newLanguage);
  };

  const handleToggleMinimap = (enabled) => {
    setMinimapEnabled(enabled);
  };

  if (isLoading) return (
    <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (accessDenied) return <AccessDenied owner={owner} isDarkMode={isDarkMode} />;

  if (error) return (
    <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-600'}`}>
      {error}
    </div>
  );

  return (
    <>
      <div className={`flex-grow flex ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`relative ${isAuthenticated ? 'flex-grow' : 'w-full'}`}>
          <CodeEditor
            code={code}
            setCode={handleCodeChange}
            language={language}
            setLanguage={handleLanguageChange}
            socket={socket}
            slug={slug}
            minimapEnabled={minimapEnabled}
            readOnly={isPrivateCodespace && !localStorage.getItem('token')} // Only readonly for private spaces without token
          />
        </div>
        {isAuthenticated && (
          <div className="flex-shrink-0">
            <MenuPanel
              code={code}
              language={language}
              onLanguageChange={handleLanguageChange}
              onToggleMinimap={handleToggleMinimap}
              createCodespace={createCodespace}
            />
          </div>
        )}
      </div>
      <UnauthorizedModal
        isOpen={showUnauthorizedModal}
        onClose={() => {
          setShowUnauthorizedModal(false);
          if (!localStorage.getItem('token')) {
            navigate('/');
          }
        }}
      />
    </>
  );
};

export default CodespacePage;