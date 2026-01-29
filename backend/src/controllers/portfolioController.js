const { Portfolio, PortfolioHolding, Transaction, User } = require('../models/postgres');
const marketDataService = require('../services/marketDataService');
const currencyService = require('../services/currencyService');
const { Op } = require('sequelize');

class PortfolioController {
  /**
   * Create new portfolio
   */
  createPortfolio = async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Portfolio name is required' });
      }

      const portfolio = await Portfolio.create({
        userId: req.user.id,
        name,
        description
      });

      res.status(201).json({
        message: 'Portfolio created successfully',
        portfolio
      });
    } catch (error) {
      console.error('Create portfolio error:', error);
      res.status(500).json({ error: 'Failed to create portfolio' });
    }
  }

  /**
   * Get all user portfolios
   */
  getPortfolios = async (req, res) => {
    try {
      const portfolios = await Portfolio.findAll({
        where: { userId: req.user.id },
        include: [{
          model: PortfolioHolding,
          as: 'holdings'
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ portfolios });
    } catch (error) {
      console.error('Get portfolios error:', error);
      res.status(500).json({ error: 'Failed to get portfolios' });
    }
  }

  /**
   * Get single portfolio with details
   */
  getPortfolio = async (req, res) => {
    try {
      const { id } = req.params;

      const portfolio = await Portfolio.findOne({
        where: {
          id,
          userId: req.user.id
        },
        include: [{
          model: PortfolioHolding,
          as: 'holdings'
        }]
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      res.json({ portfolio });
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({ error: 'Failed to get portfolio' });
    }
  }

  /**
   * Update portfolio
   */
  updatePortfolio = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const portfolio = await Portfolio.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (isActive !== undefined) updates.isActive = isActive;

      await portfolio.update(updates);

      res.json({
        message: 'Portfolio updated successfully',
        portfolio
      });
    } catch (error) {
      console.error('Update portfolio error:', error);
      res.status(500).json({ error: 'Failed to update portfolio' });
    }
  }

  /**
   * Delete portfolio
   */
  deletePortfolio = async (req, res) => {
    try {
      const { id } = req.params;

      const portfolio = await Portfolio.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      await portfolio.destroy();

      res.json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
      console.error('Delete portfolio error:', error);
      res.status(500).json({ error: 'Failed to delete portfolio' });
    }
  }

  /**
   * Add transaction to portfolio
   */
  addTransaction = async (req, res) => {
    try {
      const { portfolioId } = req.params;
      const {
        symbol,
        name,
        type,
        quantity,
        price,
        fees = 0,
        notes,
        transactionDate
      } = req.body;

      // Validate
      if (!symbol || !name || !type || !quantity || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!['buy', 'sell', 'dividend'].includes(type)) {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      // Check portfolio exists and belongs to user
      const portfolio = await Portfolio.findOne({
        where: {
          id: portfolioId,
          userId: req.user.id
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Get user for currency info
      const user = await User.findByPk(req.user.id);
      const userCurrency = user.currency || 'USD';

      // Determine investment's original currency (the currency it trades in)
      const investmentCurrency = currencyService.getInvestmentCurrency(symbol.toUpperCase());

      // User enters price in their local currency, but we need to store it in investment's currency
      let priceInInvestmentCurrency = parseFloat(price);
      let exchangeRate = 1;

      if (investmentCurrency !== userCurrency) {
        // Get exchange rate from investment currency to user currency (for display purposes)
        exchangeRate = await currencyService.getExchangeRate(investmentCurrency, userCurrency);

        // Convert user's entered price (in user currency) to investment currency
        // User enters in ZAR, we need USD: price_usd = price_zar / exchange_rate
        priceInInvestmentCurrency = parseFloat(price) / exchangeRate;
      }

      // Calculate total in investment's original currency
      const totalAmount = (priceInInvestmentCurrency * parseFloat(quantity)) + (parseFloat(fees) / exchangeRate);

      // Create transaction - store prices in investment's original currency
      const transaction = await Transaction.create({
        userId: req.user.id,
        portfolioId,
        symbol: symbol.toUpperCase(),
        name,
        type,
        quantity: parseFloat(quantity),
        price: priceInInvestmentCurrency, // Store in investment currency
        totalAmount, // Store in investment currency
        fees: parseFloat(fees) / exchangeRate, // Store in investment currency
        currency: investmentCurrency,
        exchangeRate,
        notes,
        transactionDate: transactionDate || new Date()
      });

      // Update holdings
      await this.updateHoldings(portfolioId, transaction);

      // Update portfolio totals
      await this.updatePortfolioTotals(portfolioId);

      res.status(201).json({
        message: 'Transaction added successfully',
        transaction
      });
    } catch (error) {
      console.error('Add transaction error:', error);
      res.status(500).json({ error: 'Failed to add transaction' });
    }
  }

  /**
   * Get portfolio transactions
   */
  getTransactions = async (req, res) => {
    try {
      const { portfolioId } = req.params;
      const { startDate, endDate, type, symbol } = req.query;

      // Check portfolio exists and belongs to user
      const portfolio = await Portfolio.findOne({
        where: {
          id: portfolioId,
          userId: req.user.id
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Build query
      const where = { portfolioId };

      if (startDate) {
        where.transactionDate = { [Op.gte]: new Date(startDate) };
      }

      if (endDate) {
        where.transactionDate = {
          ...where.transactionDate,
          [Op.lte]: new Date(endDate)
        };
      }

      if (type) {
        where.type = type;
      }

      if (symbol) {
        where.symbol = symbol.toUpperCase();
      }

      const transactions = await Transaction.findAll({
        where,
        order: [['transactionDate', 'DESC']]
      });

      res.json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }

  /**
   * Update portfolio holdings after transaction
   */
  updateHoldings = async (portfolioId, transaction) => {
    const { symbol, name, type, quantity, price, totalAmount, currency } = transaction;

    // Determine original currency
    const originalCurrency = currency || currencyService.getInvestmentCurrency(symbol);

    // Find or create holding
    let holding = await PortfolioHolding.findOne({
      where: {
        portfolioId,
        symbol
      }
    });

    if (!holding && type === 'buy') {
      // Create new holding
      holding = await PortfolioHolding.create({
        portfolioId,
        symbol,
        name,
        quantity,
        averageCost: price,
        totalCost: totalAmount,
        originalCurrency
      });
    } else if (holding) {
      if (type === 'buy') {
        // Add to holding
        const newQuantity = parseFloat(holding.quantity) + parseFloat(quantity);
        const newTotalCost = parseFloat(holding.totalCost) + parseFloat(totalAmount);
        const newAverageCost = newTotalCost / newQuantity;

        await holding.update({
          quantity: newQuantity,
          averageCost: newAverageCost,
          totalCost: newTotalCost
        });
      } else if (type === 'sell') {
        // Remove from holding
        const newQuantity = parseFloat(holding.quantity) - parseFloat(quantity);

        if (newQuantity <= 0) {
          await holding.destroy();
        } else {
          const newTotalCost = parseFloat(holding.averageCost) * newQuantity;
          await holding.update({
            quantity: newQuantity,
            totalCost: newTotalCost
          });
        }
      }
    }

    // Update current prices
    if (holding && !holding.destroyed) {
      await this.updateHoldingPrices(holding);
    }
  }

  /**
   * Update holding current prices
   */
  updateHoldingPrices = async (holding) => {
    try {
      const marketData = await marketDataService.fetchAndCacheMarketData(holding.symbol);

      if (marketData && marketData.currentPrice) {
        // Get portfolio and user currency
        const portfolio = await Portfolio.findByPk(holding.portfolioId);
        const user = await User.findByPk(portfolio.userId);
        const userCurrency = user.currency || 'USD';

        // Original currency values (stored in investment's native currency)
        const currentPrice = parseFloat(marketData.currentPrice);
        const currentValue = currentPrice * parseFloat(holding.quantity);
        const gainLoss = currentValue - parseFloat(holding.totalCost);
        const gainLossPercent = (gainLoss / parseFloat(holding.totalCost)) * 100;

        // Get original currency (default to USD if not set)
        const originalCurrency = holding.originalCurrency || 'USD';

        // Converted values (for display in user's preferred currency)
        let exchangeRate = 1;
        let averageCostConverted = parseFloat(holding.averageCost);
        let totalCostConverted = parseFloat(holding.totalCost);
        let currentPriceConverted = currentPrice;
        let currentValueConverted = currentValue;
        let gainLossConverted = gainLoss;

        // Apply currency conversion if needed
        if (originalCurrency !== userCurrency) {
          exchangeRate = await currencyService.getExchangeRate(originalCurrency, userCurrency);
          averageCostConverted = parseFloat(holding.averageCost) * exchangeRate;
          totalCostConverted = parseFloat(holding.totalCost) * exchangeRate;
          currentPriceConverted = currentPrice * exchangeRate;
          currentValueConverted = currentValue * exchangeRate;
          gainLossConverted = gainLoss * exchangeRate;
        }

        await holding.update({
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercent,
          averageCostConverted,
          totalCostConverted,
          currentPriceConverted,
          currentValueConverted,
          gainLossConverted,
          sector: marketData.sector,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error(`Failed to update prices for ${holding.symbol}:`, error.message);
    }
  }

  /**
   * Update portfolio totals
   */
  updatePortfolioTotals = async (portfolioId) => {
    const portfolio = await Portfolio.findByPk(portfolioId, {
      include: [{
        model: PortfolioHolding,
        as: 'holdings'
      }]
    });

    if (!portfolio) return;

    // Get user currency for proper conversion
    const user = await User.findByPk(portfolio.userId);
    const userCurrency = user.currency || 'USD';

    let totalValue = 0;
    let totalCost = 0;

    for (const holding of portfolio.holdings) {
      const originalCurrency = holding.originalCurrency || 'USD';

      // Get exchange rate if needed
      let exchangeRate = 1;
      if (originalCurrency !== userCurrency) {
        exchangeRate = await currencyService.getExchangeRate(originalCurrency, userCurrency);
      }

      // Convert totalCost and currentValue to user's currency
      const costInUserCurrency = parseFloat(holding.totalCost || 0) * exchangeRate;
      const valueInUserCurrency = parseFloat(holding.currentValue || holding.totalCost || 0) * exchangeRate;

      totalCost += costInUserCurrency;
      totalValue += valueInUserCurrency;
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    await portfolio.update({
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent
    });
  }

  /**
   * Refresh all holdings prices in portfolio
   */
  refreshPrices = async (req, res) => {
    try {
      const { portfolioId } = req.params;

      const portfolio = await Portfolio.findOne({
        where: {
          id: portfolioId,
          userId: req.user.id
        },
        include: [{
          model: PortfolioHolding,
          as: 'holdings'
        }]
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Update all holdings
      for (const holding of portfolio.holdings) {
        await this.updateHoldingPrices(holding);
      }

      // Update portfolio totals
      await this.updatePortfolioTotals(portfolioId);

      // Reload portfolio
      await portfolio.reload({ include: [{ model: PortfolioHolding, as: 'holdings' }] });

      res.json({
        message: 'Prices refreshed successfully',
        portfolio
      });
    } catch (error) {
      console.error('Refresh prices error:', error);
      res.status(500).json({ error: 'Failed to refresh prices' });
    }
  }

  /**
   * Get portfolio performance metrics
   */
  getPerformance = async (req, res) => {
    try {
      const { portfolioId } = req.params;

      const portfolio = await Portfolio.findOne({
        where: {
          id: portfolioId,
          userId: req.user.id
        },
        include: [{
          model: PortfolioHolding,
          as: 'holdings'
        }]
      });

      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      // Calculate metrics
      const totalInvested = parseFloat(portfolio.totalCost || 0);
      const totalValue = parseFloat(portfolio.totalValue || totalInvested);
      const totalGain = totalValue - totalInvested;
      const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

      // Holdings breakdown
      const holdings = portfolio.holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        quantity: h.quantity,
        averageCost: h.averageCost,
        currentPrice: h.currentPrice,
        totalCost: h.totalCost,
        currentValue: h.currentValue,
        gainLoss: h.gainLoss,
        gainLossPercent: h.gainLossPercent,
        sector: h.sector,
        allocation: totalValue > 0 ? ((h.currentValue || 0) / totalValue) * 100 : 0
      }));

      // Sector allocation
      const sectorMap = {};
      holdings.forEach(h => {
        if (h.sector) {
          sectorMap[h.sector] = (sectorMap[h.sector] || 0) + (h.currentValue || 0);
        }
      });

      const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
        sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }));

      res.json({
        portfolio: {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description
        },
        performance: {
          totalInvested,
          totalValue,
          totalGain,
          totalGainPercent,
          holdingsCount: holdings.length
        },
        holdings,
        sectorAllocation,
        lastUpdated: portfolio.updatedAt
      });
    } catch (error) {
      console.error('Get performance error:', error);
      res.status(500).json({ error: 'Failed to get performance' });
    }
  }
}

module.exports = new PortfolioController();
