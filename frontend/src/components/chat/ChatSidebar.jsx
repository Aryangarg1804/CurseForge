import React from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';

const ChatSidebar = ({ chats, onSelectChat, onClose, onNewChat }) => {
  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-gray-900">Chats</h2>
        <div className="flex gap-2">
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="sm"
          >
            <Plus size={16} />
          </Button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats yet</p>
            <p className="text-sm mt-2">Create a new chat to get started</p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className="w-full p-4 border-b hover:bg-gray-50 transition text-left"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {chat.subject}
                </h3>
                <span className="text-xs text-gray-500">
                  {format(new Date(chat.lastMessageTime), 'HH:mm')}
                </span>
              </div>

              <p className="text-sm text-gray-600 truncate">
                {chat.lastMessage || 'No messages yet'}
              </p>

              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    chat.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : chat.status === 'resolved'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {chat.status}
                </span>

                {chat.unreadUserCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadUserCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
