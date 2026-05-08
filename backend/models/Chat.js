import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  supportAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  subject: {
    type: String,
    default: 'Support Request'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'resolved', 'closed'],
    default: 'active',
    index: true
  },
  unreadUserCount: {
    type: Number,
    default: 0
  },
  unreadAgentCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: String,
    default: null
  },
  lastMessageTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastMessageSender: {
    type: String,
    enum: ['user', 'agent'],
    default: 'user'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  closedAt: Date
});

// Auto-update updatedAt field
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for finding chats by userId or supportAgent
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ supportAgent: 1, status: 1 });

export const Chat = mongoose.model('Chat', chatSchema);
