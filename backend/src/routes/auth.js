const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Email verification
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authenticateToken, authController.resendVerificationEmail);

// Password reset
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// 2FA routes
router.post('/verify-2fa', authController.verify2FA);
router.post('/setup-2fa', authenticateToken, authController.setup2FA);
router.post('/enable-2fa', authenticateToken, authController.enable2FA);
router.post('/disable-2fa', authenticateToken, authController.disable2FA);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
