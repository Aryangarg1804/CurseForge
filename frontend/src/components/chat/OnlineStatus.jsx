import React from 'react';
import { useChat } from '../../contexts/ChatContext';

const OnlineStatus = ({ userId }) => {
  const { onlineUsers } = useChat();

  if (!userId) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full" />
        Offline
      </div>
    );
  }

  const isOnline = onlineUsers.has(userId);

  return (
    <div className={`flex items-center gap-2 text-sm ${
      isOnline ? 'text-green-600' : 'text-gray-500'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`} />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

export default OnlineStatus;
