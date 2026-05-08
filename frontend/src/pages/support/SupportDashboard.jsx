import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Phone,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import * as chatApi from '../../services/chatApi';
import socketService from '../../services/socketService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import SupportChatWindow from '../../components/chat/SupportChatWindow';

const SupportDashboard = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  // Fetch chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getSupportChats({
        status: filter,
        search: search || undefined,
        limit: 100
      });
      setChats(response.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await chatApi.getChatStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load and refresh
  useEffect(() => {
    fetchChats();
    fetchStats();

    // Join support dashboard
    socketService.joinSupportDashboard();

    return () => {
      socketService.leaveSupportDashboard();
    };
  }, []);

  // Refetch on filter/search change
  useEffect(() => {
    fetchChats();
  }, [filter, search]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = socketService.on('newMessage', (data) => {
      // Refresh chats to show new message
      fetchChats();
    });

    return () => unsubscribe();
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle size={16} className="text-red-500" />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Chat List */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Support Dashboard
          </h1>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-2 top-2.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter size={18} />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {['active', 'pending', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-4 bg-gray-50 border-b grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Active</p>
              <p className="text-xl font-bold text-blue-600">{stats.activeChats}</p>
            </div>
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalChats}</p>
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No chats found
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`w-full p-4 border-b hover:bg-gray-50 transition text-left ${
                  selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {chat.userId?.name}
                      </p>
                      {getPriorityIcon(chat.priority)}
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage || 'No messages'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>

                      <span className="text-xs text-gray-500">
                        {format(new Date(chat.lastMessageTime), 'HH:mm')}
                      </span>

                      {chat.unreadAgentCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadAgentCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <SupportChatWindow
            chat={selectedChat}
            onClose={handleCloseChat}
            onChatUpdate={fetchChats}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a chat to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
