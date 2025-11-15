/**
 * Generate Secure Secrets for ParkEase
 * Run this script to generate secure random secrets for your .env file
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔐 ParkEase Security - Generate Secure Secrets');
console.log('='.repeat(70) + '\n');

// Generate secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const demoPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '!@#';

console.log('✅ Generated secure secrets:\n');

console.log('1. JWT_SECRET (128 characters):');
console.log('   ' + jwtSecret);
console.log('');

console.log('2. DEMO_PASSWORD (secure random):');
console.log('   ' + demoPassword);
console.log('');

console.log('='.repeat(70));
console.log('📝 How to use:');
console.log('='.repeat(70));
console.log('');
console.log('1. Copy the JWT_SECRET above');
console.log('2. Open your .env file');
console.log('3. Replace JWT_SECRET value with the generated one');
console.log('4. Replace DEMO_PASSWORD value with the generated one');
console.log('');
console.log('Example .env configuration:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`DEMO_PASSWORD=${demoPassword}`);
console.log('');

// Ask if user wants to update .env automatically
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to automatically update your .env file? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    try {
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Update JWT_SECRET
      envContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET=${jwtSecret}`
      );

      // Update DEMO_PASSWORD
      if (envContent.includes('DEMO_PASSWORD=')) {
        envContent = envContent.replace(
          /DEMO_PASSWORD=.*/,
          `DEMO_PASSWORD=${demoPassword}`
        );
      } else {
        envContent += `\nDEMO_PASSWORD=${demoPassword}\n`;
      }

      fs.writeFileSync(envPath, envContent);

      console.log('\n✅ .env file updated successfully!');
      console.log('🔒 Your secrets are now secure.');
      console.log('\n⚠️  IMPORTANT: Never commit your .env file to Git!');
      console.log('');
    } catch (error) {
      console.error('\n❌ Error updating .env file:', error.message);
      console.log('Please update manually using the values above.');
    }
  } else {
    console.log('\n📋 Please copy the secrets above and update your .env file manually.');
  }

  console.log('\n' + '='.repeat(70));
  console.log('🔐 Security Tips:');
  console.log('='.repeat(70));
  console.log('');
  console.log('✅ Keep your .env file secure');
  console.log('✅ Never commit secrets to Git');
  console.log('✅ Use different secrets for dev/staging/production');
  console.log('✅ Rotate secrets regularly');
  console.log('✅ Use environment variables in production');
  console.log('');
  console.log('='.repeat(70) + '\n');

  rl.close();
});
