import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  sendMessage(message, type = 'text') {
    if (!this.socket || !this.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send_message', { message, type });

      const timeout = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 30000);

      this.socket.once('message_response', (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('message_response', callback);
    }
  }

  offMessage(callback) {
    if (this.socket) {
      this.socket.off('message_response', callback);
    }
  }
}

export default new SocketService();
