import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function setupWebSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join translation room
    socket.on('join-translation', (data) => {
      socket.join('translation');
      console.log(`User ${socket.id} joined translation room`);
      socket.emit('joined-translation', { message: 'Joined translation room' });
    });

    // Join accessibility room
    socket.on('join-accessibility', (data) => {
      socket.join('accessibility');
      console.log(`User ${socket.id} joined accessibility room`);
      socket.emit('joined-accessibility', { message: 'Joined accessibility room' });
    });

    // Translation progress updates
    socket.on('translation-progress', (data) => {
      socket.to('translation').emit('translation-update', data);
    });

    // Accessibility progress updates
    socket.on('accessibility-progress', (data) => {
      socket.to('accessibility').emit('accessibility-update', data);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
