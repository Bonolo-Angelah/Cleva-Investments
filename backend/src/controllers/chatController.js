const aiService = require('../services/aiService');
const { Goal } = require('../models/postgres');
const { ChatHistory } = require('../models/mongodb');
const GraphService = require('../models/neo4j/GraphService');

class ChatController {
  /**
   * Send message to AI chatbot
   */
  async sendMessage(req, res) {
    try {
      const { message, type = 'text' } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Extract goal information from message
      const extractedGoal = await aiService.extractGoalFromMessage(message);

      let createdGoal = null;
      let goalCreationMessage = '';

      // If a goal was detected, create it
      if (extractedGoal.hasGoal) {
        const goalData = aiService.convertToGoalFormat(extractedGoal, req.user.id, req.user);

        if (goalData) {
          try {
            createdGoal = await Goal.create(goalData);
            goalCreationMessage = `\n\n✅ Great! I've created a new goal for you: "${createdGoal.title}" with a target of ${extractedGoal.currency} ${extractedGoal.targetAmount.toLocaleString()} in ${extractedGoal.timeframe} ${extractedGoal.timeframeUnit}. You can view and manage this goal on your Goals page.`;
          } catch (goalError) {
            console.error('Error creating goal:', goalError);
            goalCreationMessage = '\n\n⚠️ I detected a financial goal in your message, but there was an issue saving it. You can manually create it on the Goals page.';
          }
        }
      }

      // Get user's active goals
      const userGoals = await Goal.findAll({
        where: { userId: req.user.id, status: 'active' }
      });

      // Process query with AI
      const result = await aiService.processInvestmentQuery(
        req.user.id,
        message,
        req.user,
        userGoals
      );

      // Append goal creation message to AI response
      const enhancedResponse = result.response + goalCreationMessage;

      res.json({
        message: 'Message processed successfully',
        ...result,
        response: enhancedResponse,
        goalCreated: !!createdGoal,
        goal: createdGoal
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        error: 'Failed to process message',
        response: "I'm having trouble processing your request right now. For personalized investment advice, I recommend consulting with a licensed financial advisor."
      });
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(req, res) {
    try {
      const { sessionId, limit = 50 } = req.query;

      let query = { userId: req.user.id };
      if (sessionId) {
        query.sessionId = sessionId;
      }

      const sessions = await ChatHistory.find(query)
        .sort({ lastMessageAt: -1 })
        .limit(parseInt(limit));

      res.json({ sessions });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  }

  /**
   * Get active chat session
   */
  async getActiveSession(req, res) {
    try {
      const session = await aiService.getChatHistory(req.user.id);
      res.json({ session });
    } catch (error) {
      console.error('Get active session error:', error);
      res.status(500).json({ error: 'Failed to get active session' });
    }
  }

  /**
   * Create new chat session
   */
  async createSession(req, res) {
    try {
      // End current active sessions
      await ChatHistory.updateMany(
        { userId: req.user.id, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new session
      const session = await ChatHistory.create({
        userId: req.user.id,
        sessionId: `session_${Date.now()}_${req.user.id}`,
        messages: []
      });

      res.status(201).json({
        message: 'New session created',
        session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  /**
   * End chat session
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await ChatHistory.findOneAndUpdate(
        { userId: req.user.id, sessionId },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        message: 'Session ended successfully',
        session
      });
    } catch (error) {
      console.error('End session error:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(req, res) {
    try {
      const { limit = 10 } = req.query;

      // Get recommendations from graph database
      const graphRecommendations = await GraphService.getRecommendations(
        req.user.id,
        parseInt(limit)
      );

      // Get user's investment profile
      const profile = await GraphService.getUserInvestmentProfile(req.user.id);

      // Get popular investments
      const popular = await GraphService.getPopularInvestments(null, 5);

      res.json({
        personalized: graphRecommendations,
        userProfile: profile,
        trending: popular
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  /**
   * Record user action on investment
   */
  async recordAction(req, res) {
    try {
      const { symbol, action, amount } = req.body;

      if (!symbol || !action) {
        return res.status(400).json({ error: 'Symbol and action are required' });
      }

      // Record in graph database
      await GraphService.recordInvestmentAction(
        req.user.id,
        symbol,
        action,
        amount
      );

      res.json({
        message: 'Action recorded successfully'
      });
    } catch (error) {
      console.error('Record action error:', error);
      res.status(500).json({ error: 'Failed to record action' });
    }
  }
}

module.exports = new ChatController();
