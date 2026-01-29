const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Activity logs
router.get('/activity', adminController.getRecentActivity);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.patch('/users/:userId/role', adminController.updateUserRole);

// System health
router.get('/health', adminController.getSystemHealth);

// Report generation routes
// Query params: format (pdf|csv|excel), startDate, endDate, userId, action, status
router.get('/reports/activity', adminController.generateUserActivityReport);

// Query params: format (pdf|csv|excel), startDate, endDate
router.get('/reports/usage', adminController.generateUsageReport);

// Query params: format (pdf|csv|excel), startDate, endDate
router.get('/reports/performance', adminController.generatePerformanceReport);

module.exports = router;
