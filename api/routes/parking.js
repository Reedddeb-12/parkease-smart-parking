const express = require('express');
const ParkingLot = require('../models/ParkingLot');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking
// @desc    Get all parking lots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, available } = req.query;
    let query = { isActive: true };
    
    // Filter by availability if specified
    if (available === 'true') {
      query.availableSlots = { $gt: 0 };
    }
    
    let parkingLots;
    
    if (lat && lng) {
      // Find nearby parking lots
      parkingLots = await ParkingLot.findNearby(
        parseFloat(lng), 
        parseFloat(lat), 
        parseInt(radius)
      );
    } else {
      // Get all parking lots
      parkingLots = await ParkingLot.find(query)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    console.error('Get parking lots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parking lots',
      error: error.message
    });
  }
});

// @route   GET /api/parking/nearby
// @desc    Get nearby parking lots
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const parkingLots = await ParkingLot.findNearby(
      parseFloat(lng), 
      parseFloat(lat), 
      parseInt(radius)
    );
    
    res.json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    console.error('Get nearby parking lots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby parking lots',
      error: error.message
    });
  }
});

// @route   GET /api/parking/:id
// @desc    Get single parking lot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }
    
    res.json({
      success: true,
      data: parkingLot
    });
  } catch (error) {
    console.error('Get parking lot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parking lot',
      error: error.message
    });
  }
});

// @route   POST /api/parking
// @desc    Create new parking lot
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      totalSlots,
      pricePerHour,
      description,
      amenities,
      operatingHours
    } = req.body;
    
    // Validate required fields
    if (!name || !address || !latitude || !longitude || !totalSlots || !pricePerHour) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
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
      amenities,
      operatingHours,
      owner: req.user.id
    });
    
    await parkingLot.save();
    
    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully',
      data: parkingLot
    });
  } catch (error) {
    console.error('Create parking lot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parking lot',
      error: error.message
    });
  }
});

// @route   PUT /api/parking/:id
// @desc    Update parking lot
// @access  Private (Owner or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }
    
    // Check if user is owner or admin
    if (parkingLot.owner.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this parking lot'
      });
    }
    
    const {
      name,
      address,
      latitude,
      longitude,
      totalSlots,
      pricePerHour,
      description,
      amenities,
      operatingHours
    } = req.body;
    
    // Update fields
    if (name) parkingLot.name = name;
    if (address) parkingLot.address = address;
    if (latitude && longitude) {
      parkingLot.location.coordinates = [longitude, latitude];
    }
    if (totalSlots) {
      parkingLot.totalSlots = totalSlots;
      // Adjust available slots if total changed
      if (parkingLot.availableSlots > totalSlots) {
        parkingLot.availableSlots = totalSlots;
      }
    }
    if (pricePerHour) parkingLot.pricePerHour = pricePerHour;
    if (description !== undefined) parkingLot.description = description;
    if (amenities) parkingLot.amenities = amenities;
    if (operatingHours) parkingLot.operatingHours = operatingHours;
    
    await parkingLot.save();
    
    res.json({
      success: true,
      message: 'Parking lot updated successfully',
      data: parkingLot
    });
  } catch (error) {
    console.error('Update parking lot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update parking lot',
      error: error.message
    });
  }
});

// @route   DELETE /api/parking/:id
// @desc    Delete parking lot
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }
    
    // Check if user is owner or admin
    if (parkingLot.owner.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this parking lot'
      });
    }
    
    // Soft delete by setting isActive to false
    parkingLot.isActive = false;
    await parkingLot.save();
    
    res.json({
      success: true,
      message: 'Parking lot deleted successfully'
    });
  } catch (error) {
    console.error('Delete parking lot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete parking lot',
      error: error.message
    });
  }
});

// @route   GET /api/parking/owner/lots
// @desc    Get parking lots owned by current user
// @access  Private
router.get('/owner/lots', auth, async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find({ 
      owner: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    console.error('Get owner parking lots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parking lots',
      error: error.message
    });
  }
});

module.exports = router;