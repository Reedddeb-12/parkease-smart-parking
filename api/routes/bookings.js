const express = require('express');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('parkingLot', 'name address location pricePerHour')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('parkingLot', 'name address location pricePerHour owner');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking or owns the parking lot
    if (booking.user._id.toString() !== req.user.id && 
        booking.parkingLot.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      parkingLotId,
      vehicleName,
      vehicleNumber,
      vehicleType,
      duration,
      startTime
    } = req.body;
    
    // Validate required fields
    if (!parkingLotId || !vehicleName || !vehicleNumber || !vehicleType || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get parking lot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }
    
    // Check availability
    if (parkingLot.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No slots available'
      });
    }
    
    // Calculate amount
    const amount = duration * parkingLot.pricePerHour;
    
    // Create booking
    const booking = new Booking({
      user: req.user.id,
      parkingLot: parkingLotId,
      vehicle: {
        name: vehicleName,
        number: vehicleNumber.toUpperCase(),
        type: vehicleType
      },
      duration,
      startTime: startTime ? new Date(startTime) : new Date(),
      amount,
      status: 'confirmed',
      paymentStatus: 'paid' // Simplified for demo
    });
    
    // Calculate end time
    const start = booking.startTime;
    booking.endTime = new Date(start.getTime() + (duration * 60 * 60 * 1000));
    
    await booking.save();
    
    // Update parking lot availability
    await parkingLot.bookSlot(amount);
    
    // Update user stats
    const user = await User.findById(req.user.id);
    await user.updateStats(amount);
    
    // Populate booking data for response
    await booking.populate('parkingLot', 'name address location');
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/extend
// @desc    Extend booking duration
// @access  Private
router.post('/:id/extend', auth, async (req, res) => {
  try {
    const { additionalHours } = req.body;
    
    if (!additionalHours || additionalHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid additional hours'
      });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot', 'pricePerHour');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to extend this booking'
      });
    }
    
    // Check if booking is active
    if (booking.status !== 'active' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot extend inactive booking'
      });
    }
    
    // Calculate additional amount
    const additionalAmount = additionalHours * booking.parkingLot.pricePerHour;
    
    // Extend booking
    await booking.extend(additionalHours, additionalAmount);
    
    res.json({
      success: true,
      message: 'Booking extended successfully',
      data: {
        newEndTime: booking.endTime,
        additionalAmount,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('Extend booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }
    
    // Cancel booking
    await booking.cancel(reason);
    
    // Release parking slot if not yet used
    if (booking.status === 'confirmed' && !booking.entryTime) {
      await booking.parkingLot.releaseSlot();
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/checkin
// @desc    Check in to parking (scan QR)
// @access  Private
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in this booking'
      });
    }
    
    // Check if booking is valid for check-in
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not valid for check-in'
      });
    }
    
    // Check if already checked in
    if (booking.entryTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in'
      });
    }
    
    // Mark entry
    await booking.markEntry();
    
    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        entryTime: booking.entryTime,
        endTime: booking.endTime
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/checkout
// @desc    Check out from parking
// @access  Private
router.post('/:id/checkout', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check out this booking'
      });
    }
    
    // Check if booking is active
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not active'
      });
    }
    
    // Check if already checked out
    if (booking.exitTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }
    
    // Mark exit
    await booking.markExit();
    
    // Release parking slot
    await booking.parkingLot.releaseSlot();
    
    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        exitTime: booking.exitTime,
        totalDuration: booking.totalDuration,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/qr/:qrCode
// @desc    Get booking by QR code
// @access  Public (for parking lot scanners)
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const booking = await Booking.findOne({ qrCode: req.params.qrCode })
      .populate('user', 'name phone')
      .populate('parkingLot', 'name address');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: booking._id,
        user: booking.user,
        parkingLot: booking.parkingLot,
        vehicle: booking.vehicle,
        status: booking.statusDisplay,
        startTime: booking.startTime,
        endTime: booking.endTime,
        entryTime: booking.entryTime,
        exitTime: booking.exitTime,
        timeRemaining: booking.timeRemaining
      }
    });
  } catch (error) {
    console.error('QR lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lookup QR code',
      error: error.message
    });
  }
});

module.exports = router;