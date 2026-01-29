const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // Create transporter with Gmail or custom SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    this.appName = 'Cleva Investment';
    this.appUrl = process.env.APP_URL || 'http://localhost:5173';
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, firstName, verificationToken) {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${firstName}!</h2>
            <p>Thank you for registering with ${this.appName}. We're excited to help you achieve your investment goals.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.appName}" <${this.from}>`,
      to: email,
      subject: `Verify your ${this.appName} account`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, firstName, resetToken) {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password for your ${this.appName} account.</p>
            <p>Click the button below to reset your password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.appName}" <${this.from}>`,
      to: email,
      subject: `Reset your ${this.appName} password`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send 2FA setup email
   */
  async send2FAEnabledEmail(email, firstName) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          <div class="content">
            <h2>Two-Factor Authentication Enabled</h2>
            <p>Hi ${firstName},</p>
            <div class="success">
              <strong>✅ Success!</strong> Two-factor authentication has been enabled on your account.
            </div>
            <p>Your account is now more secure. You'll need to enter a code from your authenticator app each time you log in.</p>
            <p><strong>What this means:</strong></p>
            <ul>
              <li>Enhanced security for your account</li>
              <li>Protection against unauthorized access</li>
              <li>Required authenticator app for login</li>
            </ul>
            <p>If you didn't enable 2FA, please contact support immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.appName}" <${this.from}>`,
      to: email,
      subject: `Two-Factor Authentication Enabled - ${this.appName}`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`2FA enabled notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending 2FA notification:', error);
      return false;
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email, firstName) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${this.appName}!</h1>
          </div>
          <div class="content">
            <h2>Your email has been verified, ${firstName}!</h2>
            <p>You're all set to start your investment journey with us. Here's what you can do:</p>

            <div class="feature">
              <strong>📊 Create Financial Goals</strong>
              <p>Set targets for retirement, house purchase, education, and more.</p>
            </div>

            <div class="feature">
              <strong>💬 AI Investment Advisor</strong>
              <p>Chat with our AI for personalized investment recommendations.</p>
            </div>

            <div class="feature">
              <strong>📈 Market Explorer</strong>
              <p>Search stocks, view trends, and track top performers in real-time.</p>
            </div>

            <div class="feature">
              <strong>💼 Portfolio Tracking</strong>
              <p>Track your investments and monitor performance.</p>
            </div>

            <center>
              <a href="${this.appUrl}/dashboard" class="button">Go to Dashboard</a>
            </center>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${this.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.appName}" <${this.from}>`,
      to: email,
      subject: `Welcome to ${this.appName}! 🎉`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
