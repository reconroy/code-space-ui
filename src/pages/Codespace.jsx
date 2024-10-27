import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import CodeEditor from './CodeEditor';
import MenuPanel from './../components/MenuPanel';
import useThemeStore from '../store/useThemeStore';

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
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [minimapEnabled, setMinimapEnabled] = useState(true);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [accessDenied, setAccessDenied] = useState(false);
  const [owner, setOwner] = useState(null);

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

    newSocket.on('roomError', () => {
      setError('Failed to join the room. Please try again.');
      setIsLoading(false);
    });

    newSocket.on('codeUpdate', setCode);

    return () => {
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.off('roomJoined');
      newSocket.off('roomError');
      newSocket.off('codeUpdate');
      newSocket.close();
    };
  }, [slug]);

  const fetchCodespace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const { data } = await axios.get(`/api/codespace/${slug}`, { headers });
      setCode(data.content || '');
      setLanguage(data.language || 'javascript');
    } catch (error) {
      console.error('Error fetching codespace:', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
        setOwner(error.response.data.owner);
      } else {
        setError('Failed to fetch codespace. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const saveCode = useCallback(async (codeToSave, langToSave) => {
    try {
      await axios.put(`/api/codespace/${slug}`, { content: codeToSave, language: langToSave });
      if (socket?.connected) {
        socket.emit('codeChange', { slug, content: codeToSave });
      } else {
        console.error('Socket is not connected. Unable to emit codeChange event.');
      }
    } catch (error) {
      console.error('Error saving code:', error);
    }
  }, [slug, socket]);

  const debouncedSave = useCallback(
    debounce((codeToSave, langToSave) => saveCode(codeToSave, langToSave), 1000),
    [saveCode]
  );

  const handleCodeChange = (newCode) => {
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
    <div className={`flex-grow flex ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex-grow relative">
        <CodeEditor 
          code={code} 
          setCode={handleCodeChange}
          language={language}
          setLanguage={handleLanguageChange}
          socket={socket}
          slug={slug}
          minimapEnabled={minimapEnabled}
        />
      </div>
      <div className="flex-shrink-0">
        <MenuPanel 
          code={code}
          language={language}
          onLanguageChange={handleLanguageChange}
          onToggleMinimap={handleToggleMinimap}
        />
      </div>
    </div>
  );
};

export default CodespacePage;