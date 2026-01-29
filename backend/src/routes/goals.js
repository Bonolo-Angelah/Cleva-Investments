const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.get('/:id/recommendations', goalController.getGoalRecommendations);

module.exports = router;
