const { sequelize } = require('./src/config/database');
const PortfolioHolding = require('./src/models/postgres/PortfolioHolding');
const Transaction = require('./src/models/postgres/Transaction');
const Portfolio = require('./src/models/postgres/Portfolio');
const User = require('./src/models/postgres/User');
const currencyService = require('./src/services/currencyService');

async function recalculateHolding(portfolioId, symbol) {
  // Get all transactions for this symbol in this portfolio
  const transactions = await Transaction.findAll({
    where: { portfolioId, symbol },
    order: [['transactionDate', 'ASC']]
  });

  if (transactions.length === 0) return null;

  let totalQuantity = 0;
  let totalCost = 0;
  let totalSpent = 0;
  const currency = transactions[0].currency;

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      totalQuantity += parseFloat(tx.quantity);
      totalCost += parseFloat(tx.totalAmount);
      totalSpent += parseFloat(tx.totalAmount);
    } else if (tx.type === 'sell') {
      const sellRatio = parseFloat(tx.quantity) / totalQuantity;
      const costBasisSold = totalCost * sellRatio;
      totalQuantity -= parseFloat(tx.quantity);
      totalCost -= costBasisSold;
    }
  }

  const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  return {
    quantity: totalQuantity,
    averageCost,
    totalCost,
    originalCurrency: currency
  };
}

async function recalculateAllHoldings() {
  try {
    console.log('Fetching all holdings...');
    const holdings = await PortfolioHolding.findAll();
    console.log(`Found ${holdings.length} holdings to recalculate\n`);

    for (const holding of holdings) {
      try {
        console.log(`Recalculating ${holding.symbol} in portfolio ${holding.portfolioId.substring(0, 8)}...`);

        const recalc = await recalculateHolding(holding.portfolioId, holding.symbol);

        if (recalc) {
          // Get user currency for conversion
          const portfolio = await Portfolio.findByPk(holding.portfolioId);
          const user = await User.findByPk(portfolio.userId);
          const userCurrency = user.currency || 'USD';

          // Calculate converted values
          let exchangeRate = 1;
          let averageCostConverted = recalc.averageCost;
          let totalCostConverted = recalc.totalCost;

          if (recalc.originalCurrency !== userCurrency) {
            exchangeRate = await currencyService.getExchangeRate(recalc.originalCurrency, userCurrency);
            averageCostConverted = recalc.averageCost * exchangeRate;
            totalCostConverted = recalc.totalCost * exchangeRate;
          }

          await holding.update({
            quantity: recalc.quantity,
            averageCost: recalc.averageCost,
            totalCost: recalc.totalCost,
            originalCurrency: recalc.originalCurrency,
            averageCostConverted,
            totalCostConverted
          });

          console.log(`  ✓ Updated: Qty=${recalc.quantity.toFixed(2)} | AvgCost=${recalc.averageCost.toFixed(2)} ${recalc.originalCurrency} (${averageCostConverted.toFixed(2)} ${userCurrency})`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to recalculate ${holding.symbol}:`, error.message);
      }
    }

    console.log('\n✓ All holdings recalculated!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to recalculate holdings:', error);
    process.exit(1);
  }
}

recalculateAllHoldings();
