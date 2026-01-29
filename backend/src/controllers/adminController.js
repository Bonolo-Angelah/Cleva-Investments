const { User, Portfolio, Transaction, Goal } = require('../models/postgres');
const { ActivityLog, ChatHistory } = require('../models/mongodb');
const { Op } = require('sequelize');
const reportService = require('../services/reportService');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Total portfolios
    const totalPortfolios = await Portfolio.count();

    // Total transactions
    const totalTransactions = await Transaction.count();

    // Total goals
    const totalGoals = await Goal.count();

    // Active goals
    const activeGoals = await Goal.count({
      where: {
        status: 'active'
      }
    });

    // Completed goals
    const completedGoals = await Goal.count({
      where: {
        status: 'completed'
      }
    });

    // Total portfolio value across all users
    const portfolioStats = await Portfolio.findAll({
      attributes: [
        [Portfolio.sequelize.fn('SUM', Portfolio.sequelize.col('totalValue')), 'totalValue'],
        [Portfolio.sequelize.fn('SUM', Portfolio.sequelize.col('totalGainLoss')), 'totalGainLoss']
      ]
    });

    // Chat statistics
    const totalChatSessions = await ChatHistory.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentChatSessions = await ChatHistory.countDocuments({
      lastMessageAt: { $gte: sevenDaysAgo }
    });

    // Activity statistics (last 30 days)
    const activityStats = await ActivityLog.getStatistics(30);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      },
      portfolios: {
        total: totalPortfolios,
        totalValue: portfolioStats[0]?.dataValues?.totalValue || 0,
        totalGainLoss: portfolioStats[0]?.dataValues?.totalGainLoss || 0
      },
      transactions: {
        total: totalTransactions
      },
      goals: {
        total: totalGoals,
        active: activeGoals,
        completed: completedGoals,
        completionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(2) : 0
      },
      chat: {
        totalSessions: totalChatSessions,
        recentSessions: recentChatSessions
      },
      activityStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get recent activity logs
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 50, action, status } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;

    const activities = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ activities });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user details with related data
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's portfolios
    const portfolios = await Portfolio.findAll({
      where: { userId }
    });

    // Get user's goals
    const goals = await Goal.findAll({
      where: { userId }
    });

    // Get user's transactions count
    const transactionCount = await Transaction.count({
      where: { userId }
    });

    // Get user's activity logs
    const recentActivity = await ActivityLog.getUserActivity(userId, 20);

    res.json({
      user: user.toJSON(),
      portfolios,
      goals,
      transactionCount,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    // Log admin action
    await ActivityLog.logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'admin_access',
      description: `${isActive ? 'Activated' : 'Deactivated'} user ${user.email}`,
      metadata: { targetUserId: userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.json({ message: 'User status updated successfully', user: user.toJSON() });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    // Log admin action
    await ActivityLog.logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'admin_access',
      description: `Changed user ${user.email} role to ${role}`,
      metadata: { targetUserId: userId, newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    res.json({ message: 'User role updated successfully', user: user.toJSON() });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Get system health metrics
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      databases: {}
    };

    // Check PostgreSQL
    try {
      await User.sequelize.authenticate();
      health.databases.postgresql = { status: 'connected', type: 'PostgreSQL' };
    } catch (error) {
      health.databases.postgresql = { status: 'disconnected', error: error.message };
      health.status = 'unhealthy';
    }

    // Check MongoDB
    try {
      const mongoStatus = await ActivityLog.db.db.admin().ping();
      health.databases.mongodb = { status: 'connected', type: 'MongoDB' };
    } catch (error) {
      health.databases.mongodb = { status: 'disconnected', error: error.message };
      health.status = 'unhealthy';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
    };

    // Uptime
    health.uptime = `${(process.uptime() / 3600).toFixed(2)} hours`;

    res.json(health);

  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ error: 'Failed to check system health' });
  }
};

// Generate user activity report
const generateUserActivityReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate, userId, action, status } = req.query;

    if (!['pdf', 'csv', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be pdf, csv, or excel' });
    }

    const filters = { startDate, endDate, userId, action, status };
    const result = await reportService.generateUserActivityReport(format, filters);

    // Log report generation
    await ActivityLog.logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'generate_report',
      description: `Generated user activity report in ${format} format`,
      metadata: { reportType: 'user_activity', format, filters },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Send file
    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up file after sending (optional - or use cleanup cron)
    });

  } catch (error) {
    console.error('Error generating user activity report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate usage report
const generateUsageReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.query;

    if (!['pdf', 'csv', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be pdf, csv, or excel' });
    }

    const filters = { startDate, endDate };
    const result = await reportService.generateUsageReport(format, filters);

    // Log report generation
    await ActivityLog.logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'generate_report',
      description: `Generated usage report in ${format} format`,
      metadata: { reportType: 'usage', format, filters },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Send file
    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });

  } catch (error) {
    console.error('Error generating usage report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Generate system performance/audit report
const generatePerformanceReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.query;

    if (!['pdf', 'csv', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be pdf, csv, or excel' });
    }

    const filters = { startDate, endDate };
    const result = await reportService.generateSystemPerformanceReport(format, filters);

    // Log report generation
    await ActivityLog.logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'generate_report',
      description: `Generated system performance report in ${format} format`,
      metadata: { reportType: 'performance', format, filters },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Send file
    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });

  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  getSystemHealth,
  generateUserActivityReport,
  generateUsageReport,
  generatePerformanceReport
};
