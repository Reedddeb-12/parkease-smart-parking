/**
 * Parking Details page JavaScript for ParkEase
 */

let currentUser = null;
let selectedLot = null;
let parkingLots = [];
let bookings = [];

// Check authentication and load data
function initializePage() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    selectedLot = JSON.parse(localStorage.getItem('selectedLot'));
    parkingLots = JSON.parse(localStorage.getItem('parkingLots')) || [];
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    if (!selectedLot) {
        window.location.href = 'home.html';
        return;
    }
    
    displayParkingDetails();
}

function displayParkingDetails() {
    const detailsContent = document.getElementById('detailsContent');
    
    detailsContent.innerHTML = `
        <div class="card rounded-2xl shadow-sm overflow-hidden">
            <div class="h-48 gradient-bg flex items-center justify-center">
                <div class="text-center text-white">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                    </svg>
                    <h2 class="text-2xl font-bold">${selectedLot.name}</h2>
                </div>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-4 bg-gray-50 rounded-xl">
                        <div class="text-2xl font-bold text-blue-600">${selectedLot.available}</div>
                        <div class="text-sm text-gray-600">Available</div>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-xl">
                        <div class="text-2xl font-bold text-gray-900">₹${selectedLot.price}</div>
                        <div class="text-sm text-gray-600">Per Hour</div>
                    </div>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span class="text-gray-600">${selectedLot.address}</span>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span class="text-gray-600">${selectedLot.distance || '0.5 km'} • ${selectedLot.rating || '4.2'} ★</span>
                    </div>
                    ${selectedLot.description ? `
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-gray-600">${selectedLot.description}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Booking Form -->
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 class="font-semibold text-gray-900 mb-3">Book Your Slot</h4>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Duration (hours)</label>
                            <select id="bookingDuration" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="1">1 hour</option>
                                <option value="2">2 hours</option>
                                <option value="3">3 hours</option>
                                <option value="4">4 hours</option>
                                <option value="6">6 hours</option>
                                <option value="8">8 hours</option>
                                <option value="12">12 hours</option>
                                <option value="24">24 hours</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Vehicle Number</label>
                            <input type="text" id="vehicleNumber" placeholder="e.g., MH01AB1234" 
                                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-gray-600">Total Amount:</span>
                        <span id="totalAmount" class="text-xl font-bold text-blue-600">₹${selectedLot.price}</span>
                    </div>
                </div>

                <button onclick="bookSlot()" 
                    class="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-all" 
                    ${selectedLot.available === 0 ? 'disabled' : ''}>
                    ${selectedLot.available === 0 ? 'No Slots Available' : 'Book Now'}
                </button>
            </div>
        </div>
    `;

    // Add duration change listener
    const durationSelect = document.getElementById('bookingDuration');
    const totalAmountSpan = document.getElementById('totalAmount');
    
    durationSelect.addEventListener('change', () => {
        const duration = parseInt(durationSelect.value);
        const total = duration * selectedLot.price;
        totalAmountSpan.textContent = `₹${total}`;
    });
}

function bookSlot() {
    if (selectedLot.available === 0) {
        showNotification('No slots available', 'error');
        return;
    }

    const duration = parseInt(document.getElementById('bookingDuration').value);
    const vehicleNumber = document.getElementById('vehicleNumber').value;

    if (!vehicleNumber) {
        showNotification('Please enter vehicle number', 'error');
        return;
    }

    const totalAmount = duration * selectedLot.price;
    
    // Create booking
    const booking = {
        id: Date.now(),
        lotId: selectedLot.id,
        lotName: selectedLot.name,
        lotAddress: selectedLot.address,
        userId: currentUser.email,
        vehicleNumber: vehicleNumber,
        duration: duration,
        amount: totalAmount,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
        status: 'active',
        qrCode: generateQRCode()
    };

    // Update lot availability
    selectedLot.available -= 1;
    
    // Update parking lots array
    const lotIndex = parkingLots.findIndex(lot => lot.id === selectedLot.id);
    if (lotIndex !== -1) {
        parkingLots[lotIndex] = selectedLot;
    }
    
    // Save booking and updated parking lots
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.setItem('parkingLots', JSON.stringify(parkingLots));
    localStorage.setItem('currentBooking', JSON.stringify(booking));

    showNotification('Booking confirmed!', 'success');
    
    setTimeout(() => {
        window.location.href = 'booking-confirmation.html';
    }, 1000);
}

function generateQRCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
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