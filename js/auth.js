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

// Authentication functions
function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        const user = {
            name: email.split('@')[0],
            email: email,
            initials: email.charAt(0).toUpperCase(),
            userType: 'user'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        showSuccess('Login successful!');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;

    if (name && email && password && phone) {
        const user = {
            name: name,
            email: email,
            phone: phone,
            initials: name.charAt(0).toUpperCase(),
            userType: 'user'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        showSuccess('Account created successfully!');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Simple admin validation
    if ((email.includes('admin') || email === 'admin@parkease.com') && 
        (password === 'admin123' || password === 'admin')) {
        const user = {
            name: 'Admin',
            email: email,
            initials: 'A',
            userType: 'admin'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        showSuccess('Admin login successful!');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        showError('Invalid admin credentials');
    }
}

function handleDemo() {
    const user = {
        name: 'Demo User',
        email: 'demo@parkease.com',
        initials: 'D',
        userType: 'user'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    showSuccess('Welcome to ParkEase Demo!');
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1000);
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