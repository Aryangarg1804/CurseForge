import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

/**
 * Create a new chat or get existing chat
 */
export const createOrGetChat = async (req, res) => {
  try {
    const { userId, subject } = req.body;
    const currentUserId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({ userId: currentUserId }).sort({ createdAt: -1 });

    if (!chat) {
      chat = new Chat({
        userId: currentUserId,
        subject: subject || 'Support Request'
      });
      await chat.save();
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all chats for a user
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, skip = 0 } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const chats = await Chat.find(query)
      .populate('userId', 'name email')
      .populate('supportAgent', 'name email')
      .sort({ lastMessageTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Chat.countDocuments(query);

    res.json({ success: true, chats, total });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all chats for support agents (admin dashboard)
 */
export const getSupportChats = async (req, res) => {
  try {
    const { status, supportAgent, search, limit = 50, skip = 0 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (supportAgent) query.supportAgent = supportAgent;

    // Search in chat subject or user details
    if (search) {
      const users = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }).select('_id');

      query.$or = [
        { subject: new RegExp(search, 'i') },
        { userId: { $in: users.map(u => u._id) } }
      ];
    }

    const chats = await Chat.find(query)
      .populate('userId', 'name email')
      .populate('supportAgent', 'name email')
      .sort({ lastMessageTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Chat.countDocuments(query);

    res.json({ success: true, chats, total });
  } catch (error) {
    console.error('Error fetching support chats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const userId = req.user.id;

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.userId.toString() !== userId && chat.supportAgent?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Message.countDocuments({ chatId });

    res.json({ success: true, messages: messages.reverse(), total });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, message, messageType = 'text', fileUrl, fileName, fileSize } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.name;

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify user has access
    if (chat.userId.toString() !== senderId && chat.supportAgent?.toString() !== senderId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Determine sender type
    const senderType = chat.userId.toString() === senderId ? 'user' : 'agent';

    // Create message
    const newMessage = new Message({
      chatId,
      senderId,
      senderType,
      senderName,
      senderEmail: req.user.email,
      message,
      messageType,
      fileUrl,
      fileName,
      fileSize
    });

    await newMessage.save();

    // Update chat
    chat.lastMessage = message;
    chat.lastMessageTime = Date.now();
    chat.lastMessageSender = senderType;
    
    // Reset unread count for sender
    if (senderType === 'user') {
      chat.unreadUserCount = 0;
    } else {
      chat.unreadAgentCount = 0;
    }

    await chat.save();

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark messages as seen
 */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user has access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.userId.toString() !== userId && chat.supportAgent?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Mark all unseen messages as seen
    const senderType = chat.userId.toString() === userId ? 'user' : 'agent';
    const opponentType = senderType === 'user' ? 'agent' : 'user';

    await Message.updateMany(
      { chatId, senderType: opponentType, seen: false },
      { seen: true, seenAt: new Date() }
    );

    // Update chat unread count
    if (senderType === 'user') {
      chat.unreadUserCount = 0;
    } else {
      chat.unreadAgentCount = 0;
    }

    await chat.save();

    res.json({ success: true, message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get unread count for a chat
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.userId.toString() !== userId && chat.supportAgent?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const senderType = chat.userId.toString() === userId ? 'user' : 'agent';
    const unreadCount = senderType === 'user' ? chat.unreadUserCount : chat.unreadAgentCount;

    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update chat status
 */
export const updateChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status, priority, notes } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (status) chat.status = status;
    if (priority) chat.priority = priority;
    if (notes !== undefined) chat.notes = notes;

    if (status === 'resolved') chat.resolvedAt = new Date();
    if (status === 'closed') chat.closedAt = new Date();

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Assign support agent to chat
 */
export const assignAgentToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { agentId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.supportAgent = agentId;
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Error assigning agent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get chat statistics for support dashboard
 */
export const getChatStats = async (req, res) => {
  try {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const pendingChats = await Chat.countDocuments({ status: 'pending' });
    const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
    const totalMessages = await Message.countDocuments();

    const avgResolutionTime = await Chat.aggregate([
      { $match: { resolvedAt: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ['$resolvedAt', '$createdAt']
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalChats,
        activeChats,
        pendingChats,
        resolvedChats,
        totalMessages,
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a chat
 */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Only user can delete their own chat
    if (chat.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
