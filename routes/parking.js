const express = require('express');
const ParkingLot = require('../models/ParkingLot');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Get nearby parking lots
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const parkingLots = await ParkingLot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      isActive: true
    }).populate('operator', 'name email phone');

    // Get ML predictions for each lot
    const lotsWithPredictions = await Promise.all(
      parkingLots.map(async (lot) => {
        try {
          const mlResponse = await axios.get(`${process.env.ML_SERVICE_URL}/predict/${lot._id}`);
          lot.predictedAvailability = mlResponse.data.predictions;
        } catch (error) {
          console.log('ML service unavailable, using default predictions');
          lot.predictedAvailability = {
            next1Hour: Math.max(0, lot.availableSlots - Math.floor(Math.random() * 5)),
            next2Hours: Math.max(0, lot.availableSlots - Math.floor(Math.random() * 8)),
            next4Hours: Math.max(0, lot.availableSlots - Math.floor(Math.random() * 12)),
            lastUpdated: new Date()
          };
        }
        return lot;
      })
    );

    res.json({
      parkingLots: lotsWithPredictions,
      count: lotsWithPredictions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get parking lot details
router.get('/:id', async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('operator', 'name email phone');

    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Get real-time availability from CV service
    try {
      const cvResponse = await axios.get(`${process.env.CV_SERVICE_URL}/occupancy/${req.params.id}`);
      parkingLot.slots = cvResponse.data.slots;
      parkingLot.availableSlots = cvResponse.data.availableSlots;
    } catch (error) {
      console.log('CV service unavailable, using stored data');
    }

    res.json({ parkingLot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search parking lots
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { lat, lng } = req.query;

    let searchCriteria = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    };

    let parkingLots;

    if (lat && lng) {
      // Search with location priority
      parkingLots = await ParkingLot.aggregate([
        { $match: searchCriteria },
        {
          $addFields: {
            distance: {
              $sqrt: {
                $add: [
                  { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates', 1] }, parseFloat(lat)] }, 2] },
                  { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates', 0] }, parseFloat(lng)] }, 2] }
                ]
              }
            }
          }
        },
        { $sort: { distance: 1 } },
        { $limit: 20 }
      ]);
    } else {
      parkingLots = await ParkingLot.find(searchCriteria).limit(20);
    }

    res.json({
      parkingLots,
      count: parkingLots.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create parking lot (admin/operator only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const parkingLotData = {
      ...req.body,
      operator: req.user.userId
    };

    // Initialize slots
    const slots = [];
    for (let i = 1; i <= parkingLotData.totalSlots; i++) {
      slots.push({
        slotNumber: `S${i.toString().padStart(3, '0')}`,
        isOccupied: false,
        vehicleType: 'any'
      });
    }
    parkingLotData.slots = slots;
    parkingLotData.availableSlots = parkingLotData.totalSlots;

    const parkingLot = new ParkingLot(parkingLotData);
    await parkingLot.save();

    res.status(201).json({
      message: 'Parking lot created successfully',
      parkingLot
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update parking lot
router.put('/:id', auth, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Check ownership or admin role
    if (req.user.role !== 'admin' && parkingLot.operator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedLot = await ParkingLot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Parking lot updated successfully',
      parkingLot: updatedLot
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;