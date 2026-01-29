const User = require('./User');
const Goal = require('./Goal');
const Portfolio = require('./Portfolio');
const PortfolioHolding = require('./PortfolioHolding');
const Transaction = require('./Transaction');

// Define relationships

// User -> Goals
User.hasMany(Goal, {
  foreignKey: 'userId',
  as: 'goals'
});

Goal.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User -> Portfolios
User.hasMany(Portfolio, {
  foreignKey: 'userId',
  as: 'portfolios'
});

Portfolio.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Portfolio -> Holdings
Portfolio.hasMany(PortfolioHolding, {
  foreignKey: 'portfolioId',
  as: 'holdings'
});

PortfolioHolding.belongsTo(Portfolio, {
  foreignKey: 'portfolioId',
  as: 'portfolio'
});

// Portfolio -> Transactions
Portfolio.hasMany(Transaction, {
  foreignKey: 'portfolioId',
  as: 'transactions'
});

Transaction.belongsTo(Portfolio, {
  foreignKey: 'portfolioId',
  as: 'portfolio'
});

// User -> Transactions
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Goal,
  Portfolio,
  PortfolioHolding,
  Transaction
};
