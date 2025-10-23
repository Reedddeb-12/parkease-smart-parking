#!/usr/bin/env node

/**
 * ParkEase Setup Script
 * Helps configure the application for first-time use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚗 Welcome to ParkEase Setup!\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupDatabase() {
  console.log('📊 Database Configuration\n');
  
  const hasPassword = await askQuestion('Do you have your MongoDB Atlas password? (y/n): ');
  
  if (hasPassword.toLowerCase() === 'y' || hasPassword.toLowerCase() === 'yes') {
    const password = await askQuestion('Enter your MongoDB Atlas password: ');
    
    // Read current .env file
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Replace placeholder with actual password
    envContent = envContent.replace('<db_password>', password);
    
    // Write updated .env file
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Database configuration updated!\n');
    
    // Test connection
    console.log('🔍 Testing database connection...\n');
    
    try {
      const mongoose = require('mongoose');
      const connectionString = envContent.match(/MONGODB_URI=(.*)/)[1];
      
      await mongoose.connect(connectionString);
      console.log('✅ Database connection successful!\n');
      mongoose.disconnect();
      
      return true;
    } catch (error) {
      console.log('❌ Database connection failed:');
      console.log('Error:', error.message);
      console.log('\nPlease check:');
      console.log('1. Your password is correct');
      console.log('2. Network access is configured in MongoDB Atlas');
      console.log('3. Your IP address is whitelisted\n');
      
      return false;
    }
  } else {
    console.log('\n📋 To get your MongoDB Atlas password:');
    console.log('1. Go to https://cloud.mongodb.com');
    console.log('2. Sign in to your account');
    console.log('3. Go to Database Access → Edit User');
    console.log('4. Set a new password');
    console.log('5. Run this setup script again\n');
    
    return false;
  }
}

async function setupJWT() {
  console.log('🔐 JWT Secret Configuration\n');
  
  const useCustomSecret = await askQuestion('Do you want to set a custom JWT secret? (y/n): ');
  
  if (useCustomSecret.toLowerCase() === 'y' || useCustomSecret.toLowerCase() === 'yes') {
    const jwtSecret = await askQuestion('Enter your JWT secret (min 32 characters): ');
    
    if (jwtSecret.length < 32) {
      console.log('⚠️  JWT secret should be at least 32 characters for security');
      console.log('Using default secure secret...\n');
    } else {
      // Update .env file
      let envContent = fs.readFileSync('.env', 'utf8');
      envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`);
      fs.writeFileSync('.env', envContent);
      
      console.log('✅ JWT secret updated!\n');
    }
  } else {
    console.log('✅ Using default secure JWT secret\n');
  }
}

async function createSampleData() {
  console.log('📝 Sample Data\n');
  
  const createSample = await askQuestion('Do you want to create sample parking lots? (y/n): ');
  
  if (createSample.toLowerCase() === 'y' || createSample.toLowerCase() === 'yes') {
    console.log('✅ Sample data will be created when you start the server\n');
    
    // Create a flag file
    fs.writeFileSync('.create-sample-data', 'true');
  }
}

async function main() {
  try {
    // Check if .env exists
    if (!fs.existsSync('.env')) {
      console.log('📄 Creating .env file from template...\n');
      fs.copyFileSync('.env.example', '.env');
    }
    
    // Setup database
    const dbSuccess = await setupDatabase();
    
    if (dbSuccess) {
      // Setup JWT
      await setupJWT();
      
      // Sample data
      await createSampleData();
      
      console.log('🎉 Setup Complete!\n');
      console.log('Next steps:');
      console.log('1. Run: npm install');
      console.log('2. Run: npm run dev');
      console.log('3. Open: http://localhost:3000\n');
      
      console.log('🔗 Useful URLs:');
      console.log('• Application: http://localhost:3000');
      console.log('• API Health: http://localhost:3000/api/health');
      console.log('• MongoDB Atlas: https://cloud.mongodb.com\n');
      
    } else {
      console.log('⚠️  Setup incomplete. Please fix database connection and run setup again.\n');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup
main();