/**
 * Create Admin User Script
 * Run this to create an admin account in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./api/models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Admin credentials from environment variables or defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@parkease.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'ParkEase Admin';
    const adminPhone = process.env.ADMIN_PHONE || '+1234567890';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Type: ${existingAdmin.userType}`);
      console.log('\n💡 To update password, delete this user first or use a different email.\n');
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone,
      userType: 'admin'
    });

    await admin.save();

    console.log('🎉 Admin user created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('='.repeat(50));
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   User Type: admin`);
    console.log('='.repeat(50));
    console.log('\n✅ You can now login to the admin dashboard!');
    console.log(`   URL: http://localhost:8888`);
    console.log(`   Click "Admin Login" and use the credentials above.\n`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the script
createAdmin();
