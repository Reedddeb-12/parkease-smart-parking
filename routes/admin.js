const express = require('express');
const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get basic stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalParkingLots = await ParkingLot.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    
    // Today's stats
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Monthly stats
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Occupancy rates
    const occupancyStats = await ParkingLot.aggregate([
      {
        $group: {
          _id: null,
          totalSlots: { $sum: '$totalSlots' },
          occupiedSlots: { $sum: { $subtract: ['$totalSlots', '$availableSlots'] } }
        }
      }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('parkingLot', 'name address')
      .sort({ createdAt: -1 })
      .limit(10);

    // Booking trends (last 7 days)
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalParkingLots,
        totalBookings,
        todayBookings,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        occupancyRate: occupancyStats[0] ? 
          ((occupancyStats[0].occupiedSlots / occupancyStats[0].totalSlots) * 100).toFixed(2) : 0
      },
      recentBookings,
      bookingTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all parking lots
router.get('/parking-lots', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const parkingLots = await ParkingLot.find(query)
      .populate('operator', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingLot.countDocuments(query);

    res.json({
      parkingLots,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all bookings
router.get('/bookings', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('parkingLot', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin', 'operator'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle parking lot status
router.put('/parking-lots/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    parkingLot.isActive = !parkingLot.isActive;
    await parkingLot.save();

    res.json({
      message: `Parking lot ${parkingLot.isActive ? 'activated' : 'deactivated'} successfully`,
      parkingLot
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;