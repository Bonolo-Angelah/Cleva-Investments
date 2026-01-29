const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { initializeDatabases, sequelize, closeConnections } = require('./config/database');
const { User, Goal, Portfolio, Transaction } = require('./models/postgres');

// Import routes
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const chatRoutes = require('./routes/chat');
const marketRoutes = require('./routes/market');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cleva Investment API',
    version: '1.1.0',
    endpoints: {
      auth: '/api/auth',
      goals: '/api/goals',
      chat: '/api/chat',
      market: '/api/market',
      portfolios: '/api/portfolios',
      admin: '/api/admin'
    }
  });
});

// Socket.io for real-time chat
const aiService = require('./services/aiService');
const jwt = require('jsonwebtoken');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on('send_message', async (data) => {
    try {
      const { message, type = 'text' } = data;

      let createdGoal = null;
      let goalCreationMessage = '';

      // Try to extract goal information (independent of main AI processing)
      try {
        const extractedGoal = await aiService.extractGoalFromMessage(message);

        // If a goal was detected, create it
        if (extractedGoal.hasGoal) {
          const goalData = aiService.convertToGoalFormat(extractedGoal, socket.userId, socket.user);

          if (goalData) {
            try {
              createdGoal = await Goal.create(goalData);
              console.log(`✓ Goal created: "${createdGoal.title}" for user ${socket.userId}`);
              goalCreationMessage = `\n\n✅ Great! I've created a new goal for you: "${createdGoal.title}" with a target of ${extractedGoal.currency} ${extractedGoal.targetAmount.toLocaleString()} in ${extractedGoal.timeframe} ${extractedGoal.timeframeUnit}. You can view and manage this goal on your Goals page.`;
            } catch (goalError) {
              console.error('Error creating goal:', goalError);
              goalCreationMessage = '\n\n⚠️ I detected a financial goal in your message, but there was an issue saving it. You can manually create it on the Goals page.';
            }
          }
        }
      } catch (extractionError) {
        console.error('Goal extraction failed (will continue with normal AI processing):', extractionError.message);
        // Continue processing even if goal extraction fails
      }

      // Get user's goals
      const userGoals = await Goal.findAll({
        where: { userId: socket.userId, status: 'active' }
      });

      let aiResponse = "I'm having trouble processing your request right now. For personalized investment advice, I recommend consulting with a licensed financial advisor.";
      let result = {};

      // Try to process with AI
      try {
        result = await aiService.processInvestmentQuery(
          socket.userId,
          message,
          socket.user,
          userGoals
        );
        aiResponse = result.response;
      } catch (aiError) {
        console.error('AI processing failed:', aiError.message);
        // Use fallback response if AI fails
      }

      // Append goal creation message to AI response
      const enhancedResponse = aiResponse + goalCreationMessage;

      // Send response back (always include goal data even if AI fails)
      socket.emit('message_response', {
        success: true,
        ...result,
        response: enhancedResponse,
        goalCreated: !!createdGoal,
        goal: createdGoal,
        marketData: result.marketData || [],
        recommendations: result.recommendations || []
      });
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message_response', {
        success: false,
        error: 'Failed to process message',
        response: "I'm having trouble right now. Please try again or consult a financial advisor."
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize databases
    await initializeDatabases();

    // Sync PostgreSQL models (alter: false to prevent ENUM migration errors)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');

    // Start server
    server.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log(`   Cleva Investment API Server Running`);
      console.log('================================================');
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log('================================================');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await closeConnections();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await closeConnections();
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
