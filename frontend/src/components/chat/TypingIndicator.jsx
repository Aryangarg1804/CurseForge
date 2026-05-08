import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gray-300 px-3 py-2 rounded-lg flex gap-1">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      <span className="text-sm text-gray-600">Typing...</span>
    </div>
  );
};

export default TypingIndicator;
