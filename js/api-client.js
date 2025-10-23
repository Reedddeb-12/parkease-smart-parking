/**
 * API Client for ParkEase
 * Handles all API requests with authentication
 */

class APIClient {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Handle API responses
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            // Handle authentication errors
            if (response.status === 401) {
                this.logout();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    }

    // Make authenticated API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.success) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        return data;
    }

    async demoLogin() {
        const data = await this.request('/auth/demo', {
            method: 'POST'
        });

        if (data.success) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        return data;
    }

    async getProfile() {
        return await this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Parking lot methods
    async getParkingLots(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/parking?${queryParams}` : '/parking';
        return await this.request(endpoint);
    }

    async getNearbyParkingLots(latitude, longitude, radius = 5000) {
        return await this.request(`/parking/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    }

    async getParkingLot(id) {
        return await this.request(`/parking/${id}`);
    }

    async createParkingLot(parkingData) {
        return await this.request('/parking', {
            method: 'POST',
            body: JSON.stringify(parkingData)
        });
    }

    async updateParkingLot(id, parkingData) {
        return await this.request(`/parking/${id}`, {
            method: 'PUT',
            body: JSON.stringify(parkingData)
        });
    }

    async deleteParkingLot(id) {
        return await this.request(`/parking/${id}`, {
            method: 'DELETE'
        });
    }

    // Booking methods
    async getBookings(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/bookings?${queryParams}` : '/bookings';
        return await this.request(endpoint);
    }

    async createBooking(bookingData) {
        return await this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    async getBooking(id) {
        return await this.request(`/bookings/${id}`);
    }

    async cancelBooking(id, reason) {
        return await this.request(`/bookings/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    async extendBooking(id, additionalHours) {
        return await this.request(`/bookings/${id}/extend`, {
            method: 'POST',
            body: JSON.stringify({ additionalHours })
        });
    }

    // User methods
    async addVehicle(vehicleData) {
        return await this.request('/users/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    }

    async removeVehicle(vehicleId) {
        return await this.request(`/users/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });
    }

    async addFavorite(parkingLotId) {
        return await this.request('/users/favorites', {
            method: 'POST',
            body: JSON.stringify({ parkingLotId })
        });
    }

    async removeFavorite(parkingLotId) {
        return await this.request(`/users/favorites/${parkingLotId}`, {
            method: 'DELETE'
        });
    }

    async updateSettings(settings) {
        return await this.request('/users/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // Utility methods
    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', message: error.message };
        }
    }
}

// Create global API client instance
window.apiClient = new APIClient();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}