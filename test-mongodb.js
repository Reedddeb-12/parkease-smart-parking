/**
 * Test MongoDB Connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('\n' + '='.repeat(70));
  console.log('🗄️  Testing MongoDB Connection');
  console.log('='.repeat(70) + '\n');

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not configured');
    console.log('\nMongoDB is currently disabled (in-memory mode)');
    console.log('\nTo enable MongoDB:');
    console.log('  1. See MONGODB_SETUP.md for instructions');
    console.log('  2. Create free MongoDB Atlas account');
    console.log('  3. Add MONGODB_URI to .env file');
    console.log('  4. Restart server\n');
    process.exit(0);
  }

  console.log('Configuration:');
  console.log(`  MONGODB_URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
  console.log('');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!\n');
    console.log('Connection Details:');
    console.log(`  📊 Database: ${mongoose.connection.name}`);
    console.log(`  🌐 Host: ${mongoose.connection.host}`);
    console.log(`  📡 Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
    console.log(`  ✅ Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    // Test write operation
    console.log('\nTesting database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`  📁 Collections: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`     ${collections.map(c => c.name).join(', ')}`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    console.log('✅ MongoDB is working correctly!\n');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:\n');
    console.log(`Error: ${error.message}\n`);
    
    console.log('Common Issues:');
    console.log('  1. Invalid connection string');
    console.log('  2. Wrong username or password');
    console.log('  3. IP address not whitelisted');
    console.log('  4. Network/firewall blocking connection');
    console.log('  5. Cluster not ready yet (wait 1-2 minutes)\n');
    
    console.log('Solutions:');
    console.log('  1. Check MONGODB_URI in .env file');
    console.log('  2. Verify username and password');
    console.log('  3. Add 0.0.0.0/0 to Network Access in Atlas');
    console.log('  4. Check internet connection');
    console.log('  5. See MONGODB_SETUP.md for detailed guide\n');
    
    console.log('='.repeat(70) + '\n');
    process.exit(1);
  }
}

testMongoDB();
