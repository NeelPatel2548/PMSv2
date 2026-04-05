const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

let io = null;
// Map<userId, Set<socketId>> — tracks which sockets belong to which user
const userSockets = new Map();

/**
 * Initialize Socket.IO on the HTTP server.
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    // Allow both websocket and polling (works through proxies)
    transports: ['websocket', 'polling']
  });

  // Authentication middleware — extract JWT from cookie
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track this socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user to their own room (simplifies targeted emits)
    socket.join(`user:${userId}`);

    console.log(`[Socket.IO] User ${userId} connected (socket: ${socket.id})`);

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      console.log(`[Socket.IO] User ${userId} disconnected (socket: ${socket.id})`);
    });
  });

  console.log('[Socket.IO] Initialized successfully');
  return io;
};

/**
 * Emit an event to a specific user (all their connected devices).
 * @param {string} userId
 * @param {string} event
 * @param {object} data
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Get the Socket.IO server instance.
 * @returns {Server|null}
 */
const getIO = () => io;

/**
 * Check if a user is currently connected.
 * @param {string} userId
 * @returns {boolean}
 */
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

module.exports = { initSocket, emitToUser, getIO, isUserOnline };
