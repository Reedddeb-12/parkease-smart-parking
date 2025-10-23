/**
 * Profile page JavaScript for ParkEase
 */

let currentUser = null;
let bookings = [];
let vehicles = [];
let favorites = [];

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
    
    // Load data from localStorage
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Load profile data
    loadProfileData();
    loadVehicles();
    loadFavorites();
    loadRecentActivity();
    loadUserSettings();
}

function loadProfileData() {
    // Update profile header
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileInitials').textContent = currentUser.initials;
    
    // Set member since date (use current date if not available)
    const memberSince = currentUser.memberSince || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
    });
    document.getElementById('memberSince').textContent = `Member since: ${memberSince}`;
    
    // Calculate stats
    const userBookings = bookings.filter(booking => booking.userId === currentUser.email);
    const totalSpent = userBookings.reduce((sum, booking) => sum + booking.amount, 0);
    
    document.getElementById('totalBookings').textContent = userBookings.length;
    document.getElementById('totalSpent').textContent = `₹${totalSpent}`;
    document.getElementById('favoriteSpots').textContent = favorites.length;
    
    // Fill form fields
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editAddress').value = currentUser.address || '';
}

function loadVehicles() {
    const container = document.getElementById('vehiclesList');
    const userVehicles = vehicles.filter(vehicle => vehicle.userId === currentUser.email);
    
    if (userVehicles.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                </svg>
                <p>No vehicles added yet</p>
                <p class="text-sm">Add your vehicle to make booking easier</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    userVehicles.forEach(vehicle => {
        const vehicleElement = createVehicleCard(vehicle);
        container.appendChild(vehicleElement);
    });
}

function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all';
    
    const vehicleIcons = {
        car: '🚗',
        bike: '🏍️',
        suv: '🚙',
        truck: '🚚'
    };
    
    card.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">${vehicleIcons[vehicle.type] || '🚗'}</div>
            <div>
                <h4 class="font-semibold text-gray-900">${vehicle.name}</h4>
                <p class="text-sm text-gray-600">${vehicle.number}</p>
                <p class="text-xs text-gray-500 capitalize">${vehicle.type}</p>
            </div>
        </div>
        <button onclick="removeVehicle('${vehicle.id}')" class="text-red-500 hover:text-red-700 p-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
        </button>
    `;

    return card;
}

function loadFavorites() {
    const container = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <p>No favorite spots yet</p>
                <p class="text-sm">Heart parking spots to add them to favorites</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    favorites.forEach(favorite => {
        const favoriteElement = createFavoriteCard(favorite);
        container.appendChild(favoriteElement);
    });
}

function createFavoriteCard(favorite) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer';
    
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h4 class="font-semibold text-gray-900">${favorite.name}</h4>
                <p class="text-sm text-gray-600">${favorite.address}</p>
                <p class="text-sm text-blue-600">₹${favorite.price}/hr</p>
            </div>
            <button onclick="removeFavorite('${favorite.id}')" class="text-red-500 hover:text-red-700 p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            // Navigate to parking details
            localStorage.setItem('selectedLot', JSON.stringify(favorite));
            window.location.href = 'parking-details.html';
        }
    });

    return card;
}

function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    const userBookings = bookings
        .filter(booking => booking.userId === currentUser.email)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 5);
    
    if (userBookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p>No recent activity</p>
                <p class="text-sm">Your parking history will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    userBookings.forEach(booking => {
        const activityElement = createActivityCard(booking);
        container.appendChild(activityElement);
    });
}

function createActivityCard(booking) {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-xl p-4';
    
    const isActive = new Date() < new Date(booking.endTime);
    const statusClass = isActive ? 'text-green-600' : 'text-gray-600';
    const statusText = isActive ? 'Active' : 'Completed';
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-900">${booking.lotName}</h4>
            <span class="text-sm ${statusClass}">${statusText}</span>
        </div>
        <p class="text-sm text-gray-600 mb-1">${booking.vehicleNumber}</p>
        <p class="text-sm text-gray-500">${new Date(booking.startTime).toLocaleDateString()}</p>
        <p class="text-sm font-semibold text-blue-600">₹${booking.amount}</p>
    `;

    return card;
}

function loadUserSettings() {
    // Load settings from localStorage or use defaults
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {
        pushNotifications: true,
        locationServices: true,
        autoExtend: false
    };
    
    document.getElementById('pushNotifications').checked = settings.pushNotifications;
    document.getElementById('locationServices').checked = settings.locationServices;
    document.getElementById('autoExtend').checked = settings.autoExtend;
}

// Vehicle management
function addVehicle() {
    document.getElementById('vehicleModal').classList.remove('hidden');
}

function closeVehicleModal() {
    document.getElementById('vehicleModal').classList.add('hidden');
    // Clear form
    document.getElementById('vehicleName').value = '';
    document.getElementById('vehicleNumber').value = '';
    document.getElementById('vehicleType').value = '';
}

function saveVehicle() {
    const name = document.getElementById('vehicleName').value;
    const number = document.getElementById('vehicleNumber').value;
    const type = document.getElementById('vehicleType').value;
    
    if (name && number && type) {
        const newVehicle = {
            id: Date.now().toString(),
            userId: currentUser.email,
            name: name,
            number: number.toUpperCase(),
            type: type
        };
        
        vehicles.push(newVehicle);
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        
        loadVehicles();
        closeVehicleModal();
        showNotification('Vehicle added successfully!', 'success');
    } else {
        showNotification('Please fill all vehicle details', 'error');
    }
}

function removeVehicle(vehicleId) {
    if (confirm('Are you sure you want to remove this vehicle?')) {
        vehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        loadVehicles();
        showNotification('Vehicle removed successfully!', 'success');
    }
}

function removeFavorite(favoriteId) {
    favorites = favorites.filter(favorite => favorite.id !== favoriteId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    
    // Update stats
    document.getElementById('favoriteSpots').textContent = favorites.length;
    
    showNotification('Removed from favorites', 'success');
}

// Profile management
function updateProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    
    if (name && email) {
        // Update current user data
        currentUser.name = name;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.address = address;
        currentUser.initials = name.charAt(0).toUpperCase();
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Reload profile data
        loadProfileData();
        
        showNotification('Profile updated successfully!', 'success');
    } else {
        showNotification('Please fill required fields', 'error');
    }
}

// Settings management
function saveSettings() {
    const settings = {
        pushNotifications: document.getElementById('pushNotifications').checked,
        locationServices: document.getElementById('locationServices').checked,
        autoExtend: document.getElementById('autoExtend').checked
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showNotification('Settings saved!', 'success');
}

// Add event listeners for settings
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('pushNotifications').addEventListener('change', saveSettings);
    document.getElementById('locationServices').addEventListener('change', saveSettings);
    document.getElementById('autoExtend').addEventListener('change', saveSettings);
});

// Danger zone functions
function clearData() {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
        // Clear user-specific data
        const userBookings = bookings.filter(booking => booking.userId !== currentUser.email);
        const userVehicles = vehicles.filter(vehicle => vehicle.userId !== currentUser.email);
        
        localStorage.setItem('bookings', JSON.stringify(userBookings));
        localStorage.setItem('vehicles', JSON.stringify(userVehicles));
        localStorage.removeItem('favorites');
        localStorage.removeItem('userSettings');
        
        showNotification('All data cleared successfully!', 'success');
        
        // Reload page
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            // Clear all user data
            clearData();
            
            // Logout
            localStorage.removeItem('currentUser');
            
            showNotification('Account deleted successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
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