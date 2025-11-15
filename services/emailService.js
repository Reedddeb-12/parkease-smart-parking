const nodemailer = require('nodemailer');

/**
 * Email Service for ParkEase
 * Handles sending emails for password reset, notifications, etc.
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email not configured. Using console mode for password reset.');
      console.log('💡 To enable email: Set EMAIL_USER and EMAIL_PASS in .env file');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetUrl, userName = 'User') {
    const subject = 'Password Reset Request - ParkEase';
    const html = this.getPasswordResetTemplate(resetUrl, userName);
    const text = `
Hello ${userName},

You requested to reset your password for ParkEase.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
ParkEase Team
    `;

    return await this.sendEmail(email, subject, text, html);
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, text, html) {
    // If transporter not configured, log to console
    if (!this.transporter) {
      console.log('\n' + '='.repeat(70));
      console.log('📧 EMAIL (Console Mode - Email not configured)');
      console.log('='.repeat(70));
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`\n${text}`);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: true,
        mode: 'console',
        message: 'Email logged to console (email service not configured)'
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"ParkEase" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
      });

      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      
      return {
        success: true,
        mode: 'email',
        messageId: info.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      
      // Fallback to console mode
      console.log('\n' + '='.repeat(70));
      console.log('📧 EMAIL (Fallback to Console Mode)');
      console.log('='.repeat(70));
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`\n${text}`);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: true,
        mode: 'console',
        error: error.message,
        message: 'Email logged to console (sending failed)'
      };
    }
  }

  /**
   * Password reset email template
   */
  getPasswordResetTemplate(resetUrl, userName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background: #2563eb;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🅿️ ParkEase</h1>
      <p>Password Reset Request</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName},</h2>
      
      <p>We received a request to reset your password for your ParkEase account.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <div class="info">
        <strong>⏰ Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
      
      <div class="warning">
        <strong>⚠️ Didn't request this?</strong><br>
        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      </div>
      
      <p>Best regards,<br><strong>The ParkEase Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2024 ParkEase. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName) {
    const subject = 'Welcome to ParkEase!';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🅿️ Welcome to ParkEase!</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Thank you for joining ParkEase! We're excited to help you find parking easily.</p>
      <p><strong>What you can do:</strong></p>
      <ul>
        <li>🔍 Find nearby parking lots</li>
        <li>📍 See distances and prices</li>
        <li>🅿️ Book parking spots</li>
        <li>💳 Secure payments</li>
      </ul>
      <p>Start finding parking now!</p>
      <p>Best regards,<br><strong>The ParkEase Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 ParkEase. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    const text = `
Hello ${userName},

Welcome to ParkEase! We're excited to help you find parking easily.

What you can do:
- Find nearby parking lots
- See distances and prices
- Book parking spots
- Secure payments

Start finding parking now!

Best regards,
The ParkEase Team
    `;

    return await this.sendEmail(email, subject, text, html);
  }

  /**
   * Test email configuration
   */
  async testEmailConfig() {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Email service not configured'
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'Email configuration is valid'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email configuration is invalid: ' + error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
