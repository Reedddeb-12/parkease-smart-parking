/**
 * Booking Confirmation page JavaScript for ParkEase
 */

let currentBooking = null;

// Initialize page
function initializePage() {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Get current booking data
    currentBooking = JSON.parse(localStorage.getItem('currentBooking'));
    
    if (!currentBooking) {
        window.location.href = 'home.html';
        return;
    }
    
    displayBookingDetails();
}

function displayBookingDetails() {
    // Update QR code
    document.getElementById('qrCode').textContent = currentBooking.qrCode;
    
    // Update booking details
    const detailsContainer = document.getElementById('bookingDetails');
    detailsContainer.innerHTML = `
        <div class="flex justify-between">
            <span class="text-gray-600">Booking ID:</span>
            <span class="font-semibold">#${currentBooking.id}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Location:</span>
            <span class="font-semibold text-right">${currentBooking.lotName}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Address:</span>
            <span class="font-semibold text-right text-sm">${currentBooking.lotAddress}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Vehicle:</span>
            <span class="font-semibold">${currentBooking.vehicleNumber}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Duration:</span>
            <span class="font-semibold">${currentBooking.duration} hours</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Amount Paid:</span>
            <span class="font-semibold text-blue-600">₹${currentBooking.amount}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Booked At:</span>
            <span class="font-semibold text-sm">${new Date(currentBooking.startTime).toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Valid Until:</span>
            <span class="font-semibold text-sm">${new Date(currentBooking.endTime).toLocaleString()}</span>
        </div>
    `;
    
    // Clear the current booking from localStorage after displaying
    localStorage.removeItem('currentBooking');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);