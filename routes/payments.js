const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Simulate payment processing (Razorpay integration would go here)
router.post('/process', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

    if (paymentSuccess) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await booking.save();

      res.json({
        message: 'Payment processed successfully',
        paymentId: booking.paymentId,
        booking
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        message: 'Payment failed',
        error: 'Payment gateway error'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Booking.find({
      user: req.user.userId,
      paymentStatus: 'paid'
    })
    .populate('parkingLot', 'name address')
    .select('paymentId totalAmount paymentStatus createdAt parkingLot vehicleNumber')
    .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refund payment
router.post('/:bookingId/refund', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'No payment to refund' });
    }

    // Simulate refund processing
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Refund processed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;