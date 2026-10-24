// source/socket/index.js
import { Server } from 'socket.io';
import { socketAuth } from './auth.js';
import { registerHandlers } from './handlers.js';

/**
 * Инициализирует Socket.IO на переданном http-сервере.
 * @param {import('node:http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true }
  });

  // Аутентификация — до всех остальных событий
  socketAuth(io);

  // Обработчики
  io.on('connection', (socket) => {
    registerHandlers(io, socket);
  });

  return io;
}