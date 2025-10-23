const express = require('express');
const axios = require('axios');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');

const router = express.Router();

// Get predictions for a parking lot
router.get('/predict/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    
    // Get historical data for the parking lot
    const parkingLot = await ParkingLot.findById(lotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Get booking history for ML model
    const bookingHistory = await Booking.find({
      parkingLot: lotId,
      status: { $in: ['completed', 'active'] }
    }).sort({ createdAt: -1 }).limit(1000);

    // Prepare data for ML service
    const mlData = {
      lotId,
      currentOccupancy: parkingLot.totalSlots - parkingLot.availableSlots,
      totalSlots: parkingLot.totalSlots,
      currentTime: new Date(),
      historicalData: bookingHistory.map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        dayOfWeek: booking.startTime.getDay(),
        hour: booking.startTime.getHours()
      }))
    };

    try {
      // Call ML service
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, mlData, {
        timeout: 5000
      });

      // Update parking lot with predictions
      parkingLot.predictedAvailability = {
        next1Hour: mlResponse.data.predictions.next1Hour,
        next2Hours: mlResponse.data.predictions.next2Hours,
        next4Hours: mlResponse.data.predictions.next4Hours,
        lastUpdated: new Date()
      };
      await parkingLot.save();

      res.json({
        predictions: mlResponse.data.predictions,
        confidence: mlResponse.data.confidence,
        lastUpdated: new Date()
      });
    } catch (mlError) {
      console.log('ML service unavailable, using fallback predictions');
      
      // Fallback prediction logic
      const currentHour = new Date().getHours();
      const baseAvailability = parkingLot.availableSlots;
      
      // Simple heuristic based on time of day
      let demandMultiplier = 1;
      if (currentHour >= 8 && currentHour <= 10) demandMultiplier = 1.5; // Morning rush
      else if (currentHour >= 17 && currentHour <= 19) demandMultiplier = 1.4; // Evening rush
      else if (currentHour >= 12 && currentHour <= 14) demandMultiplier = 1.2; // Lunch time
      else if (currentHour >= 22 || currentHour <= 6) demandMultiplier = 0.5; // Night time

      const predictions = {
        next1Hour: Math.max(0, Math.floor(baseAvailability - (Math.random() * 3 * demandMultiplier))),
        next2Hours: Math.max(0, Math.floor(baseAvailability - (Math.random() * 5 * demandMultiplier))),
        next4Hours: Math.max(0, Math.floor(baseAvailability - (Math.random() * 8 * demandMultiplier)))
      };

      parkingLot.predictedAvailability = {
        ...predictions,
        lastUpdated: new Date()
      };
      await parkingLot.save();

      res.json({
        predictions,
        confidence: 0.6,
        lastUpdated: new Date(),
        fallback: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update occupancy from CV system
router.post('/occupancy/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    const { slots, detectedVehicles } = req.body;

    const parkingLot = await ParkingLot.findById(lotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Update slot occupancy based on CV detection
    if (slots && Array.isArray(slots)) {
      slots.forEach(detectedSlot => {
        const slot = parkingLot.slots.find(s => s.slotNumber === detectedSlot.slotNumber);
        if (slot) {
          slot.isOccupied = detectedSlot.isOccupied;
          slot.lastUpdated = new Date();
        }
      });

      await parkingLot.updateAvailableSlots();

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`lot-${lotId}`).emit('occupancy-update', {
        availableSlots: parkingLot.availableSlots,
        totalSlots: parkingLot.totalSlots,
        lastUpdated: new Date()
      });
    }

    res.json({
      message: 'Occupancy updated successfully',
      availableSlots: parkingLot.availableSlots,
      detectedVehicles: detectedVehicles || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics data for ML training
router.get('/analytics/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get booking patterns
    const bookingPatterns = await Booking.aggregate([
      {
        $match: {
          parkingLot: mongoose.Types.ObjectId(lotId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$startTime' },
            dayOfWeek: { $dayOfWeek: '$startTime' }
          },
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgAmount: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
    ]);

    // Get occupancy trends
    const occupancyTrends = await Booking.aggregate([
      {
        $match: {
          parkingLot: mongoose.Types.ObjectId(lotId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d-%H', date: '$startTime' }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      bookingPatterns,
      occupancyTrends,
      period: `${days} days`,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;