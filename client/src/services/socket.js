import { io } from 'socket.io-client';

let socket = null;

/**
 * Connect to the Socket.IO server.
 * Uses the same base URL as the API and sends cookies for JWT auth.
 */
export const connectSocket = () => {
  if (socket?.connected) return socket;

  const url = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : window.location.origin;

  socket = io(url, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
  });

  return socket;
};

/**
 * Disconnect the socket connection.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get the current socket instance (may be null if not connected).
 */
export const getSocket = () => socket;
