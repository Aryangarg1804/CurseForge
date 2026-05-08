import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import socketService from '../services/socketService';
import * as chatApi from '../services/chatApi';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [unreadCounts, setUnreadCounts] = useState({});

  /**
   * Fetch user chats
   */
  const fetchChats = useCallback(async (status = null) => {
    try {
      setLoading(true);
      const response = await chatApi.getUserChats(status);
      setChats(response.chats || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create or get chat
   */
  const createChat = useCallback(async (subject = 'Support Request') => {
    try {
      setLoading(true);
      const response = await chatApi.createOrGetChat(subject);
      const chat = response.chat;
      
      setChats((prev) => {
        const existing = prev.find((c) => c._id === chat._id);
        if (existing) {
          return prev;
        }
        return [chat, ...prev];
      });

      return chat;
    } catch (err) {
      setError(err.message);
      console.error('Error creating chat:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch messages for a chat
   */
  const fetchMessages = useCallback(async (chatId, limit = 50, skip = 0) => {
    try {
      setLoading(true);
      const response = await chatApi.getChatMessages(chatId, limit, skip);
      setMessages(response.messages || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Open a chat
   */
  const openChat = useCallback(async (chat) => {
    setCurrentChat(chat);
    socketService.joinChat(chat._id);
    await fetchMessages(chat._id);
    await chatApi.markMessagesAsSeen(chat._id);
  }, [fetchMessages]);

  /**
   * Close current chat
   */
  const closeChat = useCallback(() => {
    if (currentChat) {
      socketService.leaveChat(currentChat._id);
    }
    setCurrentChat(null);
    setMessages([]);
  }, [currentChat]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (message, messageType = 'text', fileData = null) => {
      if (!currentChat || !message.trim()) return;

      try {
        socketService.sendMessage(currentChat._id, message, messageType, fileData);
      } catch (err) {
        setError(err.message);
        console.error('Error sending message:', err);
      }
    },
    [currentChat]
  );

  /**
   * Handle incoming message
   */
  const handleMessageReceived = useCallback((data) => {
    setMessages((prev) => [...prev, data]);

    // Update chat's last message
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === data.chatId
          ? {
              ...chat,
              lastMessage: data.message,
              lastMessageTime: new Date(),
              lastMessageSender: data.senderType
            }
          : chat
      )
    );
  }, []);

  /**
   * Handle typing indicator
   */
  const handleUserTyping = useCallback((data) => {
    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      if (data.isTyping) {
        newMap.set(data.userId, data.userName);
      } else {
        newMap.delete(data.userId);
      }
      return newMap;
    });
  }, []);

  /**
   * Handle user online status
   */
  const handleUserOnline = useCallback((data) => {
    setOnlineUsers((prev) => new Map(prev).set(data.userId, true));
  }, []);

  /**
   * Handle user offline status
   */
  const handleUserOffline = useCallback((data) => {
    setOnlineUsers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(data.userId);
      return newMap;
    });
  }, []);

  /**
   * Handle messages seen
   */
  const handleMessagesSeen = useCallback((data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        data.messageIds.includes(msg._id)
          ? { ...msg, seen: true }
          : msg
      )
    );
  }, []);

  // Setup socket listeners
  useEffect(() => {
    const unsubscribes = [
      socketService.on('messageReceived', handleMessageReceived),
      socketService.on('userTyping', handleUserTyping),
      socketService.on('userOnline', handleUserOnline),
      socketService.on('userOffline', handleUserOffline),
      socketService.on('messagesSeen', handleMessagesSeen)
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [
    handleMessageReceived,
    handleUserTyping,
    handleUserOnline,
    handleUserOffline,
    handleMessagesSeen
  ]);

  const value = {
    // State
    chats,
    currentChat,
    messages,
    loading,
    error,
    typingUsers,
    onlineUsers,
    unreadCounts,

    // Methods
    fetchChats,
    createChat,
    fetchMessages,
    openChat,
    closeChat,
    sendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to use chat context
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
