const express = require('express');
const router = express.Router();
const marketDataService = require('../services/marketDataService');
const { MarketData, Article } = require('../models/mongodb');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * Get market data for a symbol
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await marketDataService.fetchAndCacheMarketData(symbol.toUpperCase());

    res.json({ data });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ error: 'Failed to get market data' });
  }
});

/**
 * Search investments
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await marketDataService.searchInvestments(q, parseInt(limit));

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search investments' });
  }
});

/**
 * Get trending stocks
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await marketDataService.getTrendingStocks(parseInt(limit));

    res.json({ trending });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to get trending stocks' });
  }
});

/**
 * Get top gainers
 */
router.get('/gainers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const gainers = await marketDataService.getTopGainers(parseInt(limit));

    res.json({ gainers });
  } catch (error) {
    console.error('Get gainers error:', error);
    res.status(500).json({ error: 'Failed to get top gainers' });
  }
});

/**
 * Get articles for a symbol
 */
router.get('/articles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;

    const articles = await Article.find({
      relatedSymbols: symbol.toUpperCase()
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({ articles });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to get articles' });
  }
});

/**
 * Get market overview
 */
router.get('/overview', async (req, res) => {
  try {
    const [trending, gainers] = await Promise.all([
      marketDataService.getTrendingStocks(5),
      marketDataService.getTopGainers(5)
    ]);

    // Get recent articles
    const articles = await Article.find({
      category: { $in: ['market_news', 'economic_data'] }
    })
      .sort({ publishedAt: -1 })
      .limit(5);

    res.json({
      trending,
      gainers,
      news: articles
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Failed to get market overview' });
  }
});

module.exports = router;
