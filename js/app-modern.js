/**
 * ParkEase - Modern App Controller
 * Handles view navigation and basic interactions
 */

class ParkEaseApp {
    constructor() {
        this.currentView = 'login';
        this.isLoggedIn = false;
        this.user = null;
        this.userType = null; // 'user' or 'admin'
        this.parkingLots = JSON.parse(localStorage.getItem('parkingLots')) || [];
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showView('loginView');
        }, 2000);
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register button
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.showRegisterForm());
        }

        // Admin login button
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => this.showAdminLogin());
        }

        // Demo button
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.handleDemo());
        }

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item') || e.target.closest('.nav-item')) {
                const navItem = e.target.classList.contains('nav-item') ? e.target : e.target.closest('.nav-item');
                this.handleNavigation(navItem);
            }
        });

        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        // Search
        const searchInput = document.getElementById('searchLocation');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Quick actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="findNearby"]')) {
                this.findNearbyParking();
            }
            if (e.target.closest('[data-action="myBookings"]')) {
                this.showView('bookingsView');
                this.loadBookings();
            }
        });
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    showView(viewId) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block';
            setTimeout(() => {
                targetView.classList.add('active');
            }, 10);
        }

        // Update navigation
        this.updateNavigation(viewId);
        this.currentView = viewId;
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
                'bookingsView': 'My Bookings',
                'profileView': 'Profile',
                'detailsView': 'Parking Details'
            };
            
            if (navTitle) {
                navTitle.textContent = titles[viewId] || 'ParkEase';
            }

            // Show/hide back button
            if (backBtn) {
                if (viewId === 'homeView') {
                    backBtn.classList.add('hidden');
                } else {
                    backBtn.classList.remove('hidden');
                }
            }
        }

        // Update bottom nav active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const targetView = item.dataset.view + 'View';
            if (targetView === viewId) {
                item.classList.add('active');
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email && password) {
            // Check if it's admin login
            if (this.currentLoginType === 'admin') {
                // Simple admin check - in real app, this would be server-side
                if (email.includes('admin') || password === 'admin123') {
                    this.user = {
                        name: 'Admin',
                        email: email,
                        initials: 'A'
                    };
                    this.userType = 'admin';
                    this.isLoggedIn = true;
                    this.showView('adminView');
                    this.initializeAdmin();
                } else {
                    this.showError('Invalid admin credentials');
                }
            } else {
                // Regular user login
                this.user = {
                    name: email.split('@')[0],
                    email: email,
                    initials: email.charAt(0).toUpperCase()
                };
                this.userType = 'user';
                this.isLoggedIn = true;
                this.showView('homeView');
                this.initializeHome();
            }
        }
    }

    showRegisterForm() {
        const container = document.getElementById('loginFormContainer');
        container.innerHTML = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-semibold text-white mb-2">Create Account</h3>
                <p class="text-white/70 text-sm">Join ParkEase today</p>
            </div>
            <form id="registerForm" class="space-y-4">
                <div>
                    <input type="text" id="registerName" placeholder="Full Name" required
                        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <div>
                    <input type="email" id="registerEmail" placeholder="Email address" required
                        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <div>
                    <input type="password" id="registerPassword" placeholder="Password" required
                        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <div>
                    <input type="tel" id="registerPhone" placeholder="Phone Number" required
                        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <button type="submit" 
                    class="w-full bg-white text-primary-600 py-3 rounded-2xl font-semibold hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Create Account
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <button onclick="location.reload()" 
                    class="text-white/70 hover:text-white transition-colors">
                    ← Back to Login
                </button>
            </div>
        `;

        // Add register form handler
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    showAdminLogin() {
        this.currentLoginType = 'admin';
        const container = document.getElementById('loginFormContainer');
        container.innerHTML = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-semibold text-white mb-2">Admin Login</h3>
                <p class="text-white/70 text-sm">Parking space owners</p>
            </div>
            <form id="adminLoginForm" class="space-y-6">
                <div>
                    <input type="email" id="loginEmail" placeholder="Admin Email" required
                        class="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <div>
                    <input type="password" id="loginPassword" placeholder="Admin Password" required
                        class="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                </div>
                <button type="submit" 
                    class="w-full bg-white text-primary-600 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Admin Sign In
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <button onclick="location.reload()" 
                    class="text-white/70 hover:text-white transition-colors">
                    ← Back to User Login
                </button>
            </div>
            
            <div class="mt-4 p-4 bg-white/10 rounded-xl">
                <p class="text-white/80 text-xs text-center">
                    Demo Admin: Use any email with "admin" or password "admin123"
                </p>
            </div>
        `;

        // Add admin login form handler
        const adminLoginForm = document.getElementById('adminLoginForm');
        adminLoginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const phone = document.getElementById('registerPhone').value;

        if (name && email && password && phone) {
            this.user = {
                name: name,
                email: email,
                phone: phone,
                initials: name.charAt(0).toUpperCase()
            };
            this.userType = 'user';
            this.isLoggedIn = true;
            this.showView('homeView');
            this.initializeHome();
            this.showSuccess('Account created successfully!');
        }
    }

    handleDemo() {
        this.user = {
            name: 'Demo User',
            email: 'demo@parkease.com',
            initials: 'D'
        };
        
        this.isLoggedIn = true;
        this.showView('homeView');
        this.initializeHome();
    }

    handleNavigation(navItem) {
        const targetView = navItem.dataset.view + 'View';
        this.showView(targetView);
        
        if (targetView === 'bookingsView') {
            this.loadBookings();
        } else if (targetView === 'profileView') {
            this.loadProfile();
        } else if (targetView === 'homeView') {
            this.initializeHome();
        }
    }

    findNearbyParking() {
        // Simulate finding nearby parking
        this.showSuccess('Searching for nearby parking...');
        setTimeout(() => {
            this.loadParkingLots();
        }, 1000);
    }

    initializeAdmin() {
        this.updateAdminStats();
        this.loadAdminParkingSpaces();
        this.setupAdminEventListeners();
    }

    setupAdminEventListeners() {
        const addParkingForm = document.getElementById('addParkingForm');
        if (addParkingForm) {
            addParkingForm.addEventListener('submit', (e) => this.handleAddParkingSpace(e));
        }
    }

    handleAddParkingSpace(e) {
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
                available: totalSlots, // Initially all slots are available
                price: price,
                description: description,
                distance: Math.random() * 2 + 0.1 + ' km', // Random distance for demo
                rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5-5
                owner: this.user.email
            };

            this.parkingLots.push(newParkingSpace);
            this.saveParkingLots();
            
            // Reset form
            document.getElementById('addParkingForm').reset();
            
            // Refresh admin view
            this.updateAdminStats();
            this.loadAdminParkingSpaces();
            
            this.showSuccess('Parking space added successfully!');
        }
    }

    updateAdminStats() {
        const totalSpaces = document.getElementById('totalSpaces');
        const totalBookings = document.getElementById('totalBookings');
        
        if (totalSpaces) {
            const userSpaces = this.parkingLots.filter(lot => lot.owner === this.user.email);
            totalSpaces.textContent = userSpaces.length;
        }
        
        if (totalBookings) {
            const userBookings = this.bookings.filter(booking => {
                const lot = this.parkingLots.find(l => l.id === booking.lotId);
                return lot && lot.owner === this.user.email;
            });
            totalBookings.textContent = userBookings.length;
        }
    }

    loadAdminParkingSpaces() {
        const container = document.getElementById('adminParkingList');
        if (!container) return;

        const userSpaces = this.parkingLots.filter(lot => lot.owner === this.user.email);
        
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
                <div class="flex space-x-2">
                    <button onclick="app.editParkingSpace(${space.id})" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Edit
                    </button>
                    <button onclick="app.deleteParkingSpace(${space.id})" class="text-red-600 hover:text-red-700 text-sm font-medium">
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
                    <div class="text-lg font-semibold text-primary-600">₹${space.price}</div>
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

    editParkingSpace(spaceId) {
        const space = this.parkingLots.find(lot => lot.id === spaceId);
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
        
        this.showSuccess('Edit mode activated. Update the details and submit.');
    }

    deleteParkingSpace(spaceId) {
        if (confirm('Are you sure you want to delete this parking space?')) {
            this.parkingLots = this.parkingLots.filter(lot => lot.id !== spaceId);
            this.saveParkingLots();
            this.updateAdminStats();
            this.loadAdminParkingSpaces();
            this.showSuccess('Parking space deleted successfully!');
        }
    }

    goBack() {
        this.showView('homeView');
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        // Simple search simulation
        console.log('Searching for:', query);
    }

    initializeHome() {
        // Update user greeting
        const userGreeting = document.getElementById('userGreeting');
        const userInitials = document.getElementById('userInitials');
        
        if (userGreeting && this.user) {
            const hour = new Date().getHours();
            let greeting = 'Good morning';
            if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
            else if (hour >= 17) greeting = 'Good evening';
            
            userGreeting.textContent = `${greeting}, ${this.user.name}!`;
        }
        
        if (userInitials && this.user) {
            userInitials.textContent = this.user.initials;
        }

        // Load parking lots
        this.loadParkingLots();
        
        // Initialize map (simplified)
        this.initializeMap();
    }

    loadParkingLots() {
        const container = document.getElementById('parkingLots');
        if (!container) return;

        container.innerHTML = '';
        
        this.parkingLots.forEach(lot => {
            const lotElement = this.createParkingLotCard(lot);
            container.appendChild(lotElement);
        });
    }

    createParkingLotCard(lot) {
        const card = document.createElement('div');
        card.className = 'parking-card';
        
        const availability = lot.available / lot.total;
        let statusClass = 'status-full';
        let statusText = 'Full';
        
        if (availability > 0.5) {
            statusClass = 'status-available';
            statusText = 'Available';
        } else if (availability > 0.2) {
            statusClass = 'status-limited';
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
                    <span class="text-sm font-semibold text-primary-600">
                        ₹${lot.price}/hr
                    </span>
                </div>
                <div class="text-sm text-gray-500">
                    ${lot.distance}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showParkingDetails(lot);
        });

        return card;
    }

    showParkingDetails(lot) {
        const detailsView = document.getElementById('detailsView');
        if (!detailsView) return;

        detailsView.innerHTML = `
            <div class="p-6">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div class="h-48 bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <div class="text-center text-white">
                            <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                            </svg>
                            <h2 class="text-2xl font-bold">${lot.name}</h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="text-center p-4 bg-gray-50 rounded-xl">
                                <div class="text-2xl font-bold text-primary-600">${lot.available}</div>
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
                                <span class="text-gray-600">${lot.distance} • ${lot.rating} ★</span>
                            </div>
                        </div>

                        <!-- Booking Form -->
                        <div class="bg-gray-50 rounded-xl p-4 mb-6">
                            <h4 class="font-semibold text-gray-900 mb-3">Book Your Slot</h4>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm text-gray-600 mb-1">Duration (hours)</label>
                                    <select id="bookingDuration" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
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
                                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                </div>
                            </div>
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-gray-600">Total Amount:</span>
                                <span id="totalAmount" class="text-xl font-bold text-primary-600">₹${lot.price}</span>
                            </div>
                        </div>

                        <button onclick="app.bookParkingSlot(${lot.id})" 
                            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]" 
                            ${lot.available === 0 ? 'disabled' : ''}>
                            ${lot.available === 0 ? 'No Slots Available' : 'Book Now'}
                        </button>
                    </div>
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

    bookParkingSlot(lotId) {
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
            userId: this.user.email,
            vehicleNumber: vehicleNumber,
            duration: duration,
            amount: totalAmount,
            startTime: new Date(),
            endTime: new Date(Date.now() + duration * 60 * 60 * 1000),
            status: 'active',
            qrCode: this.generateQRCode()
        };

        // Update lot availability
        lot.available -= 1;
        
        // Save booking
        this.bookings.push(booking);
        this.saveBookings();
        this.saveParkingLots();

        // Show success and redirect to ticket
        this.showTicket(booking);
    }

    showTicket(booking) {
        const ticketView = document.getElementById('ticketView');
        if (!ticketView) return;

        ticketView.innerHTML = `
            <div class="max-w-sm mx-auto">
                <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6 text-center">
                        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h2 class="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                        <p class="text-white/80">Your parking slot is reserved</p>
                    </div>

                    <!-- Ticket Details -->
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-32 h-32 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <div class="text-4xl font-mono font-bold text-gray-600">${booking.qrCode}</div>
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
                                <span class="text-gray-600">Amount Paid:</span>
                                <span class="font-semibold text-primary-600">₹${booking.amount}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Valid Until:</span>
                                <span class="font-semibold">${new Date(booking.endTime).toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <button onclick="app.showView('homeView')" 
                                class="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showView('ticketView');
        this.showSuccess('Booking confirmed! Your slot is reserved.');
    }

    generateQRCode() {
        // Simple QR code simulation
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    loadBookings() {
        const bookingsView = document.getElementById('bookingsView');
        if (!bookingsView) return;

        const userBookings = this.bookings.filter(booking => booking.userId === this.user.email);

        if (userBookings.length === 0) {
            bookingsView.innerHTML = `
                <div class="p-6">
                    <div class="text-center py-12">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H3V9h14v11z"/>
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                        <p class="text-gray-600 mb-6">Your parking reservations will appear here</p>
                        <button onclick="app.showView('homeView')" class="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors">
                            Find Parking
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        bookingsView.innerHTML = `
            <div class="p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                <div class="space-y-4">
                    ${userBookings.map(booking => this.createBookingCard(booking)).join('')}
                </div>
            </div>
        `;
    }

    createBookingCard(booking) {
        const isActive = new Date() < new Date(booking.endTime);
        const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        const statusText = isActive ? 'Active' : 'Expired';

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                        <p class="font-semibold text-primary-600">₹${booking.amount}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">QR Code</p>
                        <p class="font-semibold font-mono">${booking.qrCode}</p>
                    </div>
                </div>
                
                <div class="text-sm text-gray-600">
                    <p>Valid until: ${new Date(booking.endTime).toLocaleString()}</p>
                </div>
                
                ${isActive ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button onclick="app.showTicket(${JSON.stringify(booking).replace(/"/g, '&quot;')})" 
                            class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            View Ticket
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    loadProfile() {
        const profileView = document.getElementById('profileView');
        if (!profileView || !this.user) return;

        profileView.innerHTML = `
            <div class="p-6">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div class="text-center mb-6">
                        <div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-white">${this.user.initials}</span>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900">${this.user.name}</h2>
                        <p class="text-gray-600">${this.user.email}</p>
                    </div>
                    
                    <div class="space-y-4">
                        <button class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span class="font-medium text-gray-900">Payment Methods</span>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                        
                        <button class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span class="font-medium text-gray-900">Notifications</span>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                        
                        <button class="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span class="font-medium text-gray-900">Help & Support</span>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                        
                        <button onclick="app.logout()" class="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    initializeMap() {
        // Simplified map initialization
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                    <div class="text-center">
                        <svg class="w-12 h-12 mx-auto mb-3 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <p class="text-sm text-gray-600">Interactive map loading...</p>
                    </div>
                </div>
            `;
        }
    }

    // Data persistence methods
    saveParkingLots() {
        localStorage.setItem('parkingLots', JSON.stringify(this.parkingLots));
    }

    saveBookings() {
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }

    // Utility methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 translate-x-full`;
        
        if (type === 'success') {
            notification.className += ' bg-green-500 text-white';
        } else if (type === 'error') {
            notification.className += ' bg-red-500 text-white';
        } else {
            notification.className += ' bg-primary-500 text-white';
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white/80 hover:text-white">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
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
        const container = document.getElementById('parkingLots');
        if (!container) return;

        container.innerHTML = '';
        
        if (lots.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p>No parking spaces found</p>
                    <p class="text-sm">Try a different search term</p>
                </div>
            `;
            return;
        }
        
        lots.forEach(lot => {
            const lotElement = this.createParkingLotCard(lot);
            container.appendChild(lotElement);
        });
    }

    logout() {
        this.isLoggedIn = false;
        this.user = null;
        this.showView('loginView');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ParkEaseApp();
});