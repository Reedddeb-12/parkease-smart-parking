/**
 * Nearby Parking Search Utility
 * Works with both Google Maps and Leaflet
 */

class NearbyParkingSearch {
    constructor(apiUrl = '/api/parking') {
        this.apiUrl = apiUrl;
        this.userLocation = null;
    }

    /**
     * Get user's current location
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(this.userLocation);
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }

    /**
     * Find nearby parking lots using backend API
     */
    async findNearby(lat, lng, radius = 5) {
        try {
            const response = await fetch(
                `${this.apiUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
            );
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to find nearby parking');
            }
        } catch (error) {
            console.error('Error finding nearby parking:', error);
            throw error;
        }
    }

    /**
     * Search parking lots by name or address
     */
    async search(query) {
        try {
            const response = await fetch(
                `${this.apiUrl}/search?q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Search failed');
            }
        } catch (error) {
            console.error('Error searching parking:', error);
            throw error;
        }
    }

    /**
     * Get directions to parking lot
     */
    async getDirections(origin, destination) {
        try {
            const response = await fetch(`${this.apiUrl}/directions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination })
            });
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Failed to get directions');
            }
        } catch (error) {
            console.error('Error getting directions:', error);
            throw error;
        }
    }

    /**
     * Calculate distance between two points (client-side)
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Format distance for display
     */
    formatDistance(distanceKm) {
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)}m`;
        }
        return `${distanceKm.toFixed(1)}km`;
    }

    /**
     * Sort parking lots by various criteria
     */
    sortParkingLots(lots, sortBy = 'distance') {
        const sorted = [...lots];
        
        switch (sortBy) {
            case 'distance':
                sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                break;
            case 'price':
                sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
                break;
            case 'availability':
                sorted.sort((a, b) => b.availableSlots - a.availableSlots);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        
        return sorted;
    }

    /**
     * Filter parking lots by criteria
     */
    filterParkingLots(lots, filters = {}) {
        let filtered = [...lots];
        
        // Filter by minimum available slots
        if (filters.minSlots) {
            filtered = filtered.filter(lot => lot.availableSlots >= filters.minSlots);
        }
        
        // Filter by maximum price
        if (filters.maxPrice) {
            filtered = filtered.filter(lot => lot.pricePerHour <= filters.maxPrice);
        }
        
        // Filter by amenities
        if (filters.amenities && filters.amenities.length > 0) {
            filtered = filtered.filter(lot => 
                filters.amenities.every(amenity => 
                    lot.amenities && lot.amenities.includes(amenity)
                )
            );
        }
        
        // Filter by distance
        if (filters.maxDistance) {
            filtered = filtered.filter(lot => 
                !lot.distance || lot.distance <= filters.maxDistance
            );
        }
        
        return filtered;
    }

    /**
     * Get parking lot recommendations
     */
    getRecommendations(lots, preferences = {}) {
        let scored = lots.map(lot => {
            let score = 0;
            
            // Score based on availability
            const availabilityRatio = lot.availableSlots / lot.totalSlots;
            score += availabilityRatio * 30;
            
            // Score based on price (lower is better)
            const maxPrice = Math.max(...lots.map(l => l.pricePerHour));
            score += ((maxPrice - lot.pricePerHour) / maxPrice) * 25;
            
            // Score based on distance (closer is better)
            if (lot.distance) {
                const maxDistance = Math.max(...lots.map(l => l.distance || 0));
                score += ((maxDistance - lot.distance) / maxDistance) * 45;
            }
            
            return { ...lot, recommendationScore: score };
        });
        
        // Sort by recommendation score
        scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
        
        return scored;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NearbyParkingSearch;
}
