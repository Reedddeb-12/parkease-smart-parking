/**
 * MongoDB Atlas Setup Helper
 * Interactive script to configure MongoDB
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupMongoDB() {
  console.log('\n' + '='.repeat(70));
  console.log('🗄️  MongoDB Atlas Setup Helper');
  console.log('='.repeat(70) + '\n');

  console.log('This will help you set up MongoDB Atlas (FREE cloud database).\n');

  const choice = await question('Have you already created a MongoDB Atlas account? (yes/no): ');

  if (choice.toLowerCase() !== 'yes' && choice.toLowerCase() !== 'y') {
    console.log('\n📝 Step 1: Create MongoDB Atlas Account');
    console.log('='.repeat(70));
    console.log('\n1. Open this URL in your browser:');
    console.log('   https://www.mongodb.com/cloud/atlas/register\n');
    console.log('2. Sign up with:');
    console.log('   - Email: parkease25@gmail.com (or your email)');
    console.log('   - Create a password');
    console.log('   - Verify your email\n');
    console.log('3. Create a FREE cluster:');
    console.log('   - Choose: M0 FREE (Shared)');
    console.log('   - Provider: AWS');
    console.log('   - Region: Choose closest to you');
    console.log('   - Cluster Name: Cluster0\n');
    console.log('4. Create Database User:');
    console.log('   - Username: parkease');
    console.log('   - Password: parkease123');
    console.log('   - Privileges: Read and write to any database\n');
    console.log('5. Whitelist IP Address:');
    console.log('   - Click "Network Access"');
    console.log('   - Add IP Address: 0.0.0.0/0 (Allow from anywhere)\n');
    
    const ready = await question('Press Enter when you have completed these steps...');
  }

  console.log('\n📋 Step 2: Get Connection String');
  console.log('='.repeat(70));
  console.log('\n1. Go to MongoDB Atlas Dashboard');
  console.log('2. Click "Database" in left sidebar');
  console.log('3. Click "Connect" button on your cluster');
  console.log('4. Choose "Connect your application"');
  console.log('5. Copy the connection string\n');
  console.log('It should look like:');
  console.log('mongodb+srv://parkease:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority\n');

  const connectionString = await question('Paste your MongoDB connection string here: ');

  if (!connectionString || !connectionString.includes('mongodb')) {
    console.log('\n❌ Invalid connection string. Please try again.');
    rl.close();
    return;
  }

  // Replace <password> if present
  let finalConnectionString = connectionString.trim();
  if (finalConnectionString.includes('<password>')) {
    const password = await question('\nEnter your database password: ');
    finalConnectionString = finalConnectionString.replace('<password>', password);
  }

  // Add database name if not present
  if (!finalConnectionString.includes('/parkease')) {
    finalConnectionString = finalConnectionString.replace('/?', '/parkease?');
    finalConnectionString = finalConnectionString.replace('?', '/parkease?');
  }

  console.log('\n🧪 Testing connection...');

  try {
    await mongoose.connect(finalConnectionString);
    console.log('✅ Connection successful!\n');
    
    console.log('Connection Details:');
    console.log(`  📊 Database: ${mongoose.connection.name}`);
    console.log(`  🌐 Host: ${mongoose.connection.host}`);
    console.log(`  ✅ Status: Connected`);
    
    await mongoose.connection.close();

    // Update .env file
    console.log('\n📝 Updating .env file...');
    
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add MONGODB_URI
    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI=${finalConnectionString}`);
      // Uncomment if commented
      envContent = envContent.replace(/# MONGODB_URI=/g, 'MONGODB_URI=');
    } else {
      envContent = `MONGODB_URI=${finalConnectionString}\n` + envContent;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('✅ .env file updated!\n');
    console.log('='.repeat(70));
    console.log('🎉 MongoDB Setup Complete!');
    console.log('='.repeat(70));
    console.log('\n✅ What was configured:');
    console.log('   • MongoDB Atlas connection');
    console.log('   • Database: parkease');
    console.log('   • Connection string saved to .env');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Restart your server: npm start');
    console.log('   2. Look for: ✅ MongoDB Connected');
    console.log('   3. Your data will now persist!\n');
    console.log('📊 Benefits:');
    console.log('   ✅ Users saved permanently');
    console.log('   ✅ Bookings persist across restarts');
    console.log('   ✅ 512 MB free storage');
    console.log('   ✅ Production ready\n');

  } catch (error) {
    console.log('❌ Connection failed!\n');
    console.log(`Error: ${error.message}\n`);
    console.log('Common issues:');
    console.log('  1. Wrong username or password');
    console.log('  2. IP address not whitelisted (add 0.0.0.0/0)');
    console.log('  3. Cluster not ready yet (wait 1-2 minutes)');
    console.log('  4. Invalid connection string format\n');
    console.log('Please check and try again.\n');
  }

  rl.close();
}

setupMongoDB().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
