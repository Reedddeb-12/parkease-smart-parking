/**
 * ParkEase - Google Maps API Configuration
 * Location services, geocoding, and nearby search
 */

const GOOGLE_MAPS_CONFIG = {
    // API Key - Set this in your .env file as GOOGLE_MAPS_API_KEY
    API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    
    // Map Settings
    DEFAULT_ZOOM: 15,
    MIN_ZOOM: 10,
    MAX_ZOOM: 20,
    
    // Default Center (Kolkata)
    DEFAULT_CENTER: {
        lat: 22.5726,
        lng: 88.3639
    },
    
    // Map Styles
    MAP_STYLES: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ],
    
    // Marker Icons
    PARKING_MARKER_ICON: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 2
    },
    
    USER_MARKER_ICON: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
    },
    
    // Search Settings
    NEARBY_SEARCH_RADIUS: 5000, // 5km in meters
    
    // Distance Matrix Settings
    DISTANCE_UNITS: 'metric'
};

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
    const distance = R * c;
    
    return distance; // in km
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Find nearby parking lots within radius
 */
function findNearbyParkingLots(userLat, userLng, parkingLots, radiusKm = 5) {
    return parkingLots
        .map(lot => {
            const distance = calculateDistance(
                userLat,
                userLng,
                lot.location.coordinates[1],
                lot.location.coordinates[0]
            );
            
            return {
                ...lot,
                distance: distance,
                distanceText: distance < 1 
                    ? `${Math.round(distance * 1000)}m` 
                    : `${distance.toFixed(1)}km`
            };
        })
        .filter(lot => lot.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Get user's current location
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            error => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GOOGLE_MAPS_CONFIG,
        calculateDistance,
        findNearbyParkingLots,
        getUserLocation
    };
}
