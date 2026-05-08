import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {message.messageType === 'text' && (
          <p className="break-words">{message.message}</p>
        )}

        {message.messageType === 'image' && (
          <img
            src={message.fileUrl}
            alt="Shared image"
            className="max-w-xs rounded"
          />
        )}

        {message.messageType === 'file' && (
          <div className="flex items-center gap-2">
            <span>📎</span>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${
                isOwn ? 'text-blue-100' : 'text-blue-600'
              }`}
            >
              {message.fileName}
            </a>
          </div>
        )}

        <div
          className={`text-xs mt-1 flex items-center justify-end gap-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {format(new Date(message.createdAt), 'HH:mm')}
          {isOwn && (
            message.seen ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
