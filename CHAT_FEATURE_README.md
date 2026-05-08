# Real-Time Support Chat System - Setup Guide

## Overview

This is a complete real-time customer support chat system built with React, Node.js, Express, MongoDB, and Socket.IO. It allows users to communicate with support agents in real-time, with features like typing indicators, online status, message seen status, and a full support dashboard for managing conversations.

## Features

### User Features
- ✅ Real-time messaging with support team
- ✅ Chat history persistence
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message read receipts (seen/delivered)
- ✅ Unread message count
- ✅ Multiple chat support
- ✅ Message timestamps
- ✅ Responsive mobile-friendly UI
- ✅ Clean modern design with Shadcn UI

### Admin/Support Features
- ✅ View all active chats
- ✅ Manage multiple conversations
- ✅ Assign agents to chats
- ✅ Update chat status (active, pending, resolved, closed)
- ✅ Set priority levels (low, medium, high, urgent)
- ✅ Add internal notes
- ✅ Search and filter chats
- ✅ View unread messages
- ✅ Chat statistics dashboard
- ✅ User online/offline status

### Technical Features
- ✅ JWT authentication
- ✅ Secure Socket.IO connections
- ✅ Room-based communication
- ✅ Real-time event handling
- ✅ Scalable architecture
- ✅ Error handling and validation
- ✅ Database persistence
- ✅ Automatic reconnection

## Project Structure

### Backend Structure
```
backend/
├── controllers/
│   └── chatController.js       # Chat API logic
├── models/
│   ├── Chat.js                 # Chat schema
│   ├── Message.js              # Message schema
│   └── User.js                 # User schema
├── routes/
│   ├── auth.js                 # Auth routes
│   ├── courses.js              # Course routes
│   └── chat.js                 # Chat routes
├── socket/
│   └── socketHandler.js        # Socket.IO event handlers
├── middleware/
│   └── auth.js                 # JWT authentication
├── database.js                 # MongoDB connection
├── server.js                   # Express server with Socket.IO
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx          # Main chat UI
│   │   │   ├── ChatSidebar.jsx         # Chat list
│   │   │   ├── MessageBubble.jsx       # Message display
│   │   │   ├── SupportChatWindow.jsx   # Admin chat UI
│   │   │   ├── SupportPopup.jsx        # Chat popup button
│   │   │   ├── TypingIndicator.jsx     # Typing animation
│   │   │   └── OnlineStatus.jsx        # Online status
│   │   └── ...other components
│   ├── contexts/
│   │   ├── AuthContext.jsx             # Auth + Socket connection
│   │   └── ChatContext.jsx             # Chat state management
│   ├── services/
│   │   ├── socketService.js            # Socket.IO client
│   │   ├── chatApi.js                  # Chat API calls
│   │   └── api.ts                      # General API
│   ├── pages/
│   │   ├── Dashboard.jsx               # User dashboard
│   │   ├── support/
│   │   │   └── SupportDashboard.jsx    # Admin dashboard
│   │   └── ...other pages
│   ├── App.jsx                         # Main app with routes
│   └── ...other files
└── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file**
   ```env
   PORT=5005
   MONGODB_URI=mongodb://localhost:27017/courseforge
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5005`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env.local file**
   ```env
   VITE_API_URL=http://localhost:5005/api
   VITE_SOCKET_URL=http://localhost:5005
   ```

3. **Start Frontend Dev Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## API Endpoints

### Chat Endpoints

#### User Routes (Requires Authentication)

**Create or Get Chat**
```http
POST /api/chat/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "subject": "Support Request"
}
```

**Get User's Chats**
```http
GET /api/chat/my-chats?status=active&limit=50&skip=0
Authorization: Bearer <token>
```

**Get Chat Messages**
```http
GET /api/chat/:chatId/messages?limit=50&skip=0
Authorization: Bearer <token>
```

**Send Message**
```http
POST /api/chat/:chatId/send-message
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Hello, I need help",
  "messageType": "text"
}
```

**Mark Messages as Seen**
```http
PUT /api/chat/:chatId/mark-seen
Authorization: Bearer <token>
```

**Get Unread Count**
```http
GET /api/chat/:chatId/unread-count
Authorization: Bearer <token>
```

**Delete Chat**
```http
DELETE /api/chat/:chatId
Authorization: Bearer <token>
```

#### Support Agent Routes

**Get All Support Chats**
```http
GET /api/chat/support/all-chats?status=active&search=user&limit=50
Authorization: Bearer <token>
```

**Update Chat Status**
```http
PUT /api/chat/:chatId/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "resolved",
  "priority": "high",
  "notes": "Internal notes"
}
```

**Assign Agent to Chat**
```http
PUT /api/chat/:chatId/assign-agent
Content-Type: application/json
Authorization: Bearer <token>

