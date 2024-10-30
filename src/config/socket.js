import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL , {
  auth: {
    token: localStorage.getItem('jwt'),
  },
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

export default socket;