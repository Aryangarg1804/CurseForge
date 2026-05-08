import jwt from 'jsonwebtoken';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';

// Store active connections
const activeConnections = new Map(); // userId -> { socketId, isOnline, userType }
const chatRooms = new Map(); // chatId -> Set of socketIds

/**
 * Authenticate socket connection using JWT
 */
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userName = decoded.name;
    socket.userType = decoded.userType || 'user';
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

/**
 * Initialize Socket.IO event handlers
 */
export const initializeSocket = (io) => {
  // Middleware for authentication
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userName})`);

    // Store connection info
    activeConnections.set(socket.userId, {
      socketId: socket.id,
      isOnline: true,
      userType: socket.userType,
      userName: socket.userName
    });

    /**
     * User joins a chat
     */
    socket.on('joinChat', async (chatId) => {
      try {
        const roomName = `chat-${chatId}`;

        // Verify user has access to this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        if (
          chat.userId.toString() !== socket.userId &&
          chat.supportAgent?.toString() !== socket.userId
        ) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Join the room
        socket.join(roomName);

        // Track room connection
        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, new Set());
        }
        chatRooms.get(chatId).add(socket.id);

        // Notify others in the room
        socket.to(roomName).emit('userOnline', {
          userId: socket.userId,
          userName: socket.userName,
          userType: socket.userType
        });

        console.log(`👤 User ${socket.userName} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error in joinChat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    /**
     * Send a message
     */
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, message, messageType = 'text', fileUrl, fileName, fileSize } = data;

        // Verify chat exists and user has access
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        if (
          chat.userId.toString() !== socket.userId &&
          chat.supportAgent?.toString() !== socket.userId
        ) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Validate message
        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        // Determine sender type
        const senderType = chat.userId.toString() === socket.userId ? 'user' : 'agent';

        // Create and save message
        const newMessage = new Message({
          chatId,
          senderId: socket.userId,
          senderType,
          senderName: socket.userName,
          senderEmail: socket.userEmail,
          message,
          messageType,
          fileUrl,
          fileName,
          fileSize
        });

        await newMessage.save();

        // Update chat
        chat.lastMessage = message;
        chat.lastMessageTime = new Date();
        chat.lastMessageSender = senderType;

        // Increment unread count for recipient
        if (senderType === 'user') {
          chat.unreadAgentCount = (chat.unreadAgentCount || 0) + 1;
        } else {
          chat.unreadUserCount = (chat.unreadUserCount || 0) + 1;
        }

        await chat.save();

        // Emit message to all users in the chat room
        const roomName = `chat-${chatId}`;
        io.to(roomName).emit('messageReceived', {
          _id: newMessage._id,
          chatId,
          senderId: socket.userId,
          senderType,
          senderName: socket.userName,
          message,
          messageType,
          fileUrl,
          fileName,
          timestamp: newMessage.createdAt,
          seen: false
        });

        // Emit notification to support agents if user sent message
        if (senderType === 'user') {
          io.to('support-dashboard').emit('newMessage', {
            chatId,
            message,
            senderName: socket.userName,
            timestamp: new Date()
          });
        }

        console.log(`💬 Message sent in chat ${chatId} by ${socket.userName}`);
      } catch (error) {
        console.error('Error in sendMessage:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Send typing indicator
     */
    socket.on('typing', (chatId) => {
      try {
        const roomName = `chat-${chatId}`;
        socket.to(roomName).emit('userTyping', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: true
        });
      } catch (error) {
        console.error('Error in typing event:', error);
      }
    });

    /**
     * Stop typing
     */
    socket.on('stopTyping', (chatId) => {
      try {
        const roomName = `chat-${chatId}`;
        socket.to(roomName).emit('userTyping', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: false
        });
      } catch (error) {
        console.error('Error in stopTyping event:', error);
      }
    });

    /**
     * Mark message as seen
     */
    socket.on('markAsSeen', async (data) => {
      try {
        const { chatId, messageIds } = data;

        // Update messages
        if (messageIds && messageIds.length > 0) {
          await Message.updateMany(
            { _id: { $in: messageIds } },
            { seen: true, seenAt: new Date() }
          );
        }

        // Update chat unread count
        const chat = await Chat.findById(chatId);
        if (chat) {
          const senderType = chat.userId.toString() === socket.userId ? 'user' : 'agent';
          if (senderType === 'user') {
            chat.unreadUserCount = 0;
          } else {
            chat.unreadAgentCount = 0;
          }
          await chat.save();
        }

        // Emit to room
        const roomName = `chat-${chatId}`;
        io.to(roomName).emit('messagesSeen', {
          chatId,
          messageIds,
          seenBy: socket.userName
        });

        console.log(`✓ Messages marked as seen in chat ${chatId}`);
      } catch (error) {
        console.error('Error in markAsSeen:', error);
      }
    });

    /**
     * Join support dashboard (for agents)
     */
    socket.on('joinSupportDashboard', () => {
      try {
        if (socket.userType === 'agent' || socket.userType === 'admin') {
          socket.join('support-dashboard');
          console.log(`📊 Support agent ${socket.userName} joined dashboard`);

          // Notify dashboard of agent online
          io.to('support-dashboard').emit('agentOnline', {
            userId: socket.userId,
            userName: socket.userName
          });
        }
      } catch (error) {
        console.error('Error in joinSupportDashboard:', error);
      }
    });

    /**
     * Leave support dashboard
     */
    socket.on('leaveSupportDashboard', () => {
      try {
        socket.leave('support-dashboard');
        console.log(`📊 Support agent ${socket.userName} left dashboard`);
      } catch (error) {
        console.error('Error in leaveSupportDashboard:', error);
      }
    });

    /**
     * Assign agent to chat (from support dashboard)
     */
    socket.on('assignAgent', async (data) => {
      try {
        const { chatId, agentId } = data;

        const chat = await Chat.findByIdAndUpdate(
          chatId,
          { supportAgent: agentId },
          { new: true }
        );

        // Notify all users
        const roomName = `chat-${chatId}`;
        io.to(roomName).emit('agentAssigned', {
          agentId,
          agentName: socket.userName
        });

        console.log(`👨‍💼 Agent ${socket.userName} assigned to chat ${chatId}`);
      } catch (error) {
        console.error('Error in assignAgent:', error);
      }
    });

    /**
     * Update chat status
     */
    socket.on('updateChatStatus', async (data) => {
      try {
        const { chatId, status, priority } = data;

        const chat = await Chat.findByIdAndUpdate(
          chatId,
          { status, priority: priority || chat.priority },
          { new: true }
        );

        // Notify all users
        const roomName = `chat-${chatId}`;
        io.to(roomName).emit('chatStatusUpdated', {
          chatId,
          status,
          priority: priority || chat.priority
        });

        console.log(`⚙️ Chat ${chatId} status updated to ${status}`);
      } catch (error) {
        console.error('Error in updateChatStatus:', error);
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      try {
        console.log(`❌ User disconnected: ${socket.userId}`);

        // Remove from active connections
        activeConnections.delete(socket.userId);

        // Remove from all chat rooms
        for (const [chatId, sockets] of chatRooms.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);

            if (sockets.size === 0) {
              chatRooms.delete(chatId);
            } else {
              // Notify remaining users
              const roomName = `chat-${chatId}`;
              io.to(roomName).emit('userOffline', {
                userId: socket.userId,
                userName: socket.userName
              });
            }
          }
        }

        // Remove from support dashboard
        socket.leave('support-dashboard');
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};

/**
 * Get all active connections
 */
export const getActiveConnections = () => {
  return activeConnections;
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return activeConnections.has(userId);
};

/**
 * Get users in a chat room
 */
export const getUsersInChat = (chatId) => {
  return chatRooms.get(`chat-${chatId}`) || new Set();
};
