import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Plus, ChevronDown } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';
import ChatSidebar from './ChatSidebar';
import { Button } from '../ui/button';
import socketService from '../../services/socketService';

const SupportPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { chats, currentChat, createChat, openChat, closeChat, fetchChats } =
    useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleOpenChat = async () => {
    try {
      if (chats.length > 0) {
        // Open most recent chat
        await openChat(chats[0]);
      } else {
        // Create new chat
        const newChat = await createChat();
        await openChat(newChat);
      }
      setIsOpen(true);
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createChat();
      await openChat(newChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    await openChat(chat);
    setShowSidebar(false);
  };

  return (
    <>
      {/* Chat Popup Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-40 flex items-center gap-2 group"
        >
          <MessageCircle size={24} />
          <span className="hidden group-hover:inline text-sm whitespace-nowrap mr-2">
            Help & Support
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] z-50 flex flex-col">
          {showSidebar ? (
            <ChatSidebar
              chats={chats}
              onSelectChat={handleSelectChat}
              onClose={() => setShowSidebar(false)}
              onNewChat={handleNewChat}
            />
          ) : (
            <>
              <div className="mb-2 flex gap-2">
                <Button
                  onClick={() => setShowSidebar(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ChevronDown size={16} className="mr-1" />
                  View All Chats
                </Button>
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={16} />
                </Button>
              </div>

              <ChatWindow
                chat={currentChat}
                onClose={() => {
                  closeChat();
                  setIsOpen(false);
                }}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportPopup;
