const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Portfolio CRUD
router.post('/', portfolioController.createPortfolio);
router.get('/', portfolioController.getPortfolios);
router.get('/:id', portfolioController.getPortfolio);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

// Portfolio transactions
router.post('/:portfolioId/transactions', portfolioController.addTransaction);
router.get('/:portfolioId/transactions', portfolioController.getTransactions);

// Portfolio actions
router.post('/:portfolioId/refresh-prices', portfolioController.refreshPrices);
router.get('/:portfolioId/performance', portfolioController.getPerformance);

module.exports = router;
