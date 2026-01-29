const { Goal } = require('../models/postgres');
const aiService = require('../services/aiService');

class GoalController {
  /**
   * Create a new goal
   */
  async createGoal(req, res) {
    try {
      const {
        title,
        description,
        targetAmount,
        currentAmount,
        targetDate,
        timeHorizon,
        goalType,
        priority,
        monthlyContribution
      } = req.body;

      const goal = await Goal.create({
        userId: req.user.id,
        title,
        description,
        targetAmount,
        currentAmount: currentAmount || 0,
        targetDate,
        timeHorizon,
        goalType,
        priority: priority || 'medium',
        monthlyContribution
      });

      // Return immediately for better UX
      res.status(201).json({
        message: 'Goal created successfully',
        goal
      });

      // Process AI recommendations asynchronously in the background (non-blocking)
      // This won't delay the response to the user
      setImmediate(async () => {
        try {
          const recommendations = await aiService.analyzeGoalAndRecommend(
            req.user.id,
            goal,
            req.user
          );

          // Update goal with recommendations if successful
          if (recommendations && recommendations.marketData) {
            await goal.update({
              recommendedInvestments: recommendations.marketData
            });
            console.log(`✓ Recommendations added to goal: "${goal.title}"`);
          }
        } catch (aiError) {
          console.error('AI recommendation error (non-critical):', aiError.message);
          // Background process - errors are logged but don't affect the user
        }
      });
    } catch (error) {
      console.error('Create goal error:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to create goal', details: error.message });
    }
  }

  /**
   * Get all goals for user
   */
  async getGoals(req, res) {
    try {
      const { status } = req.query;

      const where = { userId: req.user.id };
      if (status) {
        where.status = status;
      }

      const goals = await Goal.findAll({
        where,
        order: [['priority', 'DESC'], ['targetDate', 'ASC']]
      });

      res.json({ goals });
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({ error: 'Failed to get goals' });
    }
  }

  /**
   * Get single goal
   */
  async getGoal(req, res) {
    try {
      const { id } = req.params;

      const goal = await Goal.findOne({
        where: { id, userId: req.user.id }
      });

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      // Calculate progress
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

      res.json({
        goal,
        metrics: {
          progress: Math.min(progress, 100).toFixed(2),
          daysRemaining: Math.max(daysRemaining, 0),
          onTrack: progress >= ((new Date() - new Date(goal.createdAt)) / (new Date(goal.targetDate) - new Date(goal.createdAt))) * 100
        }
      });
    } catch (error) {
      console.error('Get goal error:', error);
      res.status(500).json({ error: 'Failed to get goal' });
    }
  }

  /**
   * Update goal
   */
  async updateGoal(req, res) {
    try {
      const { id } = req.params;

      const goal = await Goal.findOne({
        where: { id, userId: req.user.id }
      });

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      const allowedUpdates = [
        'title',
        'description',
        'targetAmount',
        'currentAmount',
        'targetDate',
        'timeHorizon',
        'goalType',
        'priority',
        'status',
        'monthlyContribution'
      ];

      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      await goal.update(updates);

      res.json({
        message: 'Goal updated successfully',
        goal
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }

  /**
   * Delete goal
   */
  async deleteGoal(req, res) {
    try {
      const { id } = req.params;

      const goal = await Goal.findOne({
        where: { id, userId: req.user.id }
      });

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      await goal.destroy();

      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  }

  /**
   * Get recommendations for a specific goal
   */
  async getGoalRecommendations(req, res) {
    try {
      const { id } = req.params;

      const goal = await Goal.findOne({
        where: { id, userId: req.user.id }
      });

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      const recommendations = await aiService.analyzeGoalAndRecommend(
        req.user.id,
        goal,
        req.user
      );

      res.json(recommendations);
    } catch (error) {
      console.error('Get goal recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
}

module.exports = new GoalController();
