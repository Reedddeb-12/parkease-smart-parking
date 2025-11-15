/**
 * Test Email Configuration
 * Run this to verify email is working
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('\n' + '='.repeat(70));
  console.log('📧 Testing Email Configuration');
  console.log('='.repeat(70) + '\n');

  // Check configuration
  console.log('Configuration:');
  console.log(`  EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'NOT SET'}`);
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '******* (set)' : 'NOT SET'}`);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email not configured!');
    console.log('Please set EMAIL_USER and EMAIL_PASS in .env file');
    process.exit(1);
  }

  // Test email configuration
  console.log('Testing email service...\n');
  
  try {
    const result = await emailService.testEmailConfig();
    
    if (result.success) {
      console.log('✅ Email configuration is valid!');
      console.log('');
      
      // Send test email
      console.log('Sending test email...');
      const testResult = await emailService.sendPasswordResetEmail(
        process.env.EMAIL_USER,
        'http://localhost:8888/reset-password.html?token=test123',
        'Test User'
      );
      
      if (testResult.mode === 'email') {
        console.log('✅ Test email sent successfully!');
        console.log(`   Check inbox: ${process.env.EMAIL_USER}`);
      } else {
        console.log('⚠️  Email service not configured, using console mode');
        console.log('   Email would be sent in production');
      }
    } else {
      console.log('❌ Email configuration is invalid!');
      console.log(`   Error: ${result.message}`);
      console.log('');
      console.log('Common issues:');
      console.log('  1. Using regular password instead of App Password');
      console.log('  2. 2-Step Verification not enabled');
      console.log('  3. Incorrect email or password');
      console.log('');
      console.log('Fix:');
      console.log('  1. Go to: https://myaccount.google.com/apppasswords');
      console.log('  2. Generate new App Password');
      console.log('  3. Update EMAIL_PASS in .env file');
    }
  } catch (error) {
    console.log('❌ Error testing email:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Check EMAIL_USER is correct');
    console.log('  2. Check EMAIL_PASS is App Password (not regular password)');
    console.log('  3. Verify 2-Step Verification is enabled');
    console.log('  4. Try generating new App Password');
  }

  console.log('');
  console.log('='.repeat(70) + '\n');
}

testEmail();
