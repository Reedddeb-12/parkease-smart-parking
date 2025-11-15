/**
 * Test User Email - Send to Different Email
 * This simulates a real user requesting password reset
 */

require('dotenv').config();
const emailService = require('./services/emailService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testUserEmail() {
  console.log('\n' + '='.repeat(70));
  console.log('📧 Test Password Reset Email to User');
  console.log('='.repeat(70) + '\n');

  console.log('This will send a password reset email to ANY email address.');
  console.log('Enter the email where you want to receive the reset link.\n');

  rl.question('Enter user email address: ', async (userEmail) => {
    console.log('\n' + '='.repeat(70));
    console.log(`Sending password reset email to: ${userEmail}`);
    console.log('='.repeat(70) + '\n');

    try {
      const resetUrl = 'http://localhost:8888/reset-password.html?token=test123abc';
      
      const result = await emailService.sendPasswordResetEmail(
        userEmail,           // TO: User's email
        resetUrl,
        'Test User'
      );

      if (result.mode === 'email') {
        console.log('✅ Email sent successfully!');
        console.log(`\n📧 Check inbox at: ${userEmail}`);
        console.log('\nEmail details:');
        console.log(`  From: ParkEase <${process.env.EMAIL_USER}>`);
        console.log(`  To: ${userEmail}`);
        console.log(`  Subject: Password Reset Request - ParkEase`);
        console.log(`  Message ID: ${result.messageId}`);
        console.log('\n⏱️  Email should arrive in 10-30 seconds');
        console.log('\n💡 If you don\'t see it:');
        console.log('   1. Check SPAM/Junk folder');
        console.log('   2. Check Promotions tab (Gmail)');
        console.log('   3. Wait 1-2 minutes');
      } else {
        console.log('⚠️  Email service not configured');
        console.log('Email would be sent in production mode');
      }
    } catch (error) {
      console.log('❌ Error sending email:');
      console.log(`   ${error.message}`);
    }

    console.log('\n' + '='.repeat(70) + '\n');
    rl.close();
  });
}

testUserEmail();
