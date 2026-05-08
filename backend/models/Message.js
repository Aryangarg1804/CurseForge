import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  senderType: {
    type: String,
    enum: ['user', 'agent'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: String,
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  seen: {
    type: Boolean,
    default: false
  },
  seenAt: Date,
  delivered: {
    type: Boolean,
    default: true
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  reactions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, seen: 1 });

export const Message = mongoose.model('Message', messageSchema);
