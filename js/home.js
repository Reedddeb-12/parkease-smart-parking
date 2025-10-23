/**
 * Home page JavaScript for ParkEase
 */

let currentUser = null;
let parkingLots = [];

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    
    currentUser = JSON.parse(user);
    if (currentUser.userType === 'admin') {
        window.location.href = 'admin.html';
        return false;
    }
    
    return true;
}

// Initialize page
function initializePage() {
    if (!checkAuth()) return;
    
    // Load parking lots from localStorage
    parkingLots = JSON.parse(localStorage.getItem('parkingLots')) || [];
    
    // Update user greeting
    updateUserGreeting();
    
    // Initialize map
    initializeMap();
    
    // Load parking lots
    loadParkingLots();
    
    // Setup search
    setupSearch();
}

function updateUserGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    
    document.getElementById('greeting').textContent = `${greeting}!`;
    document.getElementById('userGreeting').textContent = `${greeting}, ${currentUser.name}!`;
    document.getElementById('userInitials').textContent = currentUser.initials;
}

function loadParkingLots() {
    const container = document.getElementById('parkingList');
    
    if (parkingLots.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                </svg>
                <p>No parking spaces available</p>
                <p class="text-sm">Check back later or try searching</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    parkingLots.forEach(lot => {
        const lotElement = createParkingCard(lot);
        container.appendChild(lotElement);
    });
}

function createParkingCard(lot) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer';

    const availability = lot.available / lot.total;
    let statusClass = 'bg-red-100 text-red-800';
    let statusText = 'Full';

    if (availability > 0.5) {
        statusClass = 'bg-green-100 text-green-800';
        statusText = 'Available';
    } else if (availability > 0.2) {
        statusClass = 'bg-yellow-100 text-yellow-800';
        statusText = 'Limited';
    }

    card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-900">${lot.name}</h4>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
                ${statusText}
            </span>
        </div>
        <p class="text-sm text-gray-600 mb-3">${lot.address}</p>
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                    ${lot.available}/${lot.total} spots
                </span>
                <span class="text-sm font-semibold text-blue-600">
                    ₹${lot.price}/hr
                </span>
            </div>
            <div class="text-sm text-gray-500">
                ${lot.distance || '0.5 km'}
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        // Store lot data for details page
        localStorage.setItem('selectedLot', JSON.stringify(lot));
        window.location.href = 'parking-details.html';
    });

    return card;
}

function setupSearch() {
    const searchInput = document.getElementById('searchLocation');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            const filteredLots = parkingLots.filter(lot => 
                lot.name.toLowerCase().includes(query) || 
                lot.address.toLowerCase().includes(query)
            );
            displayFilteredLots(filteredLots);
        } else if (query.length === 0) {
            loadParkingLots();
        }
    });
}

function displayFilteredLots(lots) {
    const container = document.getElementById('parkingList');
    container.innerHTML = '';
    
    if (lots.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p>No parking spaces found</p>
                <p class="text-sm">Try a different search term</p>
            </div>
        `;
        return;
    }
    
    lots.forEach(lot => {
        const lotElement = createParkingCard(lot);
        container.appendChild(lotElement);
    });
}

function findNearby() {
    showNotification('Searching for nearby parking...', 'success');
    loadParkingLots();
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;
    
    if (type === 'success') {
        notification.className += ' bg-green-500 text-white';
    } else if (type === 'error') {
        notification.className += ' bg-red-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

let map = null;
let userLocationMarker = null;
let parkingMarkers = [];

// Map functionality
function initializeMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([19.0760, 72.8777], 12); // Mumbai coordinates as default
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add parking lots to map
    updateMapMarkers();
    
    // Try to get user's current location
    getCurrentLocation();
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Update map view to user location
                map.setView([lat, lng], 15);
                
                // Add user location marker
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                userLocationMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);
                
                userLocationMarker.bindPopup('Your Location').openPopup();
                
                showNotification('Location found! Showing nearby parking spots.', 'success');
            },
            (error) => {
                console.error('Error getting location:', error);
                showNotification('Could not get your location. Using default area.', 'error');
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser.', 'error');
    }
}

function updateMapMarkers() {
    // Clear existing parking markers
    parkingMarkers.forEach(marker => map.removeLayer(marker));
    parkingMarkers = [];
    
    // Add parking lot markers
    parkingLots.forEach(lot => {
        if (lot.latitude && lot.longitude) {
            const availability = lot.available / lot.total;
            let markerColor = '#ef4444'; // Red for full
            
            if (availability > 0.5) {
                markerColor = '#10b981'; // Green for available
            } else if (availability > 0.2) {
                markerColor = '#f59e0b'; // Yellow for limited
            }
            
            const marker = L.marker([lot.latitude, lot.longitude], {
                icon: L.divIcon({
                    className: 'parking-marker',
                    html: `<div style="background: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${lot.available}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map);
            
            marker.bindPopup(`
                <div class="p-2">
                    <h3 class="font-semibold">${lot.name}</h3>
                    <p class="text-sm text-gray-600">${lot.address}</p>
                    <p class="text-sm"><strong>${lot.available}/${lot.total}</strong> spots available</p>
                    <p class="text-sm"><strong>₹${lot.price}/hr</strong></p>
                    <button onclick="selectParkingLot(${lot.id})" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                        View Details
                    </button>
                </div>
            `);
            
            parkingMarkers.push(marker);
        }
    });
}

function selectParkingLot(lotId) {
    const lot = parkingLots.find(l => l.id === lotId);
    if (lot) {
        localStorage.setItem('selectedLot', JSON.stringify(lot));
        window.location.href = 'parking-details.html';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);