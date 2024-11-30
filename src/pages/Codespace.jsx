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
import useLanguageDetectionStore from '../store/useLanguageDetectionStore';
import hljs from 'highlight.js/lib/core';
import { jwtDecode } from 'jwt-decode';

// Import languages for highlight.js detection
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import csharp from 'highlight.js/lib/languages/csharp';
import typescript from 'highlight.js/lib/languages/typescript';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import scala from 'highlight.js/lib/languages/scala'; 
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';

// Register languages with highlight.js
const languages = { javascript, python, css, java, cpp, xml, json, markdown, csharp, typescript, ruby, go, rust, swift, kotlin, scala, php, sql };
Object.entries(languages).forEach(([name, lang]) => hljs.registerLanguage(name, lang));

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
  const { isLanguageDetectionEnabled, toggleLanguageDetection } = useLanguageDetectionStore();
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [isSharedCodespace, setIsSharedCodespace] = useState(false);

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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
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

  const createCodespace = useCallback(async (newSlug) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/codespace`,
        { slug: newSlug || slug },
        { headers }
      );

      if (response.data.status === 'success') {
        const newCodespace = response.data.data;
        setCodespace(newCodespace);
        setCode(newCodespace.content || '');
        setLanguage(newCodespace.language || 'plaintext');
        setError(null);
      }
    } catch (error) {
      console.error('Error creating codespace:', error);
      setError('Failed to create codespace');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const fetchCodespace = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/codespace/${slug}`, 
        { headers }
      );
      
      if (response.data.status === 'success') {
        const codespaceData = response.data.data;
        setCodespace(codespaceData);
        setCode(codespaceData.content || '');
        setLanguage(codespaceData.language || 'plaintext');
        setIsAccessDenied(false);
        
        // Handle shared codespace access
        if (codespaceData.access_type === 'shared') {
          if (token) {
            const decoded = jwtDecode(token);
            const currentUserId = decoded.id;
            
            // Owner should always have access
            if (parseInt(codespaceData.owner_id) === parseInt(currentUserId)) {
              return;
            }
            
            // For non-owners, check access
            if (!response.data.hasAccess) {
              setShowPasskeyModal(true);
              return;
            }
          } else {
            setShowPasskeyModal(true);
            return;
          }
        }
        
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching codespace:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          const currentUserId = decoded.id;
          
          // Don't show access denied for owner
          if (parseInt(error.response.data.ownerId) === parseInt(currentUserId)) {
            return;
          }
        }
        
        if (error.response.data.requiresPasskey) {
          setShowPasskeyModal(true);
        } else {
          setIsAccessDenied(true);
          setOwnerUsername(error.response.data.owner);
        }
      } else if (error.response?.status === 404) {
        await createCodespace();
      } else {
        setError('Failed to fetch codespace');
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, createCodespace]);

  // Initialize codespace when component mounts
  useEffect(() => {
    if (!slug) return;
    fetchCodespace();
  }, [slug, fetchCodespace]);

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
  
      await axios.put(`${import.meta.env.VITE_API_URL}/api/codespace/${slug}`,
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
    debounce((codeToSave, langToSave) => saveCode(codeToSave, langToSave), 500),
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

  const handleToggleLanguageDetection = async () => {
    toggleLanguageDetection();
    
    // Get the new state after toggle
    const newState = !isLanguageDetectionEnabled;
    
    if (!newState) {
      setLanguage('plaintext');
      await saveCode(code, 'plaintext');
    } else {
      const detectedLang = hljs.highlightAuto(code, Object.keys(languages)).language || 'plaintext';
      setLanguage(detectedLang);
      await saveCode(code, detectedLang);
    }
  };

  // Effect for language detection
  useEffect(() => {
    if (isLanguageDetectionEnabled && code) {
      const detectedLang = hljs.highlightAuto(code, Object.keys(languages)).language || 'plaintext';
      if (detectedLang !== language) {
        setLanguage(detectedLang);
        saveCode(code, detectedLang);
      }
    }
  }, [isLanguageDetectionEnabled]);

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
            isAuthenticated={isAuthenticated}
            codespace={codespace}
          />
        </div>
        {isAuthenticated && (
          <div className="flex-shrink-0">
            <MenuPanel
              code={code}
              language={language}
              onLanguageChange={handleLanguageChange}
              onToggleLanguageDetection={handleToggleLanguageDetection}
              isLanguageDetectionEnabled={isLanguageDetectionEnabled}
              createCodespace={createCodespace}
              isAuthenticated={isAuthenticated}
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
      {showPasskeyModal && (
        <PasskeyModal
          isOpen={showPasskeyModal}
          onClose={() => setShowPasskeyModal(false)}
          codespace={codespace}
          onAccessGranted={() => {
            setShowPasskeyModal(false);
            fetchCodespace();
          }}
        />
      )}
    </>
  );
};

export default CodespacePage;