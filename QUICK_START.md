# Quick Start Guide - Real-Time Support Chat System

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Make sure MongoDB is running

# Start backend server
npm run dev
```

✅ Backend running on `http://localhost:5005`

### Step 2: Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start frontend dev server
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 3: Test the Chat System

1. **Open browser**: `http://localhost:5173`
2. **Login/Register** with a test account
3. **Navigate to Dashboard**: You'll see a support button in bottom-right
4. **Click Support Button**: Opens the chat popup
5. **Send a message**: Test real-time messaging

### Step 4: Access Support Dashboard (Admin)

1. **Go to**: `http://localhost:5173/support`
2. **View all customer chats**
3. **Reply to messages in real-time**
4. **Manage chat status and priority**

## 📋 Key Features to Try

### User Features
- [ ] Send/receive real-time messages
- [ ] See typing indicators
- [ ] View online/offline status
- [ ] Check message delivery status
- [ ] Browse chat history
- [ ] Multiple support conversations

### Admin Features
- [ ] View all active chats
- [ ] Reply to customers
- [ ] Update chat status
- [ ] Set priority levels
- [ ] Add internal notes
- [ ] Search and filter chats
- [ ] View chat statistics

## 🔧 Environment Setup

### Create .env in `/backend`
```
PORT=5005
MONGODB_URI=mongodb://localhost:27017/courseforge
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Create .env.local in `/frontend`
```
VITE_API_URL=http://localhost:5005/api
VITE_SOCKET_URL=http://localhost:5005
```

## 📚 Project Files Overview

### New Backend Files
```
backend/
├── models/Chat.js              ✨ Chat data model
├── models/Message.js           ✨ Message data model
├── controllers/chatController.js ✨ API logic
├── routes/chat.js              ✨ API routes
└── socket/socketHandler.js     ✨ Real-time events
```

### New Frontend Files
```
frontend/src/
├── contexts/ChatContext.jsx    ✨ Chat state management
├── services/
│   ├── socketService.js        ✨ Socket.IO client
│   └── chatApi.js              ✨ Chat API calls
├── components/chat/
│   ├── ChatWindow.jsx          ✨ User chat UI
│   ├── ChatSidebar.jsx         ✨ Chat list
│   ├── SupportPopup.jsx        ✨ Chat popup button
│   ├── SupportChatWindow.jsx   ✨ Admin chat UI
│   ├── MessageBubble.jsx       ✨ Message display
│   ├── TypingIndicator.jsx     ✨ Typing animation
│   └── OnlineStatus.jsx        ✨ Online status
└── pages/support/
    └── SupportDashboard.jsx    ✨ Admin dashboard
```

## 🔄 How It Works

### User Sends Message
1. User types message → clicks Send
2. Socket.IO sends message in real-time
3. Backend stores in MongoDB
4. Message appears in agent's dashboard
5. Agent sees notification

### Agent Replies
1. Agent types in dashboard → clicks Send
2. Socket.IO sends reply in real-time
3. Message appears in user's chat popup
4. User sees notification badge

### Real-Time Features
- **Typing Indicators**: Shows when someone is typing
- **Online Status**: Shows if user/agent is online
- **Message Status**: Delivered → Seen
- **Unread Count**: Badge shows unread messages

## 🛠️ Debugging

### Check Backend Logs
```bash
cd backend
npm run dev
# Look for: "✅ Socket connected" and "💬 Message sent"
```

### Check Socket Connection
1. Open DevTools (F12)
2. Go to Console
3. Look for Socket.IO connection messages

### Common Issues

**Socket not connecting?**
- Ensure backend is running
- Check CORS settings
- Verify token is valid

**Messages not syncing?**
- Refresh the page
- Check MongoDB connection
- Look for errors in console

**Chat not loading?**
- Verify user is logged in
- Check network tab in DevTools
- Ensure MongoDB has data

## 📖 Full Documentation

See `CHAT_FEATURE_README.md` for:
- Complete API documentation
- Database schemas
- Socket.IO events reference
- Deployment instructions
- Security features
- Performance optimization

## 💡 Next Steps

1. **Test the system thoroughly**
2. **Customize styling** if needed
3. **Add file upload support** (optional)
4. **Deploy to production** when ready
5. **Monitor performance** and optimize

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Backend server running without errors
- [ ] Frontend loads at `localhost:5173`
- [ ] Can login/register successfully
- [ ] Support button appears on dashboard
- [ ] Can open chat and send messages
- [ ] Messages appear in real-time
- [ ] Admin dashboard accessible at `/support`
- [ ] Socket connection shows in DevTools
- [ ] Typing indicators work
- [ ] Online status updates

## 🎉 You're All Set!

Your real-time support chat system is now ready to use. Start chatting! 💬

For issues or questions, refer to `CHAT_FEATURE_README.md` troubleshooting section.
