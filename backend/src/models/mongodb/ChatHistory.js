const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    investments_mentioned: [String],
    sentiment: String,
    audio_url: String
  }
});

const ChatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [MessageSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  summary: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
ChatHistorySchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
