import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  /**
   * Connect to Socket.IO server
   */
  connect(userId: string, token: string) {
    if (this.socket?.connected && this.userId === userId) {
      return this.socket;
    }

    // Disconnect existing connection if user changed
    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
