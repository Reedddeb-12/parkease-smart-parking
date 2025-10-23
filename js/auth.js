/**
 * Authentication JavaScript for ParkEase
 */

// Check if user is already logged in
if (localStorage.getItem('currentUser')) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user.userType === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'home.html';
    }
}

// Form switching functions
function showRegisterForm() {
    document.getElementById('userLoginForm').classList.add('hidden');
    document.getElementById('adminForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function showAdminForm() {
    document.getElementById('userLoginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('adminForm').classList.remove('hidden');
}

function showUserLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('adminForm').classList.add('hidden');
    document.getElementById('userLoginForm').classList.remove('hidden');
}

// API Base URL
const API_BASE_URL = window.location.origin;

// Authentication functions
async function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                showSuccess('Login successful!');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please try again.');
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;

    if (name && email && password && phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phone })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                showSuccess('Account created successfully!');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                showError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please try again.');
        }
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email && password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                showSuccess('Admin login successful!');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showError(data.message || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showError('Network error. Please try again.');
        }
    }
}

async function handleDemo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/demo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            showSuccess('Welcome to ParkEase Demo!');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showError(data.message || 'Demo login failed');
        }
    } catch (error) {
        console.error('Demo login error:', error);
        showError('Network error. Please try again.');
    }
}

// Notification system
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'success') {
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Form switching
    document.getElementById('showRegisterBtn').addEventListener('click', showRegisterForm);
    document.getElementById('adminLoginBtn').addEventListener('click', showAdminForm);
    document.getElementById('backToLoginBtn').addEventListener('click', showUserLoginForm);
    document.getElementById('backToUserLoginBtn').addEventListener('click', showUserLoginForm);

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleUserLogin);
    document.querySelector('#registerForm form').addEventListener('submit', handleRegister);
    document.querySelector('#adminForm form').addEventListener('submit', handleAdminLogin);

    // Demo button
    document.getElementById('demoBtn').addEventListener('click', handleDemo);
});