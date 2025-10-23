/**
 * Admin page JavaScript for ParkEase
 */

let currentUser = null;
let parkingLots = [];
let bookings = [];
let locationMap = null;
let selectedLocationMarker = null;

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    
    currentUser = JSON.parse(user);
    if (currentUser.userType !== 'admin') {
        window.location.href = 'home.html';
        return false;
    }
    
    return true;
}

// Initialize page
function initializePage() {
    if (!checkAuth()) return;
    
    // Load data from localStorage
    parkingLots = JSON.parse(localStorage.getItem('parkingLots')) || [];
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Update stats
    updateAdminStats();
    
    // Load admin parking spaces
    loadAdminParkingSpaces();
    
    // Setup form
    setupAddParkingForm();
}

function updateAdminStats() {
    const userSpaces = parkingLots.filter(lot => lot.owner === currentUser.email);
    const userBookings = bookings.filter(booking => {
        const lot = parkingLots.find(l => l.id === booking.lotId);
        return lot && lot.owner === currentUser.email;
    });

    document.getElementById('totalSpaces').textContent = userSpaces.length;
    document.getElementById('totalBookings').textContent = userBookings.length;
}

function setupAddParkingForm() {
    const form = document.getElementById('addParkingForm');
    form.addEventListener('submit', handleAddParking);
}

function handleAddParking(e) {
    e.preventDefault();
    
    const name = document.getElementById('parkingName').value;
    const address = document.getElementById('parkingAddress').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const totalSlots = parseInt(document.getElementById('totalSlots').value);
    const price = parseInt(document.getElementById('pricePerHour').value);
    const description = document.getElementById('parkingDescription').value;

    if (name && address && totalSlots && price) {
        const newParkingSpace = {
            id: Date.now(),
            name: name,
            address: address,
            latitude: latitude || (19.0760 + (Math.random() - 0.5) * 0.1), // Default to Mumbai area if no location
            longitude: longitude || (72.8777 + (Math.random() - 0.5) * 0.1),
            total: totalSlots,
            available: totalSlots,
            price: price,
            description: description,
            distance: (Math.random() * 2 + 0.1).toFixed(1) + ' km',
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            owner: currentUser.email
        };

        parkingLots.push(newParkingSpace);
        localStorage.setItem('parkingLots', JSON.stringify(parkingLots));
        
        // Reset form
        document.getElementById('addParkingForm').reset();
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        
        // Hide map
        document.getElementById('locationMap').classList.add('hidden');
        
        updateAdminStats();
        loadAdminParkingSpaces();
        showNotification('Parking space added successfully!', 'success');
    }
}

function selectLocationOnMap() {
    const mapContainer = document.getElementById('locationMap');
    mapContainer.classList.remove('hidden');
    
    if (!locationMap) {
        // Initialize map for location selection
        locationMap = L.map('locationMap').setView([19.0760, 72.8777], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(locationMap);
        
        // Add click event to select location
        locationMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Update input fields
            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lng.toFixed(6);
            
            // Remove existing marker
            if (selectedLocationMarker) {
                locationMap.removeLayer(selectedLocationMarker);
            }
            
            // Add new marker
            selectedLocationMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'selected-location-marker',
                    html: '<div style="background: #10b981; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [25, 25],
                    iconAnchor: [12.5, 12.5]
                })
            }).addTo(locationMap);
            
            selectedLocationMarker.bindPopup('Selected Location').openPopup();
            
            showNotification('Location selected! Coordinates updated.', 'success');
        });
        
        // Try to get user's current location for better initial view
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationMap.setView([position.coords.latitude, position.coords.longitude], 15);
                },
                (error) => {
                    console.log('Could not get location for map');
                }
            );
        }
    }
    
    // Refresh map size
    setTimeout(() => {
        locationMap.invalidateSize();
    }, 100);
}

function loadAdminParkingSpaces() {
    const container = document.getElementById('adminParkingList');
    const userSpaces = parkingLots.filter(lot => lot.owner === currentUser.email);
    
    if (userSpaces.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                </svg>
                <p>No parking spaces added yet</p>
                <p class="text-sm">Add your first parking space above</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    userSpaces.forEach(space => {
        const spaceElement = createAdminParkingCard(space);
        container.appendChild(spaceElement);
    });
}

function createAdminParkingCard(space) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all';
    
    const occupancyRate = ((space.total - space.available) / space.total * 100).toFixed(0);
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-900">${space.name}</h4>
            <div class="flex space-x-2">
                <button onclick="editParking(${space.id})" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Edit
                </button>
                <button onclick="deleteParking(${space.id})" class="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete
                </button>
            </div>
        </div>
        <p class="text-sm text-gray-600 mb-3">${space.address}</p>
        <div class="grid grid-cols-3 gap-4 text-center">
            <div>
                <div class="text-lg font-semibold text-gray-900">${space.available}/${space.total}</div>
                <div class="text-xs text-gray-500">Available</div>
            </div>
            <div>
                <div class="text-lg font-semibold text-blue-600">₹${space.price}</div>
                <div class="text-xs text-gray-500">Per Hour</div>
            </div>
            <div>
                <div class="text-lg font-semibold text-green-600">${occupancyRate}%</div>
                <div class="text-xs text-gray-500">Occupied</div>
            </div>
        </div>
    `;

    return card;
}

function editParking(spaceId) {
    const space = parkingLots.find(lot => lot.id === spaceId);
    if (!space) return;

    // Pre-fill the form with existing data
    document.getElementById('parkingName').value = space.name;
    document.getElementById('parkingAddress').value = space.address;
    document.getElementById('totalSlots').value = space.total;
    document.getElementById('pricePerHour').value = space.price;
    document.getElementById('parkingDescription').value = space.description || '';

    // Change form to edit mode
    const form = document.getElementById('addParkingForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Parking Space';
    
    // Store the ID for updating
    form.dataset.editId = spaceId;
    
    showNotification('Edit mode activated. Update the details and submit.', 'success');
}

function deleteParking(spaceId) {
    if (confirm('Are you sure you want to delete this parking space?')) {
        parkingLots = parkingLots.filter(lot => lot.id !== spaceId);
        localStorage.setItem('parkingLots', JSON.stringify(parkingLots));
        updateAdminStats();
        loadAdminParkingSpaces();
        showNotification('Parking space deleted successfully!', 'success');
    }
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);