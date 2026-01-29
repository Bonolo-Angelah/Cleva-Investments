const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'create_goal',
      'update_goal',
      'delete_goal',
      'create_portfolio',
      'update_portfolio',
      'delete_portfolio',
      'add_transaction',
      'delete_transaction',
      'chat_message',
      'view_recommendations',
      'export_report',
      'update_profile',
      'change_password',
      'enable_2fa',
      'disable_2fa',
      'view_market_data',
      'search_stock',
      'admin_access',
      'generate_report'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'error'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });
ActivityLogSchema.index({ status: 1, timestamp: -1 });

// Static method to log activity
ActivityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Static method to get recent activity
ActivityLogSchema.statics.getRecentActivity = async function(limit = 50) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get user activity
ActivityLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get activity by date range
ActivityLogSchema.statics.getActivityByDateRange = async function(startDate, endDate) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ timestamp: -1 })
  .lean();
};

// Static method to get activity statistics
ActivityLogSchema.statics.getStatistics = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
