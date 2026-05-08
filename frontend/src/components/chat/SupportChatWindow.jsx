import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Paperclip,
  MoreVertical,
  Flag,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import * as chatApi from '../../services/chatApi';
import socketService from '../../services/socketService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';

const SupportChatWindow = ({ chat, onClose, onChatUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [chatStatus, setChatStatus] = useState(chat.status);
  const [priority, setPriority] = useState(chat.priority);
  const [notes, setNotes] = useState(chat.notes || '');
  const [showNotes, setShowNotes] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getChatMessages(chat._id);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessages();
    socketService.joinChat(chat._id);

    return () => {
      socketService.leaveChat(chat._id);
    };
  }, [chat._id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = socketService.on('messageReceived', (data) => {
      if (data.chatId === chat._id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => unsubscribe();
  }, [chat._id]);

  // Listen for typing
  useEffect(() => {
    const unsubscribe = socketService.on('userTyping', (data) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          newMap.set(data.userId, data.userName);
        } else {
          newMap.delete(data.userId);
        }
        return newMap;
      });
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const text = messageText;
    setMessageText('');

    try {
      socketService.sendMessage(chat._id, text);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(text); // Restore message on error
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await chatApi.updateChatStatus(chat._id, newStatus, priority, notes);
      setChatStatus(newStatus);
      onChatUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await chatApi.updateChatStatus(chat._id, chatStatus, priority, notes);
      setShowNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {chat.userId?.name}
          </h2>
          <p className="text-sm text-gray-600">{chat.userId?.email}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone size={18} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Flag size={16} className="mr-2" />
                Mark as High Priority
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive size={16} className="mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Status and Info */}
      <div className="flex gap-4 p-4 bg-gray-50 border-b text-sm">
        <div>
          <span className="text-gray-600">Status:</span>
          <div className="flex gap-2 mt-1">
            {['active', 'pending', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateStatus(status)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  chatStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-gray-600">Priority:</span>
          <div className="flex gap-2 mt-1">
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  priority === p
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-4 bg-blue-50 text-sm">
        <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-900">
            <span className="font-semibold">Created:</span> {format(new Date(chat.createdAt), 'PPp')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderType === 'agent'}
            />
          ))
        )}

        {typingUsers.size > 0 && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Notes */}
      {showNotes && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-900">Notes</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleUpdateNotes}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Save Notes
            </Button>
            <Button
              onClick={() => setShowNotes(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        {!showNotes && (
          <Button
            onClick={() => setShowNotes(true)}
            variant="outline"
            size="sm"
            className="mb-2 w-full"
          >
            Add Notes
          </Button>
        )}

        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Paperclip size={20} className="text-gray-600" />
          </button>

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Reply to this chat..."
            rows="1"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

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

export default SupportChatWindow;
