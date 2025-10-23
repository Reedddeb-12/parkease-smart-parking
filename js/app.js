/**
 * ParkEase - Complete Functional App
 */

class ParkEaseApp {
    constructor() {
        this.currentUser = null;
        this.userType = null; // 'user' or 'admin'
        this.parkingLots = JSON.parse(localStorage.getItem('parkingLots')) || [];
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        this.currentView = 'loginView';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('ParkEase App initialized');
    }

    setupEventListeners() {
        // Login forms
        document.querySelector('#userLoginForm form').addEventListener('submit', (e) => this.handleUserLogin(e));
        document.querySelector('#registerForm form').addEventListener('submit', (e) => this.handleRegister(e));
        document.querySelector('#adminForm form').addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Form switching
        document.getElementById('showRegisterBtn').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('adminLoginBtn').addEventListener('click', () => this.showAdminForm());
        document.getElementById('backToLoginBtn').addEventListener('click', () => this.showUserLoginForm());
        document.getElementById('backToUserLoginBtn').addEventListener('click', () => this.showUserLoginForm());

        // Demo button
        document.getElementById('demoBtn').addEventListener('click', () => this.handleDemo());

        // Admin form
        document.getElementById('addParkingForm').addEventListener('submit', (e) => this.handleAddParking(e));

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => this.goBack());

