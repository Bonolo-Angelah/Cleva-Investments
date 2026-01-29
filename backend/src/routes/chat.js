const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.post('/message', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.get('/session', chatController.getActiveSession);
router.post('/session', chatController.createSession);
router.put('/session/:sessionId/end', chatController.endSession);
router.get('/recommendations', chatController.getRecommendations);
router.post('/action', chatController.recordAction);

module.exports = router;
