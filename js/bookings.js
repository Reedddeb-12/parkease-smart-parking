/**
 * Bookings page JavaScript for ParkEase
 */

let currentUser = null;
let bookings = [];

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
    
    // Load bookings from localStorage
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Load user bookings
    loadBookings();
}

function loadBookings() {
    const container = document.getElementById('bookingsList');
    const userBookings = bookings.filter(booking => booking.userId === currentUser.email);

    if (userBookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                <p class="text-gray-600 mb-6">Your parking reservations will appear here</p>
                <button onclick="window.location.href='home.html'" class="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                    Find Parking
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    userBookings.forEach(booking => {
        const bookingElement = createBookingCard(booking);
        container.appendChild(bookingElement);
    });
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'card rounded-2xl shadow-sm p-6 mb-4';
    
    const isActive = new Date() < new Date(booking.endTime);
    const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const statusText = isActive ? 'Active' : 'Expired';

    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">${booking.lotName}</h3>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
                ${statusText}
            </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
                <p class="text-sm text-gray-600">Vehicle</p>
                <p class="font-semibold">${booking.vehicleNumber}</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold">${booking.duration} hours</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">Amount</p>
                <p class="font-semibold text-blue-600">₹${booking.amount}</p>
            </div>
            <div>
                <p class="text-sm text-gray-600">QR Code</p>
                <p class="font-semibold font-mono">${booking.qrCode}</p>
            </div>
        </div>
        
        <div class="text-sm text-gray-600 mb-4">
            <p><strong>Location:</strong> ${booking.lotAddress}</p>
            <p><strong>Booked:</strong> ${new Date(booking.startTime).toLocaleString()}</p>
            <p><strong>Valid until:</strong> ${new Date(booking.endTime).toLocaleString()}</p>
        </div>
        
        ${isActive ? `
            <div class="pt-4 border-t border-gray-200">
                <button onclick="showTicket('${booking.qrCode}')" 
                    class="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                    Show QR Code
                </button>
            </div>
        ` : ''}
    `;

    return card;
}

function showTicket(qrCode) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">Parking Ticket</h3>
                <div class="w-32 h-32 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <div class="text-2xl font-mono font-bold text-gray-600">${qrCode}</div>
                </div>
                <p class="text-sm text-gray-600 mb-6">Show this QR code at the parking entrance</p>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    class="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);