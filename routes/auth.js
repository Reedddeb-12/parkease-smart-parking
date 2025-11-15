const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../api/models/User');
const emailService = require('../services/emailService');

// Store reset tokens in memory (in production, use Redis or database)
const resetTokens = new Map();

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store token with expiry (10 minutes)
    resetTokens.set(resetTokenHash, {
      userId: user._id.toString(),
      email: user.email,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8888'}/reset-password.html?token=${resetToken}`;

    // Send email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.name
    );

    // Log to console for development
    console.log('\n='.repeat(70));
    console.log('🔐 PASSWORD RESET REQUEST');
    console.log('='.repeat(70));
    console.log(`Email: ${email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log(`Token expires in: 10 minutes`);
    console.log(`Email Status: ${emailResult.mode === 'email' ? '✅ Sent' : '⚠️  Console Mode'}`);
    console.log('='.repeat(70) + '\n');

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      emailSent: emailResult.mode === 'email',
      // Include reset URL in development mode only
      ...(process.env.NODE_ENV === 'development' && { 
        resetUrl: resetUrl,
        devNote: 'Reset link shown in development mode'
      })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token to compare
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Get token data
    const tokenData = resetTokens.get(resetTokenHash);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token expired
    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(resetTokenHash);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Find user and update password
    const user = await User.findById(tokenData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used token
    resetTokens.delete(resetTokenHash);

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

/**
 * @route   POST /api/auth/verify-reset-token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = resetTokens.get(resetTokenHash);

    if (!tokenData || Date.now() > tokenData.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.json({
      success: true,
      email: tokenData.email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
