import api from './api';

/**
 * Create or get a chat
 */
export const createOrGetChat = async (subject = 'Support Request') => {
  const response = await api.post('/chat/create', { subject });
  return response.data;
};

/**
 * Get all chats for current user
 */
export const getUserChats = async (status = null, limit = 50, skip = 0) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('limit', limit);
  params.append('skip', skip);

  const response = await api.get(`/chat/my-chats?${params}`);
  return response.data;
};

/**
 * Get all chats for support dashboard
 */
export const getSupportChats = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.supportAgent) params.append('supportAgent', filters.supportAgent);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.skip) params.append('skip', filters.skip);

  const response = await api.get(`/chat/support/all-chats?${params}`);
  return response.data;
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (chatId, limit = 50, skip = 0) => {
  const response = await api.get(`/chat/${chatId}/messages?limit=${limit}&skip=${skip}`);
  return response.data;
};

/**
 * Send a message
 */
export const sendMessage = async (chatId, message, messageType = 'text', fileData = null) => {
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

  const response = await api.post(`/chat/${chatId}/send-message`, payload);
  return response.data;
};

/**
 * Mark messages as seen
 */
export const markMessagesAsSeen = async (chatId) => {
  const response = await api.put(`/chat/${chatId}/mark-seen`, {});
  return response.data;
};

/**
 * Get unread count for a chat
 */
export const getUnreadCount = async (chatId) => {
  const response = await api.get(`/chat/${chatId}/unread-count`);
  return response.data;
};

/**
 * Update chat status
 */
export const updateChatStatus = async (chatId, status, priority = null, notes = null) => {
  const payload = { status };
  if (priority) payload.priority = priority;
  if (notes !== null) payload.notes = notes;

  const response = await api.put(`/chat/${chatId}/status`, payload);
  return response.data;
};

/**
 * Assign agent to chat
 */
export const assignAgentToChat = async (chatId, agentId) => {
  const response = await api.put(`/chat/${chatId}/assign-agent`, { agentId });
  return response.data;
};

/**
 * Get chat statistics
 */
export const getChatStats = async () => {
  const response = await api.get('/chat/support/stats');
  return response.data;
};

/**
 * Delete a chat
 */
export const deleteChat = async (chatId) => {
  const response = await api.delete(`/chat/${chatId}`);
  return response.data;
};
