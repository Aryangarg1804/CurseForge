# System Architecture & Visual Guide

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER (React Frontend)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │  Dashboard   │         │   Login      │                      │
│  │   Page       │         │   Page       │                      │
│  └──────┬───────┘         └──────────────┘                      │
│         │                                                        │
│         │ (Shows)                                               │
│         ▼                                                        │
│  ┌──────────────────────────────────────┐                       │
│  │   SupportPopup Component             │                       │
│  │  ┌────────────────────────────────┐  │                       │
│  │  │ [💬 Support Button] (Fixed)    │  │                       │
│  │  └────────────────────────────────┘  │                       │
│  │         │ (Click)                    │                       │
│  │         ▼                            │                       │
│  │  ┌────────────────────────────────┐  │                       │
│  │  │ ChatWindow Component            │  │                       │
│  │  │ ┌──────────────────────────┐   │  │                       │
│  │  │ │ Message Display Area     │   │  │                       │
│  │  │ │ ┌────────────────────┐   │   │  │                       │
│  │  │ │ │ Agent's Message    │   │   │  │                       │
│  │  │ │ ├────────────────────┤   │   │  │                       │
│  │  │ │ │ Your Message  ✓✓   │   │   │  │                       │
│  │  │ │ ├────────────────────┤   │   │  │                       │
│  │  │ │ │ Agent typing...    │   │   │  │                       │
│  │  │ │ └────────────────────┘   │   │  │                       │
│  │  │ └──────────────────────────┘   │  │                       │
│  │  │                                 │  │                       │
│  │  │ [Type message...] [📎] [😊] [➤] │  │                       │
│  │  └────────────────────────────────┘  │                       │
│  └──────────────────────────────────────┘                       │
│                                                                   │
│  ┌──────────────────────────────────────┐                       │
│  │   ChatContext (Global State)         │                       │
│  │   - messages: []                     │                       │
│  │   - chats: []                        │                       │
│  │   - typingUsers: Map                 │                       │
│  │   - onlineUsers: Map                 │                       │
│  └──────────────────────────────────────┘                       │
│                                                                   │
│  ┌──────────────────────────────────────┐                       │
│  │   Socket Service (Client)            │                       │
│  │   ├─ connect(token)                  │                       │
│  │   ├─ joinChat(chatId)                │                       │
│  │   ├─ sendMessage(data)               │                       │
│  │   └─ on(event, callback)             │                       │
│  └──────────────┬───────────────────────┘                       │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │ WebSocket Connection
                  │ (Bi-directional)
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                 ▼                                                │
│  ┌──────────────────────────────────────┐                       │
│  │  Socket.IO Server (Node.js)          │                       │
│  │  ┌────────────────────────────────┐  │                       │
│  │  │ Socket Handler                 │  │                       │
│  │  │ ├─ authentication              │  │                       │
│  │  │ ├─ joinChat event              │  │                       │
│  │  │ ├─ sendMessage event           │  │                       │
│  │  │ ├─ typing event                │  │                       │
│  │  │ └─ Room Management             │  │                       │
│  │  └────────────────────────────────┘  │                       │
│  └──────────────┬───────────────────────┘                       │
│                 │                                               │
│  ┌──────────────▼───────────────────────┐                       │
│  │  Express Server                      │                       │
│  │  ┌────────────────────────────────┐  │                       │
│  │  │ Chat Routes                    │  │                       │
│  │  │ ├─ POST /chat/create           │  │                       │
│  │  │ ├─ GET /chat/my-chats          │  │                       │
│  │  │ ├─ GET /chat/:id/messages      │  │                       │
│  │  │ ├─ POST /chat/:id/send-message │  │                       │
│  │  │ └─ PUT /chat/:id/status        │  │                       │
│  │  └────────────────────────────────┘  │                       │
│  └──────────────┬───────────────────────┘                       │
│                 │                                               │
│  ┌──────────────▼───────────────────────┐                       │
│  │  Chat Controller                     │                       │
│  │  ├─ createOrGetChat()                │                       │
│  │  ├─ sendMessage()                    │                       │
│  │  ├─ getChatMessages()                │                       │
│  │  ├─ updateChatStatus()               │                       │
│  │  └─ getChatStats()                   │                       │
│  └──────────────┬───────────────────────┘                       │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │ Mongoose ORM
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐                       │
│  │  MongoDB Database                    │                       │
│  │  ┌────────────────────────────────┐  │                       │
│  │  │ users collection               │  │                       │
│  │  │ courses collection             │  │                       │
│  │  │ chats collection ✨            │  │                       │
│  │  │ messages collection ✨         │  │                       │
│  │  └────────────────────────────────┘  │                       │
│  └──────────────────────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              SUPPORT DASHBOARD (Admin Browser)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐     ┌────────────────────────────────────┐  │
│  │  Chat List     │     │  SupportChatWindow                 │  │
│  │  ┌──────────┐  │     │  ┌──────────────────────────────┐  │  │
│  │  │ User 1   │  │     │  │ Messages from User           │  │  │
│  │  │ (3 unread)◀─┼─────┼─▶│ ┌────────────────────────┐    │  │  │
│  │  ├──────────┤  │     │  │ │ Hi, I need help        │    │  │  │
│  │  │ User 2   │  │     │  │ └────────────────────────┘    │  │  │
│  │  │ (1 unread)  │     │  │                               │  │  │
│  │  ├──────────┤  │     │  │ [Your reply here...]          │  │  │
│  │  │ User 3   │  │     │  │                               │  │  │
│  │  │ (URGENT) │  │     │  │ Status: [Active ▼]            │  │  │
│  │  └──────────┘  │     │  │ Priority: [High ▼]            │  │  │
│  │                │     │  │ Notes: [Add notes...]          │  │  │
│  │ [New Chat+]    │     │  │                               │  │  │
│  │ Search:_______│     │  │ [Send Reply...]                │  │  │
│  │ Status: [All ▼]    │  │ └──────────────────────────────┘  │  │
│  └────────────────┘     └────────────────────────────────────┘  │
│                                                                   │
│  Stats: Active: 12  │  Pending: 5  │  Resolved: 248             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
USER SENDS MESSAGE
├─ User types message
├─ User clicks Send
├─ Frontend validates input
├─ Socket emits 'sendMessage' event
└─ Server receives
   ├─ Validates JWT token
   ├─ Checks authorization
   ├─ Saves to MongoDB
   ├─ Updates chat metadata
   └─ Emits to chat room
      ├─ User sees ✓ (delivered)
      ├─ Agent receives in real-time
      ├─ Browser notification (optional)
      └─ Unread badge appears in admin dashboard

