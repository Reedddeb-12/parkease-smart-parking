const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Simple middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.log('⚠️  WARNING: MONGODB_URI not set. Running without database.');
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => {
      console.log('❌ MongoDB Error:', err.message);
      console.log('⚠️  Server will continue without database');
    });
}

// Models
const User = require('./api/models/User');
const ParkingLot = require('./api/models/ParkingLot');
const Booking = require('./api/models/Booking');

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = new User({ name, email, password, phone });
    await user.save();
    
    res.json({
      success: true,
      token: 'token-' + user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      token: 'token-' + user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, userType: 'admin' }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    res.json({
      success: true,
      token: 'admin-token-' + user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/admin-register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const admin = new User({
      name,
      email,
      password,
      phone,
      userType: 'admin'
    });
    
    await admin.save();
    
    res.json({
      success: true,
      token: 'admin-token-' + admin._id,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        initials: admin.initials,
        userType: admin.userType
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/demo', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'demo@parkease.com' });
    
    if (!user) {
      user = new User({
        name: 'Demo User',
        email: 'demo@parkease.com',
        password: 'demo123',
        phone: '+1234567890'
      });
      await user.save();
    }
    
    res.json({
      success: true,
      token: 'demo-token-' + user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Auth Routes (Forgot Password)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Parking Routes
app.get('/api/parking', async (req, res) => {
  try {
    const lots = await ParkingLot.find({ isActive: true });
    res.json({ success: true, count: lots.length, data: lots });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Nearby parking search routes
const parkingNearbyRoutes = require('./routes/parking-nearby');
app.use('/api/parking', parkingNearbyRoutes);

app.post('/api/parking', async (req, res) => {
  try {
    const { name, address, latitude, longitude, totalSlots, pricePerHour, description } = req.body;
    
    const lot = new ParkingLot({
      name,
      address,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      totalSlots,
      availableSlots: totalSlots,
      pricePerHour,
      description,
      owner: '507f1f77bcf86cd799439011'
    });
    
    await lot.save();
    res.json({ success: true, data: lot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Booking Routes
app.post('/api/bookings', async (req, res) => {
  try {
    const { parkingLotId, vehicleName, vehicleNumber, vehicleType, duration } = req.body;
    
    const lot = await ParkingLot.findById(parkingLotId);
    if (!lot || lot.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: 'No slots available' });
    }
    
    const amount = duration * lot.pricePerHour;
    
    const booking = new Booking({
      user: '507f1f77bcf86cd799439011',
      parkingLot: parkingLotId,
      vehicle: { name: vehicleName, number: vehicleNumber, type: vehicleType },
      duration,
      amount,
      status: 'confirmed'
    });
    
    await booking.save();
    await lot.bookSlot(amount);
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 8888;

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 ParkEase Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
  console.log('='.repeat(50));
}).on('error', (err) => {
  console.error('❌ Server Error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});
