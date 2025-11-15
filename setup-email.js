/**
 * Email Setup Helper for ParkEase
 * Interactive script to configure email settings
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEmail() {
  console.log('\n' + '='.repeat(70));
  console.log('📧 ParkEase Email Setup');
  console.log('='.repeat(70) + '\n');

  console.log('This will help you configure email for password reset functionality.\n');

  // Choose email service
  console.log('Select your email service:');
  console.log('1. Gmail (Recommended)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Yahoo');
  console.log('4. Custom SMTP');
  console.log('5. Skip (Use console mode)\n');

  const choice = await question('Enter choice (1-5): ');

  if (choice === '5') {
    console.log('\n✅ Email setup skipped. Password reset links will show in console.\n');
    rl.close();
    return;
  }

  let emailService = 'gmail';
  let needsAppPassword = true;

  switch (choice) {
    case '1':
      emailService = 'gmail';
      console.log('\n📧 Gmail Setup');
      console.log('You need to generate an App Password:');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Enable 2-Step Verification if not enabled');
      console.log('3. Generate app password for "Mail"');
      console.log('4. Copy the 16-character password\n');
      break;
    case '2':
      emailService = 'outlook';
      console.log('\n📧 Outlook/Hotmail Setup\n');
      needsAppPassword = false;
      break;
    case '3':
      emailService = 'yahoo';
      console.log('\n📧 Yahoo Setup');
      console.log('You need to generate an App Password:');
      console.log('1. Go to: https://login.yahoo.com/account/security');
      console.log('2. Generate app password\n');
      break;
    case '4':
      emailService = 'custom';
      console.log('\n📧 Custom SMTP Setup\n');
      break;
    default:
      console.log('\n❌ Invalid choice. Exiting.\n');
      rl.close();
      return;
  }

  // Get email credentials
  const emailUser = await question('Enter your email address: ');
  
  if (needsAppPassword) {
    console.log('\nEnter your App Password (16 characters):');
  }
  const emailPass = await question('Enter password: ');

  let customHost = '';
  let customPort = '';

  if (emailService === 'custom') {
    customHost = await question('Enter SMTP host (e.g., smtp.example.com): ');
    customPort = await question('Enter SMTP port (usually 587): ');
  }

  // Read current .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('\n⚠️  .env file not found. Creating new one...');
    envContent = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  }

  // Update email configuration
  const emailConfig = emailService === 'custom' 
    ? `EMAIL_HOST=${customHost}\nEMAIL_PORT=${customPort}\nEMAIL_USER=${emailUser}\nEMAIL_PASS=${emailPass}`
    : `EMAIL_SERVICE=${emailService}\nEMAIL_USER=${emailUser}\nEMAIL_PASS=${emailPass}`;

  // Replace or add email configuration
  if (envContent.includes('EMAIL_USER=')) {
    envContent = envContent.replace(/EMAIL_SERVICE=.*/g, emailService === 'custom' ? '' : `EMAIL_SERVICE=${emailService}`);
    envContent = envContent.replace(/EMAIL_HOST=.*/g, customHost ? `EMAIL_HOST=${customHost}` : '');
    envContent = envContent.replace(/EMAIL_PORT=.*/g, customPort ? `EMAIL_PORT=${customPort}` : '');
    envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${emailUser}`);
    envContent = envContent.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${emailPass}`);
  } else {
    envContent += `\n\n# Email Configuration\n${emailConfig}\n`;
  }

  // Save .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n' + '='.repeat(70));
  console.log('✅ Email Configuration Saved!');
  console.log('='.repeat(70));
  console.log('\n📧 Configuration:');
  console.log(`   Service: ${emailService}`);
  console.log(`   Email: ${emailUser}`);
  console.log(`   Password: ${'*'.repeat(emailPass.length)}`);
  if (customHost) {
    console.log(`   Host: ${customHost}`);
    console.log(`   Port: ${customPort}`);
  }

  console.log('\n🚀 Next Steps:');
  console.log('   1. Restart your server: npm start');
  console.log('   2. Test forgot password feature');
  console.log('   3. Check your email inbox!');

  console.log('\n📚 Documentation:');
  console.log('   See EMAIL_SETUP_GUIDE.md for detailed instructions');

  console.log('\n' + '='.repeat(70) + '\n');

  rl.close();
}

// Run setup
setupEmail().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
