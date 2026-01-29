const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models/postgres');
const GraphService = require('../models/neo4j/GraphService');
const emailService = require('../services/emailService');
const currencyService = require('../services/currencyService');

class AuthController {
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        riskTolerance,
        investmentExperience
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        riskTolerance: riskTolerance || 'moderate',
        investmentExperience: investmentExperience || 'beginner',
        emailVerificationToken,
        emailVerificationExpires
      });

      // Create user node in Neo4j
      await GraphService.createUserNode(user.id, {
        riskTolerance: user.riskTolerance,
        investmentExperience: user.investmentExperience
      });

      // Send verification email (don't wait for it)
      emailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken)
        .catch(err => console.error('Failed to send verification email:', err));

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: user.toJSON(),
        token,
        emailSent: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate password
      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        return res.json({
          message: '2FA required',
          requiresTwoFactor: true,
          email: user.email
        });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      res.json({ user: req.user.toJSON() });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const allowedUpdates = [
        'firstName',
        'lastName',
        'phoneNumber',
        'dateOfBirth',
        'riskTolerance',
        'investmentExperience',
        'country',
        'currency'
      ];

      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Auto-set currency based on country if country is provided
      if (updates.country && !updates.currency) {
        updates.currency = currencyService.getCurrencyFromCountry(updates.country);
      }

      await req.user.update(updates);

      // Update Neo4j node if risk tolerance or experience changed
      if (updates.riskTolerance || updates.investmentExperience) {
        await GraphService.createUserNode(req.user.id, {
          riskTolerance: req.user.riskTolerance,
          investmentExperience: req.user.investmentExperience
        });
      }

      res.json({
        message: 'Profile updated successfully',
        user: req.user.toJSON()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Find user with this token
      const user = await User.findOne({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: { [require('sequelize').Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Update user
      await user.update({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      // Send welcome email
      emailService.sendWelcomeEmail(user.email, user.firstName)
        .catch(err => console.error('Failed to send welcome email:', err));

      res.json({
        message: 'Email verified successfully',
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findOne({ where: { email } });

      // Always return success even if user doesn't exist (security best practice)
      if (!user) {
        return res.json({ message: 'If that email exists, a password reset link has been sent' });
      }

      // Generate reset token
      const resetPasswordToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        resetPasswordToken,
        resetPasswordExpires
      });

      // Send password reset email
      await emailService.sendPasswordResetEmail(user.email, user.firstName, resetPasswordToken);

      res.json({ message: 'If that email exists, a password reset link has been sent' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Find user with this token
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Update password
      await user.update({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  /**
   * Setup 2FA - generate secret and QR code
   */
  async setup2FA(req, res) {
    try {
      const user = req.user;

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Cleva Investment (${user.email})`,
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Save secret to user (but don't enable 2FA yet)
      await user.update({
        twoFactorSecret: secret.base32
      });

      res.json({
        message: '2FA secret generated. Scan the QR code with your authenticator app.',
        secret: secret.base32,
        qrCode: qrCodeUrl
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Failed to setup 2FA' });
    }
  }

  /**
   * Enable 2FA - verify code and enable
   */
  async enable2FA(req, res) {
    try {
      const { token } = req.body;
      const user = req.user;

      if (!token) {
        return res.status(400).json({ error: '2FA token is required' });
      }

      if (!user.twoFactorSecret) {
        return res.status(400).json({ error: 'Please setup 2FA first' });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid 2FA token' });
      }

      // Enable 2FA
      await user.update({
        twoFactorEnabled: true
      });

      // Send notification email
      emailService.send2FAEnabledEmail(user.email, user.firstName)
        .catch(err => console.error('Failed to send 2FA notification:', err));

      res.json({
        message: '2FA enabled successfully',
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({ error: 'Failed to enable 2FA' });
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(req, res) {
    try {
      const { token, password } = req.body;
      const user = req.user;

      if (!token || !password) {
        return res.status(400).json({ error: '2FA token and password are required' });
      }

      // Verify password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Verify 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid 2FA token' });
      }

      // Disable 2FA
      await user.update({
        twoFactorEnabled: false,
        twoFactorSecret: null
      });

      res.json({
        message: '2FA disabled successfully',
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({ error: 'Failed to disable 2FA' });
    }
  }

  /**
   * Verify 2FA token during login
   */
  async verify2FA(req, res) {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({ error: 'Email and 2FA token are required' });
      }

      const user = await User.findOne({ where: { email } });

      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Verify 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token: jwtToken
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: 'Failed to verify 2FA' });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(req, res) {
    try {
      const user = req.user;

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Generate new token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await user.update({
        emailVerificationToken,
        emailVerificationExpires
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken);

      res.json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }
}

module.exports = new AuthController();
