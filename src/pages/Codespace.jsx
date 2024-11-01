import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import CodeEditor from './CodeEditor';
import MenuPanel from './../components/MenuPanel';
import useThemeStore from '../store/useThemeStore';
import UnauthorizedModal from '../components/UnauthorizedModal';
import AccessDenied from '../components/AccessDenied';
import LogoutModal from '../sub_components/LogoutModal';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const CodespacePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [codespace, setCodespace] = useState(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [ownerUsername, setOwnerUsername] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let isBackButtonClicked = false;
    
    const handlePopState = (event) => {
      event.preventDefault();
      const token = localStorage.getItem('token');
      
      if (token) {
        // If back button was already clicked once
        if (isBackButtonClicked) {
          // Stay on current page
          window.history.pushState(null, '', location.pathname);
          return;
        }

        // First back button click
        isBackButtonClicked = true;
        setShowLogoutModal(true);
        
        // Push current path back to history
        window.history.pushState(null, '', location.pathname);
        
        // Set timeout to reset the back button flag
        setTimeout(() => {
          isBackButtonClicked = false;
        }, 300); // Small timeout to prevent rapid clicks
      }
    };

    // Handle initial page load
    if (localStorage.getItem('token')) {
      // Clear existing history and replace with current path
      window.history.pushState(null, '', location.pathname);
      window.history.pushState(null, '', location.pathname);
    }

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    
    // Prevent forward/back navigation
    const preventNavigation = (e) => {
      if (localStorage.getItem('token')) {
        window.history.pushState(null, '', location.pathname);
      }
    };
    window.addEventListener('pushstate', preventNavigation);
    window.addEventListener('replacestate', preventNavigation);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pushstate', preventNavigation);
      window.removeEventListener('replacestate', preventNavigation);
    };
  }, [location.pathname]);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setIsAuthenticated(false);
        if (isPrivateCodespace) {
          setShowUnauthorizedModal(true);
        }
      }
    };
  
    checkToken();
  }, [isPrivateCodespace]); 

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
  
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/codespace/${slug}`, { headers });
      
      if (response.data.status === 'success') {
        setCodespace(response.data.data);
        setCode(response.data.data.content || '');
        setLanguage(response.data.data.language || 'plaintext');
        
        if (response.data.data.access_type === 'private' && !token) {
          setIsAccessDenied(true);
          setOwnerUsername(response.data.data.owner_username);
          return;
        }
      }
  
      setError(null);
    } catch (error) {
      console.error('Error fetching codespace:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsAccessDenied(true);
        setOwnerUsername(error.response.data.owner);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/codespace/${slug}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status === 'success') {
          setCodespace(response.data.data);
          setCode(response.data.data.content || '');
          setLanguage(response.data.data.language || 'javascript');
          setIsAccessDenied(false);
        }
      } catch (error) {
        console.error('Error fetching codespace:', error);
        if (error.response?.status === 403) {
          setIsAccessDenied(true);
          setOwnerUsername(error.response.data.owner);
        } else if (error.response?.status === 404) {
          await createCodespace();
        } else {
          setError('Failed to load codespace');
          setIsLoading(false);
        }
      }
    };

    initializeCodespace();
  }, [slug]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ['websocket'],
      cors: {
        origin: import.meta.env.VITE_API_URL,
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

  // Debounce the save function to prevent excessive calls
  const debouncedSave = useCallback(
    debounce((codeToSave, langToSave) => saveCode(codeToSave, langToSave), 1),
    [saveCode]
  );

  const handleCodeChange = (newCode) => {
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

  useEffect(() => {
    const verifyTokenAndFetch = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.data.valid) {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        }
      }
      
      fetchCodespace();
    };

    verifyTokenAndFetch();
  }, [fetchCodespace]);

  if (isLoading) return (
    <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (isAccessDenied) {
    return <AccessDenied owner={ownerUsername} isDarkMode={isDarkMode} />;
  }

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
            readOnly={isPrivateCodespace && !localStorage.getItem('token')}
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
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => {
          setShowLogoutModal(false);
          // Ensure we stay on current page
          window.history.pushState(null, '', location.pathname);
        }}
      />
    </>
  );
};

export default CodespacePage;