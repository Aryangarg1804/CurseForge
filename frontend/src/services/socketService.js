import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to socket server with JWT token
   */
  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupListeners();
  }

  /**
   * Setup default listeners
   */
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.emit('socket-connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.emit('socket-disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket-error', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  /**
   * Join a chat room
   */
  joinChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('joinChat', chatId);
    }
  }

  /**
   * Leave a chat room
   */
  leaveChat(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('leaveChat', chatId);
    }
  }

  /**
   * Send a message
   */
  sendMessage(chatId, message, messageType = 'text', fileData = null) {
    if (this.socket?.connected) {
      const payload = {
        chatId,
        message,
        messageType
      };

      if (fileData) {
        payload.fileUrl = fileData.url;
        payload.fileName = fileData.name;
        payload.fileSize = fileData.size;
      }

      this.socket.emit('sendMessage', payload);
    }
  }

  /**
   * Emit typing indicator
   */
  emitTyping(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('typing', chatId);
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(chatId) {
    if (this.socket?.connected) {
      this.socket.emit('stopTyping', chatId);
    }
  }

  /**
   * Mark messages as seen
   */
  markMessagesSeen(chatId, messageIds) {
    if (this.socket?.connected) {
      this.socket.emit('markAsSeen', {
        chatId,
        messageIds
      });
    }
  }

  /**
   * Join support dashboard
   */
  joinSupportDashboard() {
    if (this.socket?.connected) {
      this.socket.emit('joinSupportDashboard');
    }
  }

  /**
   * Leave support dashboard
   */
  leaveSupportDashboard() {
    if (this.socket?.connected) {
      this.socket.emit('leaveSupportDashboard');
    }
  }

  /**
   * Assign agent to chat
   */
  assignAgent(chatId, agentId) {
    if (this.socket?.connected) {
      this.socket.emit('assignAgent', {
        chatId,
        agentId
      });
    }
  }

  /**
   * Update chat status
   */
  updateChatStatus(chatId, status, priority = null) {
    if (this.socket?.connected) {
      this.socket.emit('updateChatStatus', {
        chatId,
        status,
        priority
      });
    }
  }

  /**
   * Listen to events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);

      if (this.socket) {
        this.socket.on(event, (data) => {
          this.emit(event, data);
        });
      }
    }

    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
