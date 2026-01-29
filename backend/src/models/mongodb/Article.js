const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  publishedAt: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  content: {
    type: String
  },
  imageUrl: {
    type: String
  },
  relatedSymbols: [{
    type: String,
    uppercase: true
  }],
  category: {
    type: String,
    enum: ['market_news', 'company_news', 'analysis', 'earnings', 'economic_data', 'general']
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative']
  },
  tags: [String],
  verified: {
    type: Boolean,
    default: false
  },
  verificationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
ArticleSchema.index({ relatedSymbols: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, publishedAt: -1 });
ArticleSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);
