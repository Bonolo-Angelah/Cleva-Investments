const axios = require('axios');
const https = require('https');
const { ChatHistory, Article } = require('../models/mongodb');
const marketDataService = require('./marketDataService');
const GraphService = require('../models/neo4j/GraphService');
const fallbackChatService = require('./fallbackChatService');
require('dotenv').config();

// Configure axios with DNS family preference
const httpsAgent = new https.Agent({
  family: 4, // Force IPv4
  keepAlive: true
});

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.cohereKey = process.env.COHERE_API_KEY;
    this.useOpenAI = !!this.openaiKey;
  }

  /**
   * Generate AI response using OpenAI or Cohere
   */
  async generateResponse(messages, systemPrompt) {
    if (this.useOpenAI) {
      return await this.generateOpenAIResponse(messages, systemPrompt);
    } else {
      return await this.generateCohereResponse(messages, systemPrompt);
    }
  }

  /**
   * OpenAI Chat Completion
   */
  async generateOpenAIResponse(messages, systemPrompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Cohere Chat Completion (Free tier alternative)
   */
  async generateCohereResponse(messages, systemPrompt, retryCount = 0) {
    const maxRetries = 2;

    try {
      const chatHistory = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: m.content
      }));

      const lastMessage = messages[messages.length - 1];

      console.log(`Calling Cohere API (attempt ${retryCount + 1}/${maxRetries + 1})...`);

      const response = await axios.post(
        'https://api.cohere.ai/v1/chat',
        {
          message: lastMessage.content,
          chat_history: chatHistory,
          preamble: systemPrompt,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.cohereKey}`,
            'Content-Type': 'application/json'
          },
          httpsAgent: httpsAgent,
          timeout: 30000, // 30 second timeout
          maxRedirects: 5
        }
      );

      console.log('✓ Cohere API responded successfully');
      return response.data.text;
    } catch (error) {
      console.error(`Cohere API error (attempt ${retryCount + 1}):`, error.code || error.message);

      // Retry on network errors
      if (retryCount < maxRetries &&
          (error.code === 'ECONNABORTED' ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ENOTFOUND' ||
           error.message.includes('EAI_AGAIN'))) {
        console.log(`Retrying Cohere API in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.generateCohereResponse(messages, systemPrompt, retryCount + 1);
      }

      // Only use fallback after all retries exhausted
      if (error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ENOTFOUND' ||
          error.message.includes('EAI_AGAIN')) {
        console.warn('⚠ Cohere API unavailable after retries - using fallback');
        const lastMessage = messages[messages.length - 1];
        return fallbackChatService.generateResponse(lastMessage.content, systemPrompt);
      }

      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Build context-aware system prompt
   */
  buildSystemPrompt(userData, userGoals, marketContext) {
    return `You are Cleva, an AI investment advisor for the Cleva Investment platform. Your role is to provide personalized investment advice and general market insights.

USER PROFILE:
- Risk Tolerance: ${userData.riskTolerance}
- Investment Experience: ${userData.investmentExperience}
- Active Goals: ${userGoals.length}

USER GOALS:
${userGoals.map(g => `- ${g.title}: Target R${g.targetAmount} by ${g.targetDate.toDateString()}`).join('\n')}

MARKET CONTEXT:
${marketContext || 'Provide general market insights and investment education based on South African market conditions.'}

GUIDELINES:
1. Provide helpful investment advice and market insights, using specific data when available
2. When asked about market conditions, discuss general trends in major markets (JSE, global indices, commodities)
3. For South Africa, discuss common investment options: JSE stocks, ETFs, unit trusts, REITs, bonds
4. Consider the user's risk tolerance and experience level in all recommendations
5. Align recommendations with their specific financial goals
6. When specific market data is available, include current performance metrics
7. When specific data isn't available, provide educational insights and general market trends
8. Never guarantee returns or make promises about investment performance
9. Always include appropriate risk warnings
10. Be conversational, helpful, and educational
11. ALWAYS use South African Rands (R) as the currency in all responses and calculations
12. Suggest well-known JSE stocks and ETFs appropriate for their risk profile

MARKET INSIGHTS YOU CAN SHARE:
- Discuss JSE Top 40 index trends and major sectors (mining, financial, industrial)
- Explain different investment types (stocks, ETFs, bonds, property)
- Provide investment strategies based on risk tolerance and time horizon
- Explain market concepts and help users understand investment principles
- Suggest diversification strategies appropriate for South African investors

IMPORTANT: Be helpful and informative even when specific real-time data isn't available. Focus on education and sound investment principles.`;
  }

  /**
   * Process user query and generate investment advice
   */
  async processInvestmentQuery(userId, userMessage, userData, userGoals) {
    try {
      // Get chat history
      const chatHistory = await this.getChatHistory(userId);

      // Extract potential investment symbols from the query
      const symbols = this.extractSymbols(userMessage);

      // Fetch market data for mentioned symbols
      let marketData = [];
      if (symbols.length > 0) {
        marketData = await Promise.all(
          symbols.map(symbol =>
            marketDataService.fetchAndCacheMarketData(symbol)
              .catch(err => null)
          )
        );
        marketData = marketData.filter(d => d !== null);
      }

      // Get personalized recommendations from graph database
      const graphRecommendations = await GraphService.getRecommendations(userId, 5);

      // Fetch data for graph recommendations
      if (graphRecommendations.length > 0 && marketData.length === 0) {
        const topRecommendation = graphRecommendations[0];
        const recData = await marketDataService.fetchAndCacheMarketData(topRecommendation.symbol)
          .catch(err => null);
        if (recData) marketData.push(recData);
      }

      // Search for relevant articles
      const articles = await this.findRelevantArticles(symbols, userMessage);

      // Build market context
      const marketContext = this.buildMarketContext(marketData, articles, graphRecommendations);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(userData, userGoals, marketContext);

      // Prepare messages for AI
      const messages = [
        ...chatHistory.messages.slice(-10), // Last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      // Generate AI response
      const aiResponse = await this.generateResponse(messages, systemPrompt);

      // Save to chat history
      await this.saveChatMessage(userId, chatHistory.sessionId, 'user', userMessage);
      await this.saveChatMessage(userId, chatHistory.sessionId, 'assistant', aiResponse);

      // Record interactions in graph database
      for (const symbol of symbols) {
        await GraphService.recordUserInterest(userId, symbol, 'QUERIED', 2);
      }

      return {
        response: aiResponse,
        marketData: marketData.slice(0, 3), // Top 3 relevant investments
        recommendations: graphRecommendations.slice(0, 5),
        articles: articles.slice(0, 3)
      };
    } catch (error) {
      console.error('Error processing investment query:', error);

      // Fallback response
      return {
        response: "I'm having trouble processing your request right now. For personalized investment advice, I recommend consulting with a licensed financial advisor who can review your complete financial situation.",
        marketData: [],
        recommendations: [],
        articles: []
      };
    }
  }

  /**
   * Extract stock symbols from text
   */
  extractSymbols(text) {
    // Blacklist of common English words that shouldn't be treated as stock symbols
    const commonWords = new Set([
      'I', 'A', 'THE', 'AND', 'OR', 'BUT', 'FOR', 'TO', 'IN', 'ON', 'AT', 'BY', 'WITH',
      'FROM', 'AS', 'IS', 'WAS', 'BE', 'BEEN', 'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID',
      'WILL', 'WOULD', 'COULD', 'SHOULD', 'MAY', 'MIGHT', 'CAN', 'NOT', 'NO', 'YES', 'SO',
      'IF', 'OF', 'MY', 'ME', 'WE', 'US', 'YOU', 'HE', 'SHE', 'IT', 'THEY', 'THEM', 'THEIR',
      'BUY', 'SELL', 'HOLD', 'LONG', 'SHORT', 'CALL', 'PUT', 'UP', 'DOWN', 'HIGH', 'LOW',
      'WANT', 'NEED', 'HELP', 'GIVE', 'GET', 'GO', 'MAKE', 'TAKE', 'COME', 'SEE', 'KNOW',
      'THINK', 'LOOK', 'GOOD', 'NEW', 'FIRST', 'LAST', 'BEST', 'NEXT', 'OLD', 'GREAT',
      'ABOUT', 'AFTER', 'ALL', 'AN', 'ANY', 'ARE', 'BACK', 'BOTH', 'EACH', 'FEW', 'INTO',
      'JUST', 'LIKE', 'MORE', 'MOST', 'MUCH', 'NOW', 'ONLY', 'OTHER', 'OUT', 'OVER', 'SOME',
      'SUCH', 'THAN', 'THAT', 'THEN', 'THERE', 'THESE', 'THIS', 'THOSE', 'VERY', 'WELL',
      'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHO', 'WHY', 'YEAR', 'YEARS', 'TIME', 'MONTH',
      'PC', 'AM', 'PM', 'TV', 'IT', 'AI', 'HR', 'PR', 'OK', 'VS', 'AD', 'BC'
    ]);

    // Common patterns: $AAPL, AAPL, Apple Inc (AAPL)
    const symbolPattern = /\b[A-Z]{1,5}\b|\$[A-Z]{1,5}\b/g;
    const matches = text.match(symbolPattern) || [];

    return [...new Set(matches.map(s => s.replace('$', '')))]
      .filter(s => s.length <= 5 && !commonWords.has(s));
  }

  /**
   * Build market context for AI
   */
  buildMarketContext(marketData, articles, recommendations) {
    let context = '';

    if (marketData.length > 0) {
      context += 'CURRENT MARKET DATA:\n';
      marketData.forEach(data => {
        context += `\n${data.symbol} (${data.name}):
- Current Price: R${data.currentPrice}
- Change: ${data.priceChangePercent?.toFixed(2)}%
- Market Cap: R${(data.marketCap / 1e9).toFixed(2)}B
- Sector: ${data.sector}
- P/E Ratio: ${data.peRatio?.toFixed(2)}
- 1Y Performance: ${data.performance?.oneYear?.toFixed(2)}%
- Risk Level: ${data.riskMetrics?.volatility ? 'High' : 'Moderate'}
`;
      });
    }

    if (recommendations.length > 0) {
      context += '\n\nPERSONALIZED RECOMMENDATIONS (based on similar users):\n';
      recommendations.forEach((rec, i) => {
        context += `${i + 1}. ${rec.symbol} - ${rec.name} (${rec.type}) - Recommended by ${rec.recommendedByUsers} similar investors\n`;
      });
    }

    if (articles.length > 0) {
      context += '\n\nRECENT NEWS & ANALYSIS:\n';
      articles.forEach((article, i) => {
        context += `${i + 1}. ${article.title} (${article.source}) - ${article.sentiment}\n`;
      });
    }

    return context || 'No specific market data available for mentioned investments.';
  }

  /**
   * Find relevant articles
   */
  async findRelevantArticles(symbols, query, limit = 5) {
    try {
      const conditions = [];

      if (symbols.length > 0) {
        conditions.push({ relatedSymbols: { $in: symbols } });
      }

      // Text search if no symbols
      if (conditions.length === 0 && query) {
        conditions.push({ $text: { $search: query } });
      }

      if (conditions.length === 0) return [];

      const articles = await Article.find({
        $or: conditions,
        publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
        .sort({ publishedAt: -1, relevanceScore: -1 })
        .limit(limit);

      return articles;
    } catch (error) {
      console.error('Error finding articles:', error);
      return [];
    }
  }

  /**
   * Get or create chat session
   */
  async getChatHistory(userId, sessionId = null) {
    try {
      if (sessionId) {
        const session = await ChatHistory.findOne({ userId, sessionId });
        if (session) return session;
      }

      // Get most recent active session
      let session = await ChatHistory.findOne({
        userId,
        isActive: true,
        lastMessageAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ lastMessageAt: -1 });

      if (!session) {
        // Create new session
        session = await ChatHistory.create({
          userId,
          sessionId: `session_${Date.now()}_${userId}`,
          messages: []
        });
      }

      return session;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Save chat message
   */
  async saveChatMessage(userId, sessionId, role, content, type = 'text', metadata = {}) {
    try {
      await ChatHistory.findOneAndUpdate(
        { userId, sessionId },
        {
          $push: {
            messages: {
              role,
              content,
              type,
              timestamp: new Date(),
              metadata
            }
          },
          $set: { lastMessageAt: new Date() }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  /**
   * Analyze user goal and recommend investments
   */
  async analyzeGoalAndRecommend(userId, goal, userData) {
    try {
      const timeHorizon = this.calculateTimeHorizon(goal.targetDate);
      const monthlyRequired = this.calculateMonthlyContribution(
        goal.currentAmount,
        goal.targetAmount,
        timeHorizon
      );

      const prompt = `I need to achieve a financial goal:
- Goal: ${goal.title}
- Target Amount: R${goal.targetAmount}
- Current Amount: R${goal.currentAmount}
- Time Horizon: ${timeHorizon} months
- Required Monthly Contribution: R${monthlyRequired}
- My Risk Tolerance: ${userData.riskTolerance}
- My Experience: ${userData.investmentExperience}

Based on this information and current market conditions, what investment strategy and specific investments would you recommend?`;

      const result = await this.processInvestmentQuery(userId, prompt, userData, [goal]);

      return {
        ...result,
        calculatedMetrics: {
          timeHorizon,
          monthlyRequired,
          totalInvestmentNeeded: goal.targetAmount - goal.currentAmount
        }
      };
    } catch (error) {
      console.error('Error analyzing goal:', error);
      throw error;
    }
  }

  /**
   * Calculate time horizon in months
   */
  calculateTimeHorizon(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = Math.abs(target - now);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  }

  /**
   * Calculate required monthly contribution (simplified)
   */
  calculateMonthlyContribution(currentAmount, targetAmount, months, assumedReturn = 0.07) {
    const remaining = targetAmount - currentAmount;
    const monthlyRate = assumedReturn / 12;

    if (monthlyRate === 0) {
      return remaining / months;
    }

    // Future value of annuity formula
    const monthlyContribution = remaining / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    return Math.round(monthlyContribution * 100) / 100;
  }

  /**
   * Extract goal information from user message using AI
   */
  async extractGoalFromMessage(message) {
    try {
      const extractionPrompt = `Analyze the following message and extract financial goal information. Return ONLY a JSON object with these exact fields, or return null if no goal is detected:

{
  "hasGoal": true/false,
  "title": "brief goal name (e.g., 'Buy a car', 'Save for retirement')",
  "description": "expanded description from the message",
  "targetAmount": numeric value only (no currency symbols),
  "currency": "ZAR", "USD", or "EUR" etc,
  "timeframe": number of years or months,
  "timeframeUnit": "years" or "months",
  "goalType": one of: "retirement", "education", "house", "emergency_fund", "wealth_building", "other"
}

Examples:
Message: "I want to buy a car and save R100,000 in 5 years"
Response: {"hasGoal": true, "title": "Buy a car", "description": "Save money to purchase a car", "targetAmount": 100000, "currency": "ZAR", "timeframe": 5, "timeframeUnit": "years", "goalType": "other"}

Message: "How are the markets doing today?"
Response: {"hasGoal": false}

Message: "I need to save $50000 for my child's education in 10 years"
Response: {"hasGoal": true, "title": "Save for child's education", "description": "Save for child's education", "targetAmount": 50000, "currency": "USD", "timeframe": 10, "timeframeUnit": "years", "goalType": "education"}

Now analyze this message:
"${message}"

Return ONLY valid JSON, no additional text.`;

      let extractedData;

      if (this.useOpenAI) {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a financial goal extraction assistant. Return only valid JSON.' },
              { role: 'user', content: extractionPrompt }
            ],
            temperature: 0.3,
            max_tokens: 300
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openaiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        extractedData = response.data.choices[0].message.content;
      } else {
        const response = await axios.post(
          'https://api.cohere.ai/v1/chat',
          {
            message: extractionPrompt,
            preamble: 'You are a financial goal extraction assistant. Analyze user messages and extract structured goal information. Return only valid JSON.',
            temperature: 0.3,
            max_tokens: 300
          },
          {
            headers: {
              'Authorization': `Bearer ${this.cohereKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        extractedData = response.data.text;
      }

      // Parse JSON response
      const jsonMatch = extractedData.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { hasGoal: false };
      }

      const goalData = JSON.parse(jsonMatch[0]);

      if (!goalData.hasGoal) {
        return { hasGoal: false };
      }

      return goalData;
    } catch (error) {
      console.error('Error extracting goal:', error.message);
      return { hasGoal: false };
    }
  }

  /**
   * Convert extracted goal data to database format
   */
  convertToGoalFormat(extractedGoal, userId, userData) {
    if (!extractedGoal.hasGoal) return null;

    // Calculate target date
    const targetDate = new Date();
    if (extractedGoal.timeframeUnit === 'years') {
      targetDate.setFullYear(targetDate.getFullYear() + extractedGoal.timeframe);
    } else {
      targetDate.setMonth(targetDate.getMonth() + extractedGoal.timeframe);
    }

    // Determine time horizon category
    const years = extractedGoal.timeframeUnit === 'years'
      ? extractedGoal.timeframe
      : extractedGoal.timeframe / 12;

    let timeHorizon;
    if (years < 2) timeHorizon = 'short';
    else if (years <= 5) timeHorizon = 'medium';
    else timeHorizon = 'long';

    // Calculate monthly contribution
    const months = extractedGoal.timeframeUnit === 'years'
      ? extractedGoal.timeframe * 12
      : extractedGoal.timeframe;
    const monthlyContribution = this.calculateMonthlyContribution(0, extractedGoal.targetAmount, months);

    return {
      userId,
      title: extractedGoal.title,
      description: extractedGoal.description || extractedGoal.title,
      targetAmount: extractedGoal.targetAmount,
      currentAmount: 0,
      targetDate,
      timeHorizon,
      goalType: extractedGoal.goalType || 'other',
      priority: 'medium',
      status: 'active',
      monthlyContribution,
      riskTolerance: userData.riskTolerance || 'moderate',
      investmentExperience: userData.investmentExperience || 'beginner',
      recommendedInvestments: []
    };
  }
}

module.exports = new AIService();
