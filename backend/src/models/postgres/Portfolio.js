const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Portfolio = sequelize.define('Portfolio', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Portfolio name (e.g., "Retirement Portfolio", "Growth Portfolio")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Portfolio description'
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Current total value of portfolio in Rands'
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Total cost basis (amount invested) in Rands'
  },
  totalGainLoss: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Total gain or loss in Rands'
  },
  totalGainLossPercent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Total gain or loss percentage'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether portfolio is active'
  }
}, {
  timestamps: true,
  tableName: 'portfolios',
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

module.exports = Portfolio;
