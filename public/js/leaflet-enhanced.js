/**
 * Enhanced Leaflet Helper - FREE Alternative to Google Maps
 * Uses OpenStreetMap (free) + Nominatim (free geocoding)
 */

class LeafletEnhanced {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.userLocation = null;
        this.userCircle = null;
    }

    /**
     * Initialize Leaflet Map
     */
    initMap(containerId, center = { lat: 22.5726, lng: 88.3639 }, zoom = 13) {
        this.map = L.map(containerId).setView([center.lat, center.lng], zoom);
        
        // Add OpenStreetMap tiles (FREE!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        return this.map;
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
     * Add user location marker with circle
     */
    addUserMarker(location, radius = 5000) {
        // Remove old marker and circle
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        if (this.userCircle) {
            this.map.removeLayer(this.userCircle);
        }

        // Custom user icon
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
                background: #4CAF50;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Add marker
        this.userMarker = L.marker([location.lat, location.lng], {
            icon: userIcon,
            title: 'Your Location'
        }).addTo(this.map);

        // Add circle showing search radius
        this.userCircle = L.circle([location.lat, location.lng], {
            radius: radius,
            color: '#4CAF50',
            fillColor: '#4CAF50',
            fillOpacity: 0.1,
            weight: 2
        }).addTo(this.map);

        this.map.setView([location.lat, location.lng], 13);
        
        return this.userMarker;
    }

    /**
     * Add parking lot markers
     */
    addParkingMarkers(parkingLots) {
        // Clear existing markers
        this.clearMarkers();

        parkingLots.forEach(lot => {
            const position = [
                lot.location.coordinates[1], // latitude
                lot.location.coordinates[0]  // longitude
            ];

            // Custom parking icon
            const parkingIcon = L.divIcon({
                className: 'parking-marker',
                html: `<div style="
                    background: #3B82F6;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 16px;
                ">
                    <span style="transform: rotate(45deg);">P</span>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            const marker = L.marker(position, {
                icon: parkingIcon,
                title: lot.name
            }).addTo(this.map);

            // Create popup content
            const distance = lot.distance 
                ? `<p style="color: #666; font-size: 14px; margin: 4px 0;">📍 ${this.formatDistance(lot.distance)}</p>`
                : '';

            const popupContent = `
                <div style="min-width: 200px; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${lot.name}</h3>
                    <p style="color: #666; font-size: 14px; margin: 4px 0;">${lot.address}</p>
                    ${distance}
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                        <span style="color: #10B981; font-weight: 600;">${lot.availableSlots}/${lot.totalSlots} Available</span>
                        <span style="color: #3B82F6; font-weight: bold;">₹${lot.pricePerHour}/hr</span>
                    </div>
                    <button onclick="bookParking('${lot._id}')" style="
                        background: #3B82F6;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        width: 100%;
                        font-weight: 600;
                        margin-top: 8px;
                    ">Book Now</button>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push(marker);
        });
    }

    /**
     * Calculate distance between two points (Haversine formula)
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
            return `${Math.round(distanceKm * 1000)}m away`;
        }
        return `${distanceKm.toFixed(1)}km away`;
    }

    /**
     * Find nearby parking lots
     */
    findNearbyLots(parkingLots, radiusKm = 5) {
        if (!this.userLocation) return parkingLots;

        return parkingLots
            .map(lot => {
                const distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    lot.location.coordinates[1],
                    lot.location.coordinates[0]
                );
                
                return { ...lot, distance };
            })
            .filter(lot => lot.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
    }

    /**
     * Clear all markers
     */
    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    /**
     * Fit map to show all markers
     */
    fitBounds() {
        if (this.markers.length === 0) return;

        const bounds = L.latLngBounds();
        
        if (this.userMarker) {
            bounds.extend(this.userMarker.getLatLng());
        }
        
        this.markers.forEach(marker => {
            bounds.extend(marker.getLatLng());
        });

        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    /**
     * Search for address using Nominatim (FREE OpenStreetMap geocoding)
     */
    async geocodeAddress(address) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(address)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'ParkEase-App'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    formattedAddress: data[0].display_name
                };
            } else {
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    /**
     * Reverse geocode coordinates to address (FREE)
     */
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'ParkEase-App'
                    }
                }
            );
            
            const data = await response.json();
            return data.display_name || 'Unknown location';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return 'Unknown location';
        }
    }

    /**
     * Add route line between two points
     */
    addRouteLine(start, end) {
        const routeLine = L.polyline([
            [start.lat, start.lng],
            [end.lat, end.lng]
        ], {
            color: '#3B82F6',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);

        return routeLine;
    }

    /**
     * Add search control to map
     */
    addSearchControl() {
        const searchControl = L.Control.extend({
            options: {
                position: 'topright'
            },
            
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                container.style.background = 'white';
                container.style.padding = '10px';
                container.style.borderRadius = '4px';
                
                container.innerHTML = `
                    <input type="text" id="mapSearch" placeholder="Search location..." 
                        style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 200px;">
                    <button id="mapSearchBtn" style="
                        padding: 8px 12px;
                        background: #3B82F6;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-left: 4px;
                    ">Search</button>
                `;
                
                L.DomEvent.disableClickPropagation(container);
                return container;
            }
        });
        
        this.map.addControl(new searchControl());
    }

    /**
     * Show loading indicator
     */
    showLoading(message = 'Loading...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'map-loading';
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
        `;
        loadingDiv.textContent = message;
        this.map.getContainer().appendChild(loadingDiv);
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingDiv = document.getElementById('map-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeafletEnhanced;
}
