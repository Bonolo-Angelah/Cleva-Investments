const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Goal = sequelize.define('Goal', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  targetDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeHorizon: {
    type: DataTypes.ENUM('short', 'medium', 'long'),
    allowNull: false,
    comment: 'short: <2 years, medium: 2-5 years, long: >5 years'
  },
  goalType: {
    type: DataTypes.ENUM('retirement', 'education', 'house', 'emergency_fund', 'wealth_building', 'other'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  monthlyContribution: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  riskTolerance: {
    type: DataTypes.ENUM('conservative', 'moderate', 'aggressive'),
    defaultValue: 'moderate',
    comment: 'Risk tolerance for this specific goal'
  },
  investmentExperience: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    comment: 'Investment experience level for this goal'
  },
  recommendedInvestments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of recommended investment strategies'
  }
}, {
  timestamps: true,
  tableName: 'goals'
});

module.exports = Goal;
