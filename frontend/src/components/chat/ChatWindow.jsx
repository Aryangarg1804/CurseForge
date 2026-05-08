import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Smile, Phone, Video } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import OnlineStatus from './OnlineStatus';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import socketService from '../../services/socketService';

const ChatWindow = ({ chat, onClose }) => {
  const { messages, typingUsers, onlineUsers, sendMessage } = useChat();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.emitTyping(chat._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(chat._id);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setMessageText('');
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await sendMessage(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {chat.supportAgent?.name || 'Support Team'}
            </h3>
            <OnlineStatus userId={chat.supportAgent?._id} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation with support</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderType === 'user'}
            />
          ))
        )}

        {typingUsers.size > 0 && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Paperclip size={20} className="text-gray-600" />
          </button>

          <textarea
            value={messageText}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Smile size={20} className="text-gray-600" />
          </button>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
