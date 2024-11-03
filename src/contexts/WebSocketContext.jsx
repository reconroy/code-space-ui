import React, { createContext, useContext, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import useCodespaceStore from '../store/useCodespaceStore';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const { updateCodespace, deleteCodespace } = useCodespaceStore();
  
  const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Socket connected');
      if (user?.id) {
        socket.emit('joinUserSpace', user.id);
      }
    });

    socket.on('codespaceSettingsChanged', (updatedCodespace) => {
      console.log('Received codespace update:', updatedCodespace);
      updateCodespace(updatedCodespace);
    });

    socket.on('codespaceRemoved', (codespaceData) => {
      console.log('Received codespace deletion:', codespaceData);
      deleteCodespace(codespaceData);
    });

    return () => {
      socket.off('codespaceSettingsChanged');
      socket.off('codespaceRemoved');
      socket.disconnect();
    };
  }, [socket, user?.id, updateCodespace, deleteCodespace]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
