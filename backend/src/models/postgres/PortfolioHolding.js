const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PortfolioHolding = sequelize.define('PortfolioHolding', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  portfolioId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'portfolios',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Stock/ETF symbol'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Investment name'
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total shares/units held'
  },
  averageCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Average cost per share in Rands'
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total cost basis in Rands'
  },
  currentPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Current market price in original currency'
  },
  currentValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Current market value in original currency'
  },
  gainLoss: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Unrealized gain/loss in original currency'
  },
  gainLossPercent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Unrealized gain/loss percentage'
  },
  originalCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USD',
    comment: 'Original currency of the investment (e.g., USD for AAPL)'
  },
  averageCostConverted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Average cost per share converted to user currency'
  },
  totalCostConverted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Total cost basis converted to user currency'
  },
  currentPriceConverted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Current price converted to user currency'
  },
  currentValueConverted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Current value converted to user currency'
  },
  gainLossConverted: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Gain/loss converted to user currency'
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Investment sector'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last price update timestamp'
  }
}, {
  timestamps: true,
  tableName: 'portfolio_holdings',
  indexes: [
    {
      fields: ['portfolioId']
    },
    {
      fields: ['symbol']
    },
    {
      unique: true,
      fields: ['portfolioId', 'symbol']
    }
  ]
});

module.exports = PortfolioHolding;