AGENT REPLIES
├─ Agent types reply
├─ Types in SupportChatWindow
├─ Sees typing indicator
├─ Agent clicks Send
├─ Message sent to user instantly
├─ Socket emits 'messageReceived' to user
├─ User sees message appear
├─ Unread badge appears on user side
└─ User can mark as read
   ├─ Socket emits 'markAsSeen'
   ├─ Database updates seen status
   └─ Agent sees ✓✓ (read)
```

## 🔄 Message Lifecycle

```
1. CREATION
   Message Object Created
   {
     chatId, senderId, message, timestamp,
     messageType, senderType, seen: false
   }

2. VALIDATION
   ├─ JWT token valid?
   ├─ User authorized?
   ├─ Message not empty?
   └─ Chat exists?

3. STORAGE
   ├─ Save to MongoDB
   ├─ Update chat lastMessage
   └─ Increment unread count

4. BROADCAST
   ├─ Emit to chat room via Socket.IO
   ├─ Notify all users in room
   └─ Notify admin dashboard

5. DELIVERY
   ├─ Message appears in UI
   ├─ Timestamp added
   ├─ Delivery status: ✓
   └─ Auto-scroll to message

6. READING
   ├─ User views message
   ├─ Socket emits 'markAsSeen'
   ├─ Update database
   ├─ Unread count decreases
   └─ Seen status: ✓✓
```

## 🎯 Component Hierarchy

```
<App>
  ├─ <QueryClientProvider>
  ├─ <ThemeProvider>
  ├─ <AuthProvider>
  │  └─ <ChatProvider>
  │     ├─ <TooltipProvider>
  │     ├─ <BrowserRouter>
  │     │  ├─ <Navbar />
  │     │  ├─ <Routes>
  │     │  │  ├─ <Index />
  │     │  │  ├─ <Dashboard />
  │     │  │  ├─ <ProtectedRoute>
  │     │  │  │  └─ <SupportDashboard>
  │     │  │  │     ├─ Chat List
  │     │  │  │     └─ <SupportChatWindow />
  │     │  │  └─ <Login />
  │     │  └─ </Routes>
  │     └─ <SupportPopup>
  │        ├─ [Support Button]
  │        └─ <ChatWindow>
  │           ├─ <MessageBubble />
  │           ├─ <TypingIndicator />
  │           └─ <OnlineStatus />
  └─ </QueryClientProvider>
```

## 🔌 Event Flow Diagram

```
CLIENT SIDE:
1. User types → 'typing' event → Server
2. User stops → 'stopTyping' event → Server
3. Send message → 'sendMessage' event → Server
4. Read message → 'markAsSeen' event → Server

SERVER SIDE:
1. Receive 'sendMessage' → Validate → Save → Broadcast
   └─ Emit 'messageReceived' to room
   └─ Emit 'newMessage' to admin dashboard

2. Receive 'typing' → Broadcast to room
   └─ Emit 'userTyping' to others

3. Receive 'markAsSeen' → Update DB → Broadcast
   └─ Emit 'messagesSeen' to room

