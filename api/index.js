const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  }
};

// Models
const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const Booking = require('./models/Booking');

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
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
  await connectDB();
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
  await connectDB();
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

app.post('/api/auth/demo', async (req, res) => {
  await connectDB();
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

app.get('/api/parking', async (req, res) => {
  await connectDB();
  try {
    const lots = await ParkingLot.find({ isActive: true });
    res.json({ success: true, count: lots.length, data: lots });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/parking', async (req, res) => {
  await connectDB();
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

app.post('/api/bookings', async (req, res) => {
  await connectDB();
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

app.get('/api/health', async (req, res) => {
  await connectDB();
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
