/**
 * Simple ParkEase Server with MongoDB Integration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Running without database...');
  });

// Import models
const User = require('./api/models/User');
const ParkingLot = require('./api/models/ParkingLot');
const Booking = require('./api/models/Booking');

// Simple API routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const user = new User({ name, email, password, phone });
    await user.save();
    
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/parking', async (req, res) => {
  try {
    const { name, address, latitude, longitude, totalSlots, pricePerHour, description } = req.body;
    
    const parkingLot = new ParkingLot({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      totalSlots,
      availableSlots: totalSlots,
      pricePerHour,
      description,
      owner: '507f1f77bcf86cd799439011' // Dummy owner ID for now
    });
    
    await parkingLot.save();
    
    res.json({
      success: true,
      message: 'Parking lot created successfully',
      data: parkingLot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/parking', async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find({ isActive: true });
    
    res.json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { parkingLotId, vehicleName, vehicleNumber, vehicleType, duration } = req.body;
    
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || parkingLot.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No slots available'
      });
    }
    
    const amount = duration * parkingLot.pricePerHour;
    
    const booking = new Booking({
      user: '507f1f77bcf86cd799439011', // Dummy user ID for now
      parkingLot: parkingLotId,
      vehicle: {
        name: vehicleName,
        number: vehicleNumber,
        type: vehicleType
      },
      duration,
      amount,
      status: 'confirmed'
    });
    
    await booking.save();
    await parkingLot.bookSlot(amount);
    
    res.json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Find available port and start server
const startServer = async () => {
  const ports = [8888, 3333, 5555, 7890, 9090, 4444];
  
  for (const port of ports) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`🚀 ParkEase Server running on port ${port}`);
          console.log(`📱 Frontend: http://localhost:${port}`);
          console.log(`🔗 API: http://localhost:${port}/api`);
          console.log(`💾 Database: MongoDB Atlas`);
          console.log(`\n✅ Server started successfully!`);
          console.log(`\n🌐 Open your browser: http://localhost:${port}`);
          resolve();
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            reject(err);
          }
        });
      });
      break; // If we get here, server started successfully
    } catch (error) {
      console.log(`Port ${port} is in use, trying next...`);
      continue;
    }
  }
};

startServer();