CLIENT SIDE (RECEPTION):
1. Receive 'messageReceived' → Update state → Render
2. Receive 'userTyping' → Show indicator
3. Receive 'messagesSeen' → Update read status
4. Receive 'userOnline/userOffline' → Update status
```

## 📱 UI Layout

### User Chat (Popup)
```
┌─────────────────────────────────┐
│ Support Team            [X]     │  Header
├─────────────────────────────────┤
│ 🟢 Online                       │  Status
├─────────────────────────────────┤
│                                 │
│  Agent: Hi! How can I help?     │  Messages
│  ┌─────────────────────────────┐│
│  │ You: I need technical help  ││
│  └─────────────────────────────┘│
│                                 │
│  Agent typing...                │  Typing Indicator
│                                 │
├─────────────────────────────────┤
│ [📎] [Type...      ] [😊] [➤] │  Input
└─────────────────────────────────┘
```

### Admin Dashboard (Full Page)
```
┌────────────────────────────────────────────────┐
│ Support Dashboard                              │
├──────────────────┬──────────────────────────────┤
│ Search: _____    │                              │
│ [Active] [Pending] [Resolved]                  │
│                  │  Status: [Active ▼]         │
│ Chats:          │  Priority: [High ▼]          │
│ ┌──────────────┐│                              │
│ │ John Doe     ││ John Doe                     │
│ │ "I need help"││ john@email.com               │
│ │ (3 unread)   ││                              │
│ ├──────────────┤│ Messages:                    │
│ │ Jane Smith   ││ [Chat content here]          │
│ │ "Bug report" ││                              │
│ │ [URGENT]     ││ [Type reply...    ] [Send]   │
│ └──────────────┘│ Notes: [Add notes...]        │
│                  │                              │
│ Stats:          │                              │
│ Active: 12      │                              │
│ Total: 248      │                              │
└────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
1. USER LOGIN
   ├─ Submit credentials
   ├─ Backend validates
   ├─ Generate JWT token
   └─ Frontend stores token in localStorage

2. SOCKET CONNECTION
   ├─ Frontend reads token
   ├─ Socket connects with token in auth header
   ├─ Server verifies JWT
   ├─ Socket authenticated
   └─ User can now send/receive messages

3. API REQUESTS
   ├─ Include JWT in Authorization header
   ├─ Server validates token
   ├─ Check user permissions
   └─ Return data or error

4. USER LOGOUT
   ├─ Clear JWT from localStorage
   ├─ Socket disconnects
   └─ User returned to login
```

## 💾 Database Structure

```
users
├─ _id: ObjectId
├─ email: String
├─ name: String
├─ password: String (hashed)
└─ createdAt: Date

chats
├─ _id: ObjectId
├─ userId: ObjectId (ref: users)
├─ supportAgent: ObjectId (ref: users)
├─ subject: String
├─ status: String (active|pending|resolved|closed)
├─ priority: String (low|medium|high|urgent)
├─ lastMessage: String
├─ lastMessageTime: Date
├─ unreadUserCount: Number
├─ unreadAgentCount: Number
├─ notes: String
├─ tags: [String]
├─ createdAt: Date
├─ updatedAt: Date
├─ resolvedAt: Date
└─ closedAt: Date

messages
├─ _id: ObjectId
├─ chatId: ObjectId (ref: chats)
├─ senderId: ObjectId (ref: users)
├─ senderType: String (user|agent)
├─ senderName: String
├─ message: String
├─ messageType: String (text|image|file|system)
├─ seen: Boolean
├─ seenAt: Date
├─ delivered: Boolean
├─ deliveredAt: Date
├─ fileUrl: String
├─ fileName: String
├─ fileSize: Number
├─ reactions: Map<String, [ObjectId]>
└─ createdAt: Date
```

## 🚀 Deployment Architecture

```
Production Environment:

┌────────────────────────────────────────────────┐
│  CDN (Static Assets)                           │
│  └─ CSS, Images, Fonts                         │
└────────────────────────────────────────────────┘
          ↑
┌────────────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)                     │
│  └─ React App (https://courseforge.com)        │
└────────────────────────────────────────────────┘
          ↓ HTTPS
┌────────────────────────────────────────────────┐
│  Load Balancer (Nginx)                         │
└────────────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────────────┐
│  Backend Instances (Docker/Containers)         │
│  ├─ Express + Socket.IO Server #1              │
│  ├─ Express + Socket.IO Server #2              │
│  └─ Express + Socket.IO Server #3              │
└────────────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────────────┐
│  MongoDB Atlas (Cloud)                         │
│  ├─ Primary Replica Set                        │
│  ├─ Secondary Replicas                         │
│  └─ Automated Backups                          │
└────────────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────────────┐
│  Redis Cache (Optional)                        │
│  └─ Session Storage & Caching                  │
└────────────────────────────────────────────────┘
```

---

This visual guide helps understand how all components work together in the real-time support chat system!
