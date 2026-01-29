const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ISO country code (e.g., ZA, US, GB)'
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'USD',
    comment: 'Preferred currency code (e.g., ZAR, USD, EUR)'
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  riskTolerance: {
    type: DataTypes.ENUM('conservative', 'moderate', 'aggressive'),
    defaultValue: 'moderate'
  },
  investmentExperience: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    comment: 'User role for access control'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether user has verified their email address'
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for email verification'
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration date for email verification token'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for password reset'
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiration date for password reset token'
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Secret key for two-factor authentication'
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether 2FA is enabled for this user'
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Remove sensitive fields from JSON output
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.emailVerificationToken;
  delete values.resetPasswordToken;
  delete values.twoFactorSecret;
  return values;
};

module.exports = User;
