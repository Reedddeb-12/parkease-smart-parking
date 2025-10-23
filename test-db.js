const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ test: 'Hello ParkEase!' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up!');
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check your MongoDB Atlas username and password');
      console.log('2. Make sure the user has proper permissions');
      console.log('3. Verify network access is configured (0.0.0.0/0)');
      console.log('4. Try resetting the database user password');
    }
    
    process.exit(1);
  }
}

testConnection();