{
  "agentId": "agent-id"
}
```

**Get Chat Statistics**
```http
GET /api/chat/support/stats
Authorization: Bearer <token>
```

## Socket.IO Events

### Client to Server Events

**Join Chat**
```javascript
socket.emit('joinChat', chatId);
```

**Send Message**
```javascript
socket.emit('sendMessage', {
  chatId: 'chat-id',
  message: 'Hello',
  messageType: 'text',
  fileUrl: null,
  fileName: null,
  fileSize: null
});
```

**Typing Indicator**
```javascript
socket.emit('typing', chatId);
socket.emit('stopTyping', chatId);
```

**Mark Messages as Seen**
```javascript
socket.emit('markAsSeen', {
  chatId: 'chat-id',
  messageIds: ['msg-id-1', 'msg-id-2']
});
```

**Join Support Dashboard**
```javascript
socket.emit('joinSupportDashboard');
```

**Assign Agent**
```javascript
socket.emit('assignAgent', {
  chatId: 'chat-id',
  agentId: 'agent-id'
});
```

**Update Chat Status**
```javascript
socket.emit('updateChatStatus', {
  chatId: 'chat-id',
  status: 'resolved',
  priority: 'high'
});
```

### Server to Client Events

**Message Received**
```javascript
socket.on('messageReceived', {
  _id: 'message-id',
  chatId: 'chat-id',
  senderId: 'user-id',
  senderType: 'user',
  senderName: 'John Doe',
  message: 'Hello',
  messageType: 'text',
  timestamp: '2024-01-01T12:00:00Z',
  seen: false
});
```

**User Typing**
```javascript
socket.on('userTyping', {
  userId: 'user-id',
  userName: 'John',
  isTyping: true
});
```

**User Online/Offline**
```javascript
socket.on('userOnline', {
  userId: 'user-id',
  userName: 'John',
  userType: 'user'
});

socket.on('userOffline', {
  userId: 'user-id',
  userName: 'John'
});
```

**Messages Seen**
```javascript
socket.on('messagesSeen', {
  chatId: 'chat-id',
  messageIds: ['msg-id-1', 'msg-id-2'],
  seenBy: 'John Doe'
});
```

**Agent Assigned**
```javascript
socket.on('agentAssigned', {
  agentId: 'agent-id',
  agentName: 'Support Agent'
});
```

**Chat Status Updated**
```javascript
socket.on('chatStatusUpdated', {
  chatId: 'chat-id',
  status: 'resolved',
  priority: 'high'
});
```

## Database Schemas

### Chat Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                    // Reference to User
  supportAgent: ObjectId,              // Reference to Support Agent User
  subject: String,
  status: 'active' | 'pending' | 'resolved' | 'closed',
  unreadUserCount: Number,
  unreadAgentCount: Number,
  lastMessage: String,
  lastMessageTime: Date,
  lastMessageSender: 'user' | 'agent',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  tags: [String],
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date,
  closedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  chatId: ObjectId,                    // Reference to Chat
  senderId: ObjectId,                  // Reference to User
  senderType: 'user' | 'agent',
  senderName: String,
  senderEmail: String,
  message: String,
  messageType: 'text' | 'image' | 'file' | 'system',
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  seen: Boolean,
  seenAt: Date,
  delivered: Boolean,
  deliveredAt: Date,
  edited: Boolean,
  editedAt: Date,
  reactions: Map<String, [ObjectId]>,
  createdAt: Date
}
```

## Usage Examples

### For Users

1. **Open Support Chat**
   - Click the support button (bottom-right corner of dashboard)
   - Chat window opens with support team

2. **Send Message**
   - Type your message
   - Press Enter or click Send button
   - Message appears in real-time

3. **View Chat History**
   - Click "View All Chats" to see all your support conversations
   - Select any chat to continue conversation

4. **Manage Chats**
   - See unread message count
   - View online/offline status
   - See message timestamps

### For Support Agents

1. **Access Support Dashboard**
   - Navigate to `/support` route
   - View all customer chats

2. **Manage Conversations**
   - Click on a chat to open it
   - Read customer messages
   - Reply in real-time

3. **Update Chat Status**
   - Mark chat as pending, resolved, or closed
   - Set priority levels
   - Add internal notes

4. **View Statistics**
   - See total chats count
   - Monitor active conversations
   - Track resolution metrics

## Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Login/Register**: User receives JWT token
2. **Socket Connection**: Token passed in socket handshake
3. **API Requests**: Token sent in Authorization header
4. **Token Validation**: Backend validates all socket and HTTP requests

## Security Features

- ✅ JWT authentication on all endpoints
- ✅ Secure Socket.IO connection validation
- ✅ Authorization checks for chat access
- ✅ Input validation and sanitization
- ✅ CORS enabled for specified frontend
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting ready (can be added)

## Environment Variables

### Backend (.env)
```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/courseforge
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5005/api
VITE_SOCKET_URL=http://localhost:5005
```

## Troubleshooting

### Socket Connection Issues
- Ensure backend is running on correct port
- Check CORS settings in server.js
- Verify JWT token is valid
- Check socket URL in .env.local

### Messages Not Sending
- Verify socket is connected
- Check message is not empty
- Ensure user has access to chat
- Check browser console for errors

### Chat Not Loading
- Verify user is authenticated
- Check database connection
- Verify chat ID is correct
- Check MongoDB indexes

### Real-Time Updates Not Working
- Ensure Socket.IO is connected
- Check socket listeners are registered
- Verify events are being emitted
- Check browser DevTools Network tab

## Performance Optimization

1. **Message Pagination**: Load messages in batches
2. **Socket Rooms**: Users only receive messages for their chats
3. **Database Indexing**: Indexes on userId, chatId, createdAt
4. **UI Optimization**: React.memo for components, useCallback hooks
5. **Image Optimization**: Lazy load message images

## Future Enhancements

- [ ] File uploads with S3
- [ ] Video/audio calls
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Canned responses
- [ ] Chat export/download
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Chatbot integration
- [ ] Message encryption

## Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or DigitalOcean
- Set production environment variables
- Use MongoDB Atlas for database
- Enable HTTPS for secure socket connections

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or GitHub Pages
- Update API and Socket URLs for production
- Enable HTTPS

## Support & Issues

For issues or questions:
1. Check logs: `npm run dev`
2. Verify database connection
3. Check Socket.IO connection in browser DevTools
4. Review error messages in console

## License

This project is part of CourseForge AI

## Authors

CourseForge Development Team
