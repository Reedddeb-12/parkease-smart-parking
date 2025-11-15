const express = require('express');
const router = express.Router();
const ParkingLot = require('../models/ParkingLot');

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * @route   GET /api/parking/nearby
 * @desc    Find nearby parking lots based on user location
 * @query   lat, lng, radius (optional, default 5km)
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = parseFloat(radius);

        // Get all active parking lots
        const allLots = await ParkingLot.find({ isActive: true });

        // Calculate distance for each lot and filter by radius
        const nearbyLots = allLots
            .map(lot => {
                const distance = calculateDistance(
                    userLat,
                    userLng,
                    lot.location.coordinates[1], // latitude
                    lot.location.coordinates[0]  // longitude
                );

                return {
                    ...lot.toObject(),
                    distance: distance,
                    distanceText: distance < 1 
                        ? `${Math.round(distance * 1000)}m` 
                        : `${distance.toFixed(1)}km`
                };
            })
            .filter(lot => lot.distance <= searchRadius)
            .sort((a, b) => a.distance - b.distance);

        res.json({
            success: true,
            count: nearbyLots.length,
            searchRadius: `${searchRadius}km`,
            userLocation: { lat: userLat, lng: userLng },
            data: nearbyLots
        });

    } catch (error) {
        console.error('Error finding nearby parking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding nearby parking lots'
        });
    }
});

/**
 * @route   GET /api/parking/search
 * @desc    Search parking lots by name or address
 * @query   q (search query)
 * @access  Public
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const lots = await ParkingLot.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            count: lots.length,
            data: lots
        });

    } catch (error) {
        console.error('Error searching parking lots:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching parking lots'
        });
    }
});

/**
 * @route   POST /api/parking/directions
 * @desc    Get directions to a parking lot
 * @body    origin {lat, lng}, destination {lat, lng}
 * @access  Public
 */
router.post('/directions', async (req, res) => {
    try {
        const { origin, destination } = req.body;
        
        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Origin and destination are required'
            });
        }

        const distance = calculateDistance(
            origin.lat,
            origin.lng,
            destination.lat,
            destination.lng
        );

        // Estimate travel time (assuming average speed of 30 km/h in city)
        const travelTimeMinutes = Math.round((distance / 30) * 60);

        res.json({
            success: true,
            distance: distance.toFixed(2) + ' km',
            estimatedTime: travelTimeMinutes + ' minutes',
            origin: origin,
            destination: destination
        });

    } catch (error) {
        console.error('Error calculating directions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while calculating directions'
        });
    }
});

module.exports = router;
