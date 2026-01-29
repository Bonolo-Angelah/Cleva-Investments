const { sequelize } = require('./src/config/database');
const PortfolioHolding = require('./src/models/postgres/PortfolioHolding');
const Portfolio = require('./src/models/postgres/Portfolio');
const User = require('./src/models/postgres/User');
const currencyService = require('./src/services/currencyService');

async function updateAllHoldings() {
  try {
    console.log('Fetching all holdings...');
    const holdings = await PortfolioHolding.findAll();
    console.log(`Found ${holdings.length} holdings to update`);

    for (const holding of holdings) {
      try {
        console.log(`\nUpdating ${holding.symbol}...`);

        // Get portfolio and user currency
        const portfolio = await Portfolio.findByPk(holding.portfolioId);
        const user = await User.findByPk(portfolio.userId);
        const userCurrency = user.currency || 'USD';

        // Get original currency
        const originalCurrency = holding.originalCurrency || 'USD';

        // Calculate converted values based on existing data
        let exchangeRate = 1;
        let averageCostConverted = parseFloat(holding.averageCost);
        let totalCostConverted = parseFloat(holding.totalCost);
        let currentPriceConverted = parseFloat(holding.currentPrice || holding.averageCost);
        let currentValueConverted = parseFloat(holding.currentValue || holding.totalCost);
        let gainLossConverted = parseFloat(holding.gainLoss || 0);

        if (originalCurrency !== userCurrency) {
          console.log(`  Converting from ${originalCurrency} to ${userCurrency}...`);
          exchangeRate = await currencyService.getExchangeRate(originalCurrency, userCurrency);
          console.log(`  Exchange rate: ${exchangeRate}`);

          averageCostConverted = parseFloat(holding.averageCost) * exchangeRate;
          totalCostConverted = parseFloat(holding.totalCost) * exchangeRate;

          if (holding.currentPrice) {
            currentPriceConverted = parseFloat(holding.currentPrice) * exchangeRate;
          }
          if (holding.currentValue) {
            currentValueConverted = parseFloat(holding.currentValue) * exchangeRate;
          }
          if (holding.gainLoss) {
            gainLossConverted = parseFloat(holding.gainLoss) * exchangeRate;
          }
        }

        await holding.update({
          averageCostConverted,
          totalCostConverted,
          currentPriceConverted,
          currentValueConverted,
          gainLossConverted
        });

        console.log(`  ✓ Updated ${holding.symbol}`);
        console.log(`    avgCost: ${holding.averageCost} ${originalCurrency} -> ${averageCostConverted.toFixed(2)} ${userCurrency}`);
        console.log(`    totalCost: ${holding.totalCost} ${originalCurrency} -> ${totalCostConverted.toFixed(2)} ${userCurrency}`);
      } catch (error) {
        console.error(`  ✗ Failed to update ${holding.symbol}:`, error.message);
      }
    }

    console.log('\n✓ All holdings updated!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update holdings:', error);
    process.exit(1);
  }
}

updateAllHoldings();