        // Search
        document.getElementById('searchLocation').addEventListener('input', (e) => this.handleSearch(e));
    }

    // Form switching methods
    showRegisterForm() {
        document.getElementById('userLoginForm').classList.add('hidden');
        document.getElementById('adminForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }

    showAdminForm() {
        document.getElementById('userLoginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('adminForm').classList.remove('hidden');
    }

    showUserLoginForm() {
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('adminForm').classList.add('hidden');
        document.getElementById('userLoginForm').classList.remove('hidden');
    }

    // Authentication methods
    handleUserLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email && password) {
            this.currentUser = {
                name: email.split('@')[0],
                email: email,
                initials: email.charAt(0).toUpperCase()
            };
            this.userType = 'user';
            this.showSuccess('Login successful!');
            this.showHome();
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;

        if (name && email && password && phone) {
            this.currentUser = {
                name: name,
                email: email,
                phone: phone,
                initials: name.charAt(0).toUpperCase()
            };
            this.userType = 'user';
            this.showSuccess('Account created successfully!');
            this.showHome();
        }
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        // Simple admin validation
        if ((email.includes('admin') || email === 'admin@parkease.com') && 
            (password === 'admin123' || password === 'admin')) {
            this.currentUser = {
                name: 'Admin',
                email: email,
                initials: 'A'
            };
            this.userType = 'admin';
            this.showSuccess('Admin login successful!');
            this.showAdmin();
        } else {
            this.showError('Invalid admin credentials');
        }
    }

    handleDemo() {
        this.currentUser = {
            name: 'Demo User',
            email: 'demo@parkease.com',
            initials: 'D'
        };
        this.userType = 'user';
        this.showSuccess('Welcome to ParkEase Demo!');
        this.showHome();
    }

    // View management
    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        document.getElementById(viewId).classList.add('active');
        this.currentView = viewId;

        // Update navigation
        this.updateNavigation(viewId);
    }

    updateNavigation(viewId) {
        const navbar = document.getElementById('navbar');
        const bottomNav = document.getElementById('bottomNav');
        const backBtn = document.getElementById('backBtn');
        const navTitle = document.getElementById('navTitle');

        if (viewId === 'loginView') {
            navbar.classList.add('hidden');
            bottomNav.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
            bottomNav.classList.remove('hidden');

            // Update title
            const titles = {
                'homeView': 'ParkEase',
                'adminView': 'Admin Dashboard',
                'bookingsView': 'My Bookings',
                'detailsView': 'Parking Details'
            };
            navTitle.textContent = titles[viewId] || 'ParkEase';

            // Show/hide back button
            if (viewId === 'homeView' || viewId === 'adminView') {
                backBtn.classList.add('hidden');
            } else {
                backBtn.classList.remove('hidden');
            }
        }

        // Update bottom nav active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-blue-600');
            item.classList.add('text-gray-600');
        });
    }

    showHome() {
        this.showView('homeView');
        this.initializeHome();
    }

    showAdmin() {
        this.showView('adminView');
        this.initializeAdmin();
    }

    showBookings() {
        this.showView('bookingsView');
        this.loadBookings();
    }

    goBack() {
        if (this.userType === 'admin') {
            this.showAdmin();
        } else {
            this.showHome();
        }
    }

    // Home initialization
    initializeHome() {
        // Update user greeting
        const userGreeting = document.getElementById('userGreeting');
        const userInitials = document.getElementById('userInitials');

        if (this.currentUser) {
            const hour = new Date().getHours();
            let greeting = 'Good morning';
            if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
            else if (hour >= 17) greeting = 'Good evening';

            userGreeting.textContent = `${greeting}, ${this.currentUser.name}!`;
            userInitials.textContent = this.currentUser.initials;
        }

        this.loadParkingLots();
    }

    // Admin initialization
    initializeAdmin() {
        this.updateAdminStats();
        this.loadAdminParkingSpaces();
    }

    updateAdminStats() {
        const totalSpaces = document.getElementById('totalSpaces');
        const totalBookings = document.getElementById('totalBookings');

        const userSpaces = this.parkingLots.filter(lot => lot.owner === this.currentUser.email);
        const userBookings = this.bookings.filter(booking => {
            const lot = this.parkingLots.find(l => l.id === booking.lotId);
            return lot && lot.owner === this.currentUser.email;
        });

        totalSpaces.textContent = userSpaces.length;
        totalBookings.textContent = userBookings.length;
    }

    // Parking lot management
    loadParkingLots() {
        const container = document.getElementById('parkingList');
        if (!container) return;

        if (this.parkingLots.length === 0) {
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
        this.parkingLots.forEach(lot => {
            const lotElement = this.createParkingCard(lot);
            container.appendChild(lotElement);
        });
    }

    createParkingCard(lot) {
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

        card.addEventListener('click', () => this.showParkingDetails(lot));
        return card;
    }

    showParkingDetails(lot) {
        const detailsContent = document.getElementById('detailsContent');
        
        detailsContent.innerHTML = `
            <div class="card rounded-2xl shadow-sm overflow-hidden">
                <div class="h-48 gradient-bg flex items-center justify-center">
                    <div class="text-center text-white">
                        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                        </svg>
                        <h2 class="text-2xl font-bold">${lot.name}</h2>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="text-center p-4 bg-gray-50 rounded-xl">
                            <div class="text-2xl font-bold text-blue-600">${lot.available}</div>
                            <div class="text-sm text-gray-600">Available</div>
                        </div>
                        <div class="text-center p-4 bg-gray-50 rounded-xl">
                            <div class="text-2xl font-bold text-gray-900">₹${lot.price}</div>
                            <div class="text-sm text-gray-600">Per Hour</div>
                        </div>
                    </div>
                    
                    <div class="space-y-4 mb-6">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span class="text-gray-600">${lot.address}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span class="text-gray-600">${lot.distance || '0.5 km'} • ${lot.rating || '4.2'} ★</span>
                        </div>
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
                            <span id="totalAmount" class="text-xl font-bold text-blue-600">₹${lot.price}</span>
                        </div>
                    </div>

                    <button onclick="app.bookSlot(${lot.id})" 
                        class="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-all" 
                        ${lot.available === 0 ? 'disabled' : ''}>
                        ${lot.available === 0 ? 'No Slots Available' : 'Book Now'}
                    </button>
                </div>
            </div>
        `;

        // Add duration change listener
        const durationSelect = document.getElementById('bookingDuration');
        const totalAmountSpan = document.getElementById('totalAmount');
        
        durationSelect.addEventListener('change', () => {
            const duration = parseInt(durationSelect.value);
            const total = duration * lot.price;
            totalAmountSpan.textContent = `₹${total}`;
        });

        this.showView('detailsView');
    }

    // Booking functionality
    bookSlot(lotId) {
        const lot = this.parkingLots.find(l => l.id === lotId);
        if (!lot || lot.available === 0) {
            this.showError('No slots available');
            return;
        }

        const duration = parseInt(document.getElementById('bookingDuration').value);
        const vehicleNumber = document.getElementById('vehicleNumber').value;

        if (!vehicleNumber) {
            this.showError('Please enter vehicle number');
            return;
        }

        const totalAmount = duration * lot.price;
        
        // Create booking
        const booking = {
            id: Date.now(),
            lotId: lotId,
            lotName: lot.name,
            lotAddress: lot.address,
            userId: this.currentUser.email,
            vehicleNumber: vehicleNumber,
            duration: duration,
            amount: totalAmount,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
            status: 'active',
            qrCode: this.generateQRCode()
        };

        // Update lot availability
        lot.available -= 1;
        
        // Save booking
        this.bookings.push(booking);
        this.saveData();

        this.showSuccess('Booking confirmed!');
        this.showBookingConfirmation(booking);
    }

    showBookingConfirmation(booking) {
        const detailsContent = document.getElementById('detailsContent');
        
        detailsContent.innerHTML = `
            <div class="max-w-sm mx-auto">
                <div class="card rounded-3xl shadow-2xl overflow-hidden">
                    <div class="gradient-bg text-white p-6 text-center">
                        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h2 class="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                        <p class="text-white/80">Your parking slot is reserved</p>
                    </div>

                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-32 h-32 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <div class="text-2xl font-mono font-bold text-gray-600">${booking.qrCode}</div>
                            </div>
                            <p class="text-sm text-gray-600">Show this QR code at entry</p>
                        </div>

                        <div class="space-y-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Booking ID:</span>
                                <span class="font-semibold">#${booking.id}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Location:</span>
                                <span class="font-semibold text-right">${booking.lotName}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Vehicle:</span>
                                <span class="font-semibold">${booking.vehicleNumber}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Duration:</span>
                                <span class="font-semibold">${booking.duration} hours</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Amount:</span>
                                <span class="font-semibold text-blue-600">₹${booking.amount}</span>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <button onclick="app.showHome()" 
                                class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Admin functionality
    handleAddParking(e) {
        e.preventDefault();
        
        const name = document.getElementById('parkingName').value;
        const address = document.getElementById('parkingAddress').value;
        const totalSlots = parseInt(document.getElementById('totalSlots').value);
        const price = parseInt(document.getElementById('pricePerHour').value);
        const description = document.getElementById('parkingDescription').value;

        if (name && address && totalSlots && price) {
            const newParkingSpace = {
                id: Date.now(),
                name: name,
                address: address,
                total: totalSlots,
                available: totalSlots,
                price: price,
                description: description,
                distance: (Math.random() * 2 + 0.1).toFixed(1) + ' km',
                rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                owner: this.currentUser.email
            };

            this.parkingLots.push(newParkingSpace);
            this.saveData();
            
            // Reset form
            document.getElementById('addParkingForm').reset();
            
            this.updateAdminStats();
            this.loadAdminParkingSpaces();
            this.showSuccess('Parking space added successfully!');
        }
    }

    loadAdminParkingSpaces() {
        const container = document.getElementById('adminParkingList');
        if (!container) return;

        const userSpaces = this.parkingLots.filter(lot => lot.owner === this.currentUser.email);
        
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
            const spaceElement = this.createAdminParkingCard(space);
            container.appendChild(spaceElement);
        });
    }

    createAdminParkingCard(space) {
        const card = document.createElement('div');
        card.className = 'border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all';
        
        const occupancyRate = ((space.total - space.available) / space.total * 100).toFixed(0);
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-semibold text-gray-900">${space.name}</h4>
                <button onclick="app.deleteParking(${space.id})" class="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete
                </button>
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

    deleteParking(spaceId) {
        if (confirm('Are you sure you want to delete this parking space?')) {
            this.parkingLots = this.parkingLots.filter(lot => lot.id !== spaceId);
            this.saveData();
            this.updateAdminStats();
            this.loadAdminParkingSpaces();
            this.showSuccess('Parking space deleted successfully!');
        }
    }

    // Bookings management
    loadBookings() {
        const container = document.getElementById('bookingsList');
        if (!container) return;

        const userBookings = this.bookings.filter(booking => booking.userId === this.currentUser.email);

        if (userBookings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p class="text-gray-600 mb-6">Your parking reservations will appear here</p>
                    <button onclick="app.showHome()" class="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                        Find Parking
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        userBookings.forEach(booking => {
            const bookingElement = this.createBookingCard(booking);
            container.appendChild(bookingElement);
        });
    }

    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'card rounded-2xl shadow-sm p-6';
        
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
            
            <div class="text-sm text-gray-600">
                <p>Valid until: ${new Date(booking.endTime).toLocaleString()}</p>
            </div>
        `;

        return card;
    }

    // Utility methods
    findNearby() {
        this.showSuccess('Searching for nearby parking...');
        this.loadParkingLots();
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            const filteredLots = this.parkingLots.filter(lot => 
                lot.name.toLowerCase().includes(query) || 
                lot.address.toLowerCase().includes(query)
            );
            this.displayFilteredLots(filteredLots);
        } else if (query.length === 0) {
            this.loadParkingLots();
        }
    }

    displayFilteredLots(lots) {
        const container = document.getElementById('parkingList');
        if (!container) return;

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
            const lotElement = this.createParkingCard(lot);
            container.appendChild(lotElement);
        });
    }

    generateQRCode() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    saveData() {
        localStorage.setItem('parkingLots', JSON.stringify(this.parkingLots));
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }

    logout() {
        this.currentUser = null;
        this.userType = null;
        this.showView('loginView');
        this.showSuccess('Logged out successfully');
    }

    // Notification system
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app
const app = new ParkEaseApp();