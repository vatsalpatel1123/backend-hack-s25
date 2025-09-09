// API Service Layer for Kumbh Mela Backend Integration
class ApiService {
    constructor() {
        // Backend API base URL - update this to match your backend server
        this.baseURL = 'http://localhost:8000';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Generic API request handler
    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method: method,
                headers: this.headers
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Emergency Reports API
    async createEmergencyReport(reportData) {
        const payload = {
            user_id: reportData.userId || null,
            lat: reportData.lat,
            lng: reportData.lng,
            type: reportData.type,
            description: reportData.description,
            priority: reportData.priority || 'medium'
        };
        return await this.makeRequest('/emergency/', 'POST', payload);
    }

    async getEmergencyReports(status = null) {
        const endpoint = status ? `/emergency/?status=${status}` : '/emergency/';
        return await this.makeRequest(endpoint);
    }

    async updateEmergencyReport(reportId, updateData) {
        return await this.makeRequest(`/emergency/${reportId}`, 'PUT', updateData);
    }

    // Missing Persons API
    async createMissingPersonReport(reportData) {
        const payload = {
            reported_by: reportData.reportedBy || null,
            name: reportData.name,
            age: reportData.age || null,
            gender: reportData.gender || null,
            photo_url: reportData.photoUrl || null,
            last_seen_lat: reportData.lastSeenLat,
            last_seen_lng: reportData.lastSeenLng,
            description: reportData.description,
            contact_info: reportData.contactInfo
        };
        return await this.makeRequest('/missing/', 'POST', payload);
    }

    async getMissingPersonReports(status = null) {
        const endpoint = status ? `/missing/?status=${status}` : '/missing/';
        return await this.makeRequest(endpoint);
    }

    async updateMissingPersonReport(missingId, updateData) {
        return await this.makeRequest(`/missing/${missingId}`, 'PUT', updateData);
    }

    // Facilities API
    async getFacilities(type = null, lat = null, lng = null, radius = 1000) {
        let endpoint = '/facilities/';
        const params = new URLSearchParams();
        
        if (type) params.append('type', type);
        if (lat !== null) params.append('lat', lat);
        if (lng !== null) params.append('lng', lng);
        if (radius) params.append('radius', radius);
        
        if (params.toString()) {
            endpoint += '?' + params.toString();
        }
        
        return await this.makeRequest(endpoint);
    }

    async createFacility(facilityData) {
        return await this.makeRequest('/facilities/', 'POST', facilityData);
    }

    // Crowd Density API
    async getCrowdDensity() {
        return await this.makeRequest('/crowd/');
    }

    async createCrowdDensityReport(densityData) {
        const payload = {
            location_id: densityData.locationId,
            people_count: densityData.peopleCount,
            density_level: densityData.densityLevel
        };
        return await this.makeRequest('/crowd/', 'POST', payload);
    }

    async updateCrowdDensity(densityId, updateData) {
        return await this.makeRequest(`/crowd/${densityId}`, 'PUT', updateData);
    }

    // Routes API
    async createRoute(routeData) {
        return await this.makeRequest('/routes/', 'POST', routeData);
    }

    async getRoutes() {
        return await this.makeRequest('/routes/');
    }

    // Users API
    async createUser(userData) {
        return await this.makeRequest('/users/', 'POST', userData);
    }

    async getUsers() {
        return await this.makeRequest('/users/');
    }

    async updateUser(userId, updateData) {
        return await this.makeRequest(`/users/${userId}`, 'PUT', updateData);
    }

    // Parking API
    async getParkingAvailability() {
        return await this.makeRequest('/parking/');
    }

    async updateParkingSlot(slotId, updateData) {
        return await this.makeRequest(`/parking/${slotId}`, 'PUT', updateData);
    }

    // Utility method to handle file uploads (for images)
    async uploadFile(file, endpoint) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File Upload Error:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            return await this.makeRequest('/');
        } catch (error) {
            console.error('Backend health check failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const apiService = new ApiService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
