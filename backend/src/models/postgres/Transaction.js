const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
    comment: 'Stock/ETF symbol (e.g., AAPL, SPY)'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Investment name'
  },
  type: {
    type: DataTypes.ENUM('buy', 'sell', 'dividend'),
    allowNull: false,
    comment: 'Transaction type'
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    comment: 'Number of shares/units'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Price per share'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total transaction amount'
  },
  fees: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Transaction fees'
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USD',
    comment: 'Currency used for transaction (e.g., USD, ZAR, EUR)'
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: true,
    comment: 'Exchange rate at time of transaction (to user currency)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Transaction notes'
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date of transaction'
  }
}, {
  timestamps: true,
  tableName: 'transactions',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['portfolioId']
    },
    {
      fields: ['symbol']
    },
    {
      fields: ['transactionDate']
    }
  ]
});

module.exports = Transaction;
