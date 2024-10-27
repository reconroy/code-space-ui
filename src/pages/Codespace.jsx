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

const CodespacePage = () => {
  const { slug } = useParams();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [minimapEnabled, setMinimapEnabled] = useState(true);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

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
      const { data } = await axios.get(`/api/codespace/${slug}`);
      setCode(data.content || '');
      setLanguage(data.language || 'javascript');
    } catch (error) {
      console.error('Error fetching codespace:', error);
      setError('Failed to fetch codespace. Please try again.');
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

  if (isLoading) return <div className="flex-grow flex items-center justify-center">Loading...</div>;
  if (error) return <div className="flex-grow flex items-center justify-center text-red-500">{error}</div>;

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