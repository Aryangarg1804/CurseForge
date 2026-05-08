import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * User Chat Routes
 */

// Create or get chat
router.post('/create', chatController.createOrGetChat);

// Get all chats for current user
router.get('/my-chats', chatController.getUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', chatController.getChatMessages);

// Send a message
router.post('/:chatId/send-message', chatController.sendMessage);

// Mark messages as seen
router.put('/:chatId/mark-seen', chatController.markMessagesAsSeen);

// Get unread count
router.get('/:chatId/unread-count', chatController.getUnreadCount);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

/**
 * Support Agent Routes
 */

// Get all chats (for support dashboard)
router.get('/support/all-chats', chatController.getSupportChats);

// Update chat status
router.put('/:chatId/status', chatController.updateChatStatus);

// Assign agent to chat
router.put('/:chatId/assign-agent', chatController.assignAgentToChat);

// Get chat statistics
router.get('/support/stats', chatController.getChatStats);

export default router;
