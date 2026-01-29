const mongoose = require('mongoose');

const MarketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['stock', 'etf', 'mutual_fund', 'crypto', 'bond', 'commodity', 'real_estate'],
    required: true
  },
  exchange: {
    type: String
  },
  currentPrice: {
    type: Number,
    required: true
  },
  priceChange: {
    type: Number
  },
  priceChangePercent: {
    type: Number
  },
  volume: {
    type: Number
  },
  marketCap: {
    type: Number
  },
  peRatio: {
    type: Number
  },
  dividendYield: {
    type: Number
  },
  fiftyTwoWeekHigh: {
    type: Number
  },
  fiftyTwoWeekLow: {
    type: Number
  },
  performance: {
    oneDay: Number,
    oneWeek: Number,
    oneMonth: Number,
    threeMonths: Number,
    sixMonths: Number,
    oneYear: Number,
    threeYears: Number,
    fiveYears: Number
  },
  riskMetrics: {
    volatility: Number,
    beta: Number,
    sharpeRatio: Number
  },
  fundamentals: {
    revenue: Number,
    netIncome: Number,
    eps: Number,
    debtToEquity: Number,
    roe: Number
  },
  sector: {
    type: String
  },
  industry: {
    type: String
  },
  description: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    enum: ['alpha_vantage', 'fmp', 'finnhub', 'manual']
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
MarketDataSchema.index({ symbol: 1, type: 1 });
MarketDataSchema.index({ lastUpdated: -1 });
MarketDataSchema.index({ type: 1, 'performance.oneYear': -1 });

module.exports = mongoose.model('MarketData', MarketDataSchema);
