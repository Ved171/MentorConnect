import { io, Socket } from 'socket.io-client';

// In production (e.g., on Vercel), when this variable is undefined, the socket client
// will connect to the same host that serves the page, which is the correct behavior.
// In development, the Vite server and backend server are on different ports,
// so we connect directly to the backend's URL. Vite's proxy doesn't handle websockets.
const SOCKET_URL = import.meta.env.PROD ? undefined : 'http://localhost:5001';

let socket: Socket;

export const connectSocket = (userId: string) => {
  if (socket?.connected) {
    if (socket.io.opts.query?.userId === userId) {
        return; // Already connected as the same user
    } else {
        disconnectSocket(); // Disconnect if user is different
    }
  }
    
  socket = io(SOCKET_URL, {
    query: { userId },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  socket.on('connect', () => {
    console.log(`Socket.IO connected with id ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket.IO explicitly disconnected.');
  }
};

export const getSocket = (): Socket => {
  if (!socket) {
    // Initialize a disconnected socket if none exists, it will be properly connected in App.tsx
     socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
};
