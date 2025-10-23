const express = require('express');
const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/users/vehicles
// @desc    Add vehicle to user profile
// @access  Private
router.post('/vehicles', auth, async (req, res) => {
  try {
    const { name, number, type, isDefault } = req.body;
    
    if (!name || !number || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle name, number, and type'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if vehicle number already exists
    const existingVehicle = user.vehicles.find(v => v.number === number.toUpperCase());
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists'
      });
    }
    
    // If this is set as default, remove default from other vehicles
    if (isDefault) {
      user.vehicles.forEach(vehicle => {
        vehicle.isDefault = false;
      });
    }
    
    // Add new vehicle
    const newVehicle = {
      name,
      number: number.toUpperCase(),
      type,
      isDefault: isDefault || user.vehicles.length === 0 // First vehicle is default
    };
    
    user.vehicles.push(newVehicle);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: newVehicle
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add vehicle',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/vehicles/:vehicleId
// @desc    Remove vehicle from user profile
// @access  Private
router.delete('/vehicles/:vehicleId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const vehicleIndex = user.vehicles.findIndex(v => v._id.toString() === req.params.vehicleId);
    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    const removedVehicle = user.vehicles[vehicleIndex];
    user.vehicles.splice(vehicleIndex, 1);
    
    // If removed vehicle was default and there are other vehicles, make first one default
    if (removedVehicle.isDefault && user.vehicles.length > 0) {
      user.vehicles[0].isDefault = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Vehicle removed successfully'
    });
  } catch (error) {
    console.error('Remove vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove vehicle',
      error: error.message
    });
  }
});

// @route   POST /api/users/favorites
// @desc    Add parking lot to favorites
// @access  Private
router.post('/favorites', auth, async (req, res) => {
  try {
    const { parkingLotId } = req.body;
    
    if (!parkingLotId) {
      return res.status(400).json({
        success: false,
        message: 'Parking lot ID is required'
      });
    }
    
    // Check if parking lot exists
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already in favorites
    if (user.favorites.includes(parkingLotId)) {
      return res.status(400).json({
        success: false,
        message: 'Parking lot already in favorites'
      });
    }
    
    user.favorites.push(parkingLotId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to favorites successfully'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/favorites/:parkingLotId
// @desc    Remove parking lot from favorites
// @access  Private
router.delete('/favorites/:parkingLotId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const favoriteIndex = user.favorites.indexOf(req.params.parkingLotId);
    if (favoriteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not in favorites'
      });
    }
    
    user.favorites.splice(favoriteIndex, 1);
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites',
      error: error.message
    });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite parking lots
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: error.message
    });
  }
});

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { pushNotifications, locationServices, autoExtend } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update settings
    if (pushNotifications !== undefined) {
      user.settings.pushNotifications = pushNotifications;
    }
    if (locationServices !== undefined) {
      user.settings.locationServices = locationServices;
    }
    if (autoExtend !== undefined) {
      user.settings.autoExtend = autoExtend;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get additional stats from bookings
    const Booking = require('../models/Booking');
    const recentBookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('parkingLot', 'name address');
    
    const activeBookings = await Booking.countDocuments({
      user: req.user.id,
      status: 'active'
    });
    
    res.json({
      success: true,
      data: {
        ...user.stats.toObject(),
        favoriteSpots: user.favorites.length,
        vehicleCount: user.vehicles.length,
        activeBookings,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

module.exports = router;