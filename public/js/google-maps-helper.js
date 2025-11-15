/**
 * Google Maps Helper Functions for ParkEase
 */

class GoogleMapsHelper {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.userLocation = null;
        this.infoWindow = null;
    }

    /**
     * Initialize Google Map
     */
    initMap(containerId, center = { lat: 22.5726, lng: 88.3639 }, zoom = 13) {
        const mapOptions = {
            center: center,
            zoom: zoom,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        };

        this.map = new google.maps.Map(document.getElementById(containerId), mapOptions);
        this.infoWindow = new google.maps.InfoWindow();
        
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
     * Add user location marker
     */
    addUserMarker(location) {
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }

        this.userMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: 'Your Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#4CAF50',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 10
            },
            animation: google.maps.Animation.DROP
        });

        this.map.setCenter(location);
    }

    /**
     * Add parking lot markers
     */
    addParkingMarkers(parkingLots) {
        // Clear existing markers
        this.clearMarkers();

        parkingLots.forEach(lot => {
            const position = {
                lat: lot.location.coordinates[1],
                lng: lot.location.coordinates[0]
            };

            const marker = new google.maps.Marker({
                position: position,
                map: this.map,
                title: lot.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                            <path fill="#3B82F6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 40)
                }
            });

            // Add click listener
            marker.addListener('click', () => {
                this.showParkingInfo(marker, lot);
            });

            this.markers.push(marker);
        });
    }

    /**
     * Show parking lot info window
     */
    showParkingInfo(marker, lot) {
        const distance = this.userLocation 
            ? this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                lot.location.coordinates[1],
                lot.location.coordinates[0]
              )
            : null;

        const distanceText = distance 
            ? `<p class="text-sm text-gray-600">📍 ${distance < 1 ? Math.round(distance * 1000) + 'm' : distance.toFixed(1) + 'km'} away</p>`
            : '';

        const content = `
            <div style="padding: 10px; max-width: 250px;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${lot.name}</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 8px;">${lot.address}</p>
                ${distanceText}
                <p style="color: #10B981; font-weight: 600; margin-bottom: 4px;">
                    ${lot.availableSlots}/${lot.totalSlots} Available
                </p>
                <p style="color: #3B82F6; font-weight: bold; margin-bottom: 12px;">
                    ₹${lot.pricePerHour}/hr
                </p>
                <button 
                    onclick="bookParking('${lot._id}')" 
                    style="background: #3B82F6; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; width: 100%;">
                    Book Now
                </button>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
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
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
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
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }

    /**
     * Fit map to show all markers
     */
    fitBounds() {
        if (this.markers.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        
        if (this.userMarker) {
            bounds.extend(this.userMarker.getPosition());
        }
        
        this.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });

        this.map.fitBounds(bounds);
    }

    /**
     * Search for address using Geocoding API
     */
    async geocodeAddress(address) {
        const geocoder = new google.maps.Geocoder();
        
        return new Promise((resolve, reject) => {
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng(),
                        formattedAddress: results[0].formatted_address
                    });
                } else {
                    reject(new Error('Geocoding failed: ' + status));
                }
            });
        });
    }

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(lat, lng) {
        const geocoder = new google.maps.Geocoder();
        
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject(new Error('Reverse geocoding failed: ' + status));
                }
            });
        });
    }

    /**
     * Get directions between two points
     */
    async getDirections(origin, destination) {
        const directionsService = new google.maps.DirectionsService();
        
        return new Promise((resolve, reject) => {
            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING
                },
                (result, status) => {
                    if (status === 'OK') {
                        resolve(result);
                    } else {
                        reject(new Error('Directions request failed: ' + status));
                    }
                }
            );
        });
    }

    /**
     * Display directions on map
     */
    displayDirections(directionsResult) {
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: false
        });
        directionsRenderer.setDirections(directionsResult);
    }
}
