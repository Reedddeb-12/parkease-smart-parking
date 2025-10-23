const express = require('express');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { parkingLotId, slotNumber, vehicleNumber, vehicleType, startTime, endTime } = req.body;

    // Validate parking lot and slot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const slot = parkingLot.slots.find(s => s.slotNumber === slotNumber);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isOccupied) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }

    // Calculate duration and amount
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.ceil((end - start) / (1000 * 60)); // minutes
    const totalAmount = Math.ceil(duration / 60) * parkingLot.pricePerHour;

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      parkingLot: parkingLotId,
      slotNumber,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      startTime: start,
      endTime: end,
      duration,
      totalAmount
    });

    // Generate QR code
    const qrData = {
      bookingId: booking._id,
      parkingLotId,
      slotNumber,
      vehicleNumber: vehicleNumber.toUpperCase(),
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    booking.qrCode = qrCode;

    await booking.save();

    // Update slot status
    slot.isOccupied = true;
    slot.currentBooking = booking._id;
    slot.lastUpdated = new Date();
    await parkingLot.updateAvailableSlots();

    // Add to user's booking history
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { bookingHistory: booking._id }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`lot-${parkingLotId}`).emit('slot-update', {
      slotNumber,
      isOccupied: true,
      availableSlots: parkingLot.availableSlots
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: await booking.populate(['parkingLot', 'user'])
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('parkingLot', 'name address location pricePerHour')
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

// Get booking details
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership or admin access
    if (booking.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate entry (QR scan)
router.post('/:id/validate-entry', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking not confirmed' });
    }

    if (new Date() < booking.startTime) {
      return res.status(400).json({ message: 'Booking not yet active' });
    }

    if (new Date() > booking.endTime) {
      return res.status(400).json({ message: 'Booking has expired' });
    }

    // Validate entry
    booking.entryValidated = true;
    booking.actualStartTime = new Date();
    booking.status = 'active';
    await booking.save();

    res.json({
      message: 'Entry validated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate exit (QR scan)
router.post('/:id/validate-exit', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking not active' });
    }

    // Validate exit
    booking.exitValidated = true;
    booking.actualEndTime = new Date();
    booking.status = 'completed';
    await booking.save();

    // Free up the slot
    const parkingLot = booking.parkingLot;
    const slot = parkingLot.slots.find(s => s.slotNumber === booking.slotNumber);
    if (slot) {
      slot.isOccupied = false;
      slot.currentBooking = null;
      slot.lastUpdated = new Date();
      await parkingLot.updateAvailableSlots();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`lot-${parkingLot._id}`).emit('slot-update', {
      slotNumber: booking.slotNumber,
      isOccupied: false,
      availableSlots: parkingLot.availableSlots
    });

    res.json({
      message: 'Exit validated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'active' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel active or completed booking' });
    }

    // Cancel booking
    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot
    const parkingLot = booking.parkingLot;
    const slot = parkingLot.slots.find(s => s.slotNumber === booking.slotNumber);
    if (slot) {
      slot.isOccupied = false;
      slot.currentBooking = null;
      slot.lastUpdated = new Date();
      await parkingLot.updateAvailableSlots();
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;