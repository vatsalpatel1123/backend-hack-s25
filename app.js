// Main App Controller for Kumbh Mela Mobile Application
class KumbhMelaApp {
    constructor() {
        this.currentScreen = 'dashboard-screen';
        this.userLocation = null;
        this.nearbyPlaces = [];
        this.currentCategory = 'all';
        this.heatMapLayer = null;
        this.isHeatMapVisible = false;
        this.apiService = new ApiService();
        this.shuttleData = {
            routes: [],
            stops: [],
            vehicles: []
        };
        this.currentShuttleTab = 'routes';
        this.reportsData = {
            emergency: [],
            missing: [],
            found: []
        };
        this.currentReportsTab = 'emergency';
        this.crowdData = {
            sectors: [],
            summary: {}
        };
        this.chatbotOpen = false;
        this.chatHistory = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLocationPermission();
        this.loadNearbyPlaces();
        this.loadShuttleData();
        this.loadReportsData();
        this.loadCrowdData();
        this.setupFormHandlers();

        // Show dashboard by default
        this.showScreen('dashboard-screen');
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('emergencyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmergencySubmission();
        });

        document.getElementById('missingForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMissingPersonSubmission();
        });

        document.getElementById('foundForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFoundItemSubmission();
        });
    }

    setupFormHandlers() {
        // Add touch feedback for mobile
        const buttons = document.querySelectorAll('button, .dashboard-card, .place-item');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.opacity = '0.7';
            });
            
            button.addEventListener('touchend', () => {
                button.style.opacity = '1';
            });
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Special handling for map screen
        if (screenId === 'map-screen') {
            setTimeout(() => {
                if (typeof map !== 'undefined' && map) {
                    map.invalidateSize();
                }
            }, 300);
        }
    }

    async checkLocationPermission() {
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    });
                });

                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                this.updateLocationStatus('Location found');
            } catch (error) {
                this.updateLocationStatus('Location unavailable');
                console.error('Location error:', error);
            }
        } else {
            this.updateLocationStatus('Location not supported');
        }
    }

    updateLocationStatus(status) {
        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.textContent = status;
        }
    }

    async loadNearbyPlaces() {
        try {
            this.showLoading(true);
            
            // Load facilities from backend
            const response = await apiService.getFacilities();
            
            if (response.success) {
                this.nearbyPlaces = response.data;
                this.renderNearbyPlaces();
            } else {
                // Fallback to static data if backend is unavailable
                this.loadStaticNearbyPlaces();
            }
        } catch (error) {
            console.error('Error loading nearby places:', error);
            this.loadStaticNearbyPlaces();
        } finally {
            this.showLoading(false);
        }
    }

    loadStaticNearbyPlaces() {
        // Use comprehensive nearby places data
        if (typeof getPlacesByCategory !== 'undefined') {
            this.nearbyPlaces = getPlacesByCategory('all');
        } else {
            // Fallback data if nearby-places-data.js is not loaded
            this.nearbyPlaces = [
                {
                    type: 'washroom',
                    name: 'Public Washroom - Ghat Area',
                    description: 'Clean public facilities near main ghat',
                    lat: 23.1285,
                    lng: 75.7930,
                    icon: '🚻',
                    rating: 4.0,
                    openHours: '24/7'
                },
                {
                    type: 'medical',
                    name: 'Medical Post - Triveni',
                    description: 'Emergency medical services',
                    lat: 23.1290,
                    lng: 75.7935,
                    icon: '🏥',
                    rating: 4.5,
                    openHours: '24/7'
                },
                {
                    type: 'police_station',
                    name: 'Police Outpost',
                    description: 'Security and crowd control',
                    lat: 23.1295,
                    lng: 75.7928,
                    icon: '🚔',
                    rating: 4.0,
                    openHours: '24/7'
                },
                {
                    type: 'food',
                    name: 'Prasad Distribution Center',
                    description: 'Free food and water distribution',
                    lat: 23.1282,
                    lng: 75.7940,
                    icon: '🍽️',
                    rating: 4.4,
                    openHours: '5:00 AM - 10:00 PM'
                },
                {
                    type: 'mandir',
                    name: 'Mahakaleshwar Temple',
                    description: 'Famous Jyotirlinga temple',
                    lat: 23.1826,
                    lng: 75.7681,
                    icon: '🛕',
                    rating: 4.8,
                    openHours: '4:00 AM - 11:00 PM'
                }
            ];
        }

        this.renderNearbyPlaces();
    }

    renderNearbyPlaces() {
        const placesList = document.getElementById('placesList');
        if (!placesList) return;

        const filteredPlaces = this.currentCategory === 'all'
            ? this.nearbyPlaces
            : this.nearbyPlaces.filter(place => place.type === this.currentCategory);

        // Sort by distance if user location is available
        if (this.userLocation) {
            filteredPlaces.sort((a, b) => {
                const distA = this.calculateDistance(this.userLocation, a);
                const distB = this.calculateDistance(this.userLocation, b);
                return distA - distB;
            });
        }

        placesList.innerHTML = filteredPlaces.map(place => {
            const distance = this.userLocation
                ? this.calculateDistance(this.userLocation, place)
                : 'Unknown';

            const rating = place.rating ? '⭐'.repeat(Math.floor(place.rating)) : '';
            const openHours = place.openHours || 'Hours not available';

            return `
                <div class="place-item" onclick="app.navigateToPlace('${place.lat}', '${place.lng}', '${place.name}')">
                    <div class="place-header">
                        <div class="place-icon">${place.icon || '📍'}</div>
                        <div class="place-info">
                            <h4>${place.name}</h4>
                            <p>${place.description}</p>
                            <div class="place-details">
                                <span class="place-rating">${rating}</span>
                                <span class="place-hours">🕒 ${openHours}</span>
                            </div>
                            ${place.facilities ? `<div class="place-facilities">${place.facilities.slice(0, 2).join(' • ')}</div>` : ''}
                        </div>
                        <div class="place-distance">
                            ${typeof distance === 'number' ? distance.toFixed(1) + ' km' : distance}
                            <div class="navigate-btn">🧭</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    showCategory(category, element) {
        this.currentCategory = category;

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }

        this.renderNearbyPlaces();
    }

    navigateToPlace(lat, lng, name) {
        // Switch to map screen and set destination
        this.showScreen('map-screen');

        // Store destination for navigation
        this.pendingNavigation = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            name: name
        };

        // Wait for map to be ready and start navigation
        setTimeout(() => {
            this.startPendingNavigation();
        }, 800);
    }

    startPendingNavigation() {
        if (this.pendingNavigation && typeof map !== 'undefined' && map) {
            const { lat, lng, name } = this.pendingNavigation;

            // Center map on destination
            map.setView([lat, lng], 16);

            // Call the global navigation function
            if (typeof navigateToCoordinates !== 'undefined') {
                navigateToCoordinates(lat, lng, name);
            } else {
                // Fallback: create a simple marker
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`📍 ${name}`).openPopup();
                this.showToast(`Showing location: ${name}`, 'success');
            }

            // Clear pending navigation
            this.pendingNavigation = null;
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', show);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    async handleEmergencySubmission() {
        try {
            this.showLoading(true);
            
            const formData = {
                type: document.getElementById('emergency-type').value,
                description: document.getElementById('emergency-description').value,
                priority: document.getElementById('emergency-priority').value,
                lat: this.userLocation?.lat || 23.1287723,
                lng: this.userLocation?.lng || 75.7933631
            };

            const response = await apiService.createEmergencyReport(formData);
            
            if (response.success) {
                this.showToast('Emergency report submitted successfully!', 'success');
                document.getElementById('emergencyForm').reset();
                this.showScreen('dashboard-screen');
            } else {
                throw new Error('Failed to submit report');
            }
        } catch (error) {
            console.error('Emergency submission error:', error);
            this.showToast('Failed to submit emergency report. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleMissingPersonSubmission() {
        try {
            this.showLoading(true);
            
            const formData = {
                name: document.getElementById('missing-name').value,
                age: parseInt(document.getElementById('missing-age').value) || null,
                gender: document.getElementById('missing-gender').value || null,
                description: document.getElementById('missing-description').value,
                contactInfo: document.getElementById('missing-contact').value,
                lastSeenLat: this.userLocation?.lat || 23.1287723,
                lastSeenLng: this.userLocation?.lng || 75.7933631
            };

            const response = await apiService.createMissingPersonReport(formData);
            
            if (response.success) {
                this.showToast('Missing person report submitted successfully!', 'success');
                document.getElementById('missingForm').reset();
                this.showScreen('dashboard-screen');
            } else {
                throw new Error('Failed to submit report');
            }
        } catch (error) {
            console.error('Missing person submission error:', error);
            this.showToast('Failed to submit missing person report. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleFoundItemSubmission() {
        try {
            this.showLoading(true);
            
            // For found items, we'll use the missing persons API with a special flag
            const formData = {
                name: `FOUND: ${document.getElementById('found-item').value}`,
                description: document.getElementById('found-description').value,
                contactInfo: document.getElementById('found-contact').value,
                lastSeenLat: this.userLocation?.lat || 23.1287723,
                lastSeenLng: this.userLocation?.lng || 75.7933631
            };

            const response = await apiService.createMissingPersonReport(formData);
            
            if (response.success) {
                this.showToast('Found item report submitted successfully!', 'success');
                document.getElementById('foundForm').reset();
                this.showScreen('dashboard-screen');
            } else {
                throw new Error('Failed to submit report');
            }
        } catch (error) {
            console.error('Found item submission error:', error);
            this.showToast('Failed to submit found item report. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Shuttle Service Methods
    async loadShuttleData() {
        try {
            // Load shuttle routes
            const routes = await this.apiService.getShuttleRoutes();
            this.shuttleData.routes = routes || this.getDefaultShuttleRoutes();

            // Load shuttle stops
            const stops = await this.apiService.getShuttleStops();
            this.shuttleData.stops = stops || this.getDefaultShuttleStops();

            // Load live vehicle data
            const vehicles = await this.apiService.getLiveShuttles();
            this.shuttleData.vehicles = vehicles || this.getDefaultVehicleData();

            this.renderShuttleData();
        } catch (error) {
            console.error('Error loading shuttle data:', error);
            // Use default data as fallback
            this.shuttleData.routes = this.getDefaultShuttleRoutes();
            this.shuttleData.stops = this.getDefaultShuttleStops();
            this.shuttleData.vehicles = this.getDefaultVehicleData();
            this.renderShuttleData();
        }
    }

    getDefaultShuttleRoutes() {
        return [
            {
                id: 'route1',
                name: 'Main Circuit',
                description: 'Triveni Ghat → Railway Station → Bus Stand → Triveni Ghat',
                status: 'active',
                frequency: '15 minutes',
                operatingHours: '5:00 AM - 11:00 PM',
                stops: ['Triveni Ghat', 'Mahakaleshwar Temple', 'Railway Station', 'Bus Stand'],
                color: '#FF6B35'
            },
            {
                id: 'route2',
                name: 'Temple Circuit',
                description: 'Triveni Ghat → Mahakaleshwar → Kal Bhairav → Triveni Ghat',
                status: 'active',
                frequency: '20 minutes',
                operatingHours: '4:00 AM - 10:00 PM',
                stops: ['Triveni Ghat', 'Mahakaleshwar Temple', 'Kal Bhairav Temple', 'Harsiddhi Temple'],
                color: '#28a745'
            },
            {
                id: 'route3',
                name: 'Parking Shuttle',
                description: 'Main Parking → Triveni Ghat (Direct)',
                status: 'active',
                frequency: '10 minutes',
                operatingHours: '24 hours',
                stops: ['Main Parking Area', 'Sector Parking', 'Triveni Ghat'],
                color: '#17a2b8'
            }
        ];
    }

    getDefaultShuttleStops() {
        return [
            {
                id: 'stop1',
                name: 'Triveni Ghat Main',
                location: { lat: 23.1287723, lng: 75.7933631 },
                routes: ['route1', 'route2', 'route3'],
                facilities: ['Waiting Area', 'Drinking Water', 'Restrooms'],
                nextArrival: '3 minutes',
                status: 'active'
            },
            {
                id: 'stop2',
                name: 'Mahakaleshwar Temple',
                location: { lat: 23.1825, lng: 75.7681 },
                routes: ['route1', 'route2'],
                facilities: ['Waiting Area', 'Prasad Counter'],
                nextArrival: '7 minutes',
                status: 'active'
            },
            {
                id: 'stop3',
                name: 'Railway Station',
                location: { lat: 23.1815, lng: 75.7804 },
                routes: ['route1'],
                facilities: ['Waiting Area', 'Ticket Counter', 'Food Stalls'],
                nextArrival: '12 minutes',
                status: 'active'
            },
            {
                id: 'stop4',
                name: 'Main Parking Area',
                location: { lat: 23.1250, lng: 75.7900 },
                routes: ['route3'],
                facilities: ['Parking', 'Security', 'Information Desk'],
                nextArrival: '5 minutes',
                status: 'active'
            }
        ];
    }

    getDefaultVehicleData() {
        return [
            {
                id: 'bus1',
                route: 'route1',
                routeName: 'Main Circuit',
                currentLocation: { lat: 23.1750, lng: 75.7750 },
                nextStop: 'Railway Station',
                eta: '4 minutes',
                capacity: 40,
                occupancy: 28,
                status: 'on-time'
            },
            {
                id: 'bus2',
                route: 'route2',
                routeName: 'Temple Circuit',
                currentLocation: { lat: 23.1825, lng: 75.7681 },
                nextStop: 'Kal Bhairav Temple',
                eta: '6 minutes',
                capacity: 35,
                occupancy: 22,
                status: 'on-time'
            },
            {
                id: 'bus3',
                route: 'route3',
                routeName: 'Parking Shuttle',
                currentLocation: { lat: 23.1270, lng: 75.7920 },
                nextStop: 'Triveni Ghat Main',
                eta: '2 minutes',
                capacity: 25,
                occupancy: 18,
                status: 'delayed'
            }
        ];
    }

    showShuttleTab(tabName, element) {
        this.currentShuttleTab = tabName;

        // Update active tab
        document.querySelectorAll('.shuttle-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }

        // Show/hide tab content
        document.querySelectorAll('.shuttle-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`shuttle-${tabName}`).classList.add('active');

        this.renderShuttleData();
    }

    renderShuttleData() {
        switch(this.currentShuttleTab) {
            case 'routes':
                this.renderShuttleRoutes();
                break;
            case 'stops':
                this.renderShuttleStops();
                break;
            case 'live':
                this.renderLiveTracking();
                break;
        }
    }

    renderShuttleRoutes() {
        const routesList = document.getElementById('routesList');
        if (!routesList) return;

        routesList.innerHTML = this.shuttleData.routes.map(route => `
            <div class="route-item">
                <div class="route-header">
                    <div class="route-name">${route.name}</div>
                    <div class="route-status status-${route.status}">${route.status.toUpperCase()}</div>
                </div>
                <div class="route-details">
                    <p><strong>Route:</strong> ${route.description}</p>
                    <p><strong>Frequency:</strong> Every ${route.frequency}</p>
                    <p><strong>Operating Hours:</strong> ${route.operatingHours}</p>
                    <p><strong>Stops:</strong> ${route.stops.join(' → ')}</p>
                    <button onclick="showRouteOnMap('${route.id}')" class="map-toggle-btn" style="margin-top: 8px;">
                        📍 Show Route on Map
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderShuttleStops() {
        const stopsList = document.getElementById('stopsList');
        if (!stopsList) return;

        stopsList.innerHTML = this.shuttleData.stops.map(stop => `
            <div class="stop-item">
                <div class="stop-header">
                    <div class="stop-name">${stop.name}</div>
                    <div class="stop-status status-${stop.status}">${stop.status.toUpperCase()}</div>
                </div>
                <div class="stop-details">
                    <p><strong>Next Arrival:</strong> ${stop.nextArrival}</p>
                    <p><strong>Routes:</strong> ${stop.routes.length} routes</p>
                    <p><strong>Facilities:</strong> ${stop.facilities.join(', ')}</p>
                    <button onclick="navigateToStop(${stop.location.lat}, ${stop.location.lng}, '${stop.name}')"
                            class="map-toggle-btn" style="margin-top: 8px;">
                        🧭 Navigate to Stop
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderLiveTracking() {
        const shuttleVehicles = document.getElementById('shuttleVehicles');
        if (!shuttleVehicles) return;

        shuttleVehicles.innerHTML = this.shuttleData.vehicles.map(vehicle => {
            const occupancyPercent = Math.round((vehicle.occupancy / vehicle.capacity) * 100);
            const occupancyClass = occupancyPercent > 80 ? 'status-delayed' :
                                 occupancyPercent > 60 ? 'status-active' : 'status-active';

            return `
                <div class="vehicle-item">
                    <div class="vehicle-header">
                        <div class="vehicle-name">🚌 ${vehicle.routeName}</div>
                        <div class="vehicle-status status-${vehicle.status.replace('-', '')}">${vehicle.status.toUpperCase()}</div>
                    </div>
                    <div class="vehicle-details">
                        <p><strong>Next Stop:</strong> ${vehicle.nextStop} (${vehicle.eta})</p>
                        <p><strong>Occupancy:</strong>
                            <span class="${occupancyClass}">${vehicle.occupancy}/${vehicle.capacity} (${occupancyPercent}%)</span>
                        </p>
                        <button onclick="trackVehicle('${vehicle.id}')" class="map-toggle-btn" style="margin-top: 8px;">
                            📍 Track on Map
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async refreshShuttleData() {
        this.showLoading(true);
        this.showToast('Refreshing shuttle data...', 'info');

        try {
            await this.loadShuttleData();
            this.showToast('Shuttle data updated', 'success');
        } catch (error) {
            this.showToast('Failed to refresh shuttle data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Reports Management Methods
    async loadReportsData() {
        try {
            // Load emergency reports
            const emergencyReports = await this.apiService.getEmergencyReports();
            this.reportsData.emergency = emergencyReports || this.getDefaultEmergencyReports();

            // Load missing person reports
            const missingReports = await this.apiService.getMissingPersonReports();
            this.reportsData.missing = missingReports || this.getDefaultMissingReports();

            // Load found items reports
            const foundReports = await this.apiService.getFoundItemReports();
            this.reportsData.found = foundReports || this.getDefaultFoundReports();

            this.renderReportsData();
        } catch (error) {
            console.error('Error loading reports data:', error);
            // Use default data as fallback
            this.reportsData.emergency = this.getDefaultEmergencyReports();
            this.reportsData.missing = this.getDefaultMissingReports();
            this.reportsData.found = this.getDefaultFoundReports();
            this.renderReportsData();
        }
    }

    getDefaultEmergencyReports() {
        return [
            {
                id: 'EMG001',
                type: 'medical',
                description: 'Person collapsed near Triveni Ghat',
                location: 'Triveni Ghat Main Area',
                status: 'in-progress',
                priority: 'high',
                reportedBy: 'Anonymous',
                reportedAt: '2024-01-15 14:30:00',
                updatedAt: '2024-01-15 14:45:00',
                assignedTo: 'Medical Team Alpha'
            },
            {
                id: 'EMG002',
                type: 'security',
                description: 'Suspicious activity reported',
                location: 'North Sector - Main Entrance',
                status: 'resolved',
                priority: 'medium',
                reportedBy: 'Security Guard',
                reportedAt: '2024-01-15 13:15:00',
                updatedAt: '2024-01-15 13:45:00',
                assignedTo: 'Security Team Beta'
            },
            {
                id: 'EMG003',
                type: 'fire',
                description: 'Small fire in food stall',
                location: 'East Sector - Food Court',
                status: 'open',
                priority: 'high',
                reportedBy: 'Vendor',
                reportedAt: '2024-01-15 15:20:00',
                updatedAt: '2024-01-15 15:20:00',
                assignedTo: 'Fire Team'
            }
        ];
    }

    getDefaultMissingReports() {
        return [
            {
                id: 'MIS001',
                name: 'Rajesh Kumar',
                age: 45,
                description: 'Wearing white kurta, lost near bathing ghat',
                lastSeen: 'East Sector - Bathing Ghats',
                contactPerson: 'Sunita Kumar',
                contactPhone: '+91-9876543210',
                status: 'open',
                reportedAt: '2024-01-15 12:00:00',
                photo: 'placeholder-person.jpg'
            },
            {
                id: 'MIS002',
                name: 'Priya Sharma',
                age: 8,
                description: 'Child in red dress, lost during crowd',
                lastSeen: 'Triveni Ghat Main Area',
                contactPerson: 'Amit Sharma',
                contactPhone: '+91-9876543211',
                status: 'resolved',
                reportedAt: '2024-01-15 10:30:00',
                photo: 'placeholder-child.jpg'
            }
        ];
    }

    getDefaultFoundReports() {
        return [
            {
                id: 'FND001',
                itemType: 'Mobile Phone',
                description: 'Samsung Galaxy phone in blue case',
                foundLocation: 'Near Triveni Ghat steps',
                foundBy: 'Volunteer Team',
                status: 'available',
                foundAt: '2024-01-15 11:45:00',
                contactInfo: 'Lost & Found Counter - Sector 1'
            },
            {
                id: 'FND002',
                itemType: 'Wallet',
                description: 'Brown leather wallet with ID cards',
                foundLocation: 'North Sector - Parking Area',
                foundBy: 'Security Guard',
                status: 'claimed',
                foundAt: '2024-01-15 09:20:00',
                contactInfo: 'Returned to owner'
            },
            {
                id: 'FND003',
                itemType: 'Bag',
                description: 'Red cloth bag with religious items',
                foundLocation: 'Temple Circuit',
                foundBy: 'Pilgrim',
                status: 'available',
                foundAt: '2024-01-15 14:10:00',
                contactInfo: 'Lost & Found Counter - Sector 2'
            }
        ];
    }

    showReportsTab(tabName, element) {
        this.currentReportsTab = tabName;

        // Update active tab
        document.querySelectorAll('.reports-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }

        // Show/hide tab content
        document.querySelectorAll('.reports-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-reports`).classList.add('active');

        this.renderReportsData();
    }

    renderReportsData() {
        switch(this.currentReportsTab) {
            case 'emergency':
                this.renderEmergencyReports();
                break;
            case 'missing':
                this.renderMissingReports();
                break;
            case 'found':
                this.renderFoundReports();
                break;
        }
    }

    renderEmergencyReports() {
        const reportsList = document.getElementById('emergencyReportsList');
        if (!reportsList) return;

        reportsList.innerHTML = this.reportsData.emergency.map(report => `
            <div class="report-item">
                <div class="report-header">
                    <div class="report-id">${report.id} - ${report.type.toUpperCase()}</div>
                    <div class="report-status status-${report.status.replace(' ', '-')}">${report.status.toUpperCase()}</div>
                </div>
                <div class="report-details">
                    <p><strong>Description:</strong> ${report.description}</p>
                    <p><strong>Location:</strong> ${report.location}</p>
                    <p><strong>Priority:</strong> ${report.priority}</p>
                    <p><strong>Assigned to:</strong> ${report.assignedTo}</p>
                </div>
                <div class="report-meta">
                    <span>Reported: ${new Date(report.reportedAt).toLocaleString()}</span>
                    <span>Updated: ${new Date(report.updatedAt).toLocaleString()}</span>
                </div>
                <div class="report-actions">
                    <button class="action-btn-small btn-view" onclick="viewReportDetails('${report.id}', 'emergency')">
                        👁️ View
                    </button>
                    <button class="action-btn-small btn-update" onclick="updateReportStatus('${report.id}', 'emergency')">
                        ✏️ Update
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderMissingReports() {
        const reportsList = document.getElementById('missingReportsList');
        if (!reportsList) return;

        reportsList.innerHTML = this.reportsData.missing.map(report => `
            <div class="report-item">
                <div class="report-header">
                    <div class="report-id">${report.id} - ${report.name}</div>
                    <div class="report-status status-${report.status}">${report.status.toUpperCase()}</div>
                </div>
                <div class="report-details">
                    <p><strong>Age:</strong> ${report.age} years</p>
                    <p><strong>Description:</strong> ${report.description}</p>
                    <p><strong>Last Seen:</strong> ${report.lastSeen}</p>
                    <p><strong>Contact:</strong> ${report.contactPerson} (${report.contactPhone})</p>
                </div>
                <div class="report-meta">
                    <span>Reported: ${new Date(report.reportedAt).toLocaleString()}</span>
                </div>
                <div class="report-actions">
                    <button class="action-btn-small btn-view" onclick="viewReportDetails('${report.id}', 'missing')">
                        👁️ View
                    </button>
                    <button class="action-btn-small btn-contact" onclick="contactReporter('${report.contactPhone}')">
                        📞 Contact
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFoundReports() {
        const reportsList = document.getElementById('foundReportsList');
        if (!reportsList) return;

        reportsList.innerHTML = this.reportsData.found.map(report => `
            <div class="report-item">
                <div class="report-header">
                    <div class="report-id">${report.id} - ${report.itemType}</div>
                    <div class="report-status status-${report.status}">${report.status.toUpperCase()}</div>
                </div>
                <div class="report-details">
                    <p><strong>Description:</strong> ${report.description}</p>
                    <p><strong>Found at:</strong> ${report.foundLocation}</p>
                    <p><strong>Found by:</strong> ${report.foundBy}</p>
                    <p><strong>Contact:</strong> ${report.contactInfo}</p>
                </div>
                <div class="report-meta">
                    <span>Found: ${new Date(report.foundAt).toLocaleString()}</span>
                </div>
                <div class="report-actions">
                    <button class="action-btn-small btn-view" onclick="viewReportDetails('${report.id}', 'found')">
                        👁️ View
                    </button>
                    <button class="action-btn-small btn-contact" onclick="claimItem('${report.id}')">
                        📦 Claim
                    </button>
                </div>
            </div>
        `).join('');
    }

    async refreshReports() {
        this.showLoading(true);
        this.showToast('Refreshing reports...', 'info');

        try {
            await this.loadReportsData();
            this.showToast('Reports updated', 'success');
        } catch (error) {
            this.showToast('Failed to refresh reports', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Crowd Information Methods
    async loadCrowdData() {
        try {
            const crowdInfo = await this.apiService.getCrowdDensity();
            this.crowdData = crowdInfo || this.getDefaultCrowdData();
            this.renderCrowdData();
        } catch (error) {
            console.error('Error loading crowd data:', error);
            this.crowdData = this.getDefaultCrowdData();
            this.renderCrowdData();
        }
    }

    getDefaultCrowdData() {
        return {
            summary: {
                totalVisitors: 25847,
                currentDensity: 'Medium',
                peakTime: '6:00 PM',
                lastUpdated: new Date().toISOString()
            },
            sectors: [
                {
                    id: 'triveniGhat',
                    name: 'Triveni Ghat (Main)',
                    density: 'high',
                    count: 8500,
                    capacity: 10000,
                    percentage: 85,
                    waitTime: '15-20 minutes',
                    recommendation: 'Consider visiting later'
                },
                {
                    id: 'sector1',
                    name: 'North Sector - Main Entrance',
                    density: 'medium',
                    count: 3200,
                    capacity: 5000,
                    percentage: 64,
                    waitTime: '5-10 minutes',
                    recommendation: 'Good time to visit'
                },
                {
                    id: 'sector2',
                    name: 'East Sector - Bathing Ghats',
                    density: 'high',
                    count: 4800,
                    capacity: 6000,
                    percentage: 80,
                    waitTime: '10-15 minutes',
                    recommendation: 'Very crowded, use alternative'
                },
                {
                    id: 'sector3',
                    name: 'South Sector - Parking & Transport',
                    density: 'low',
                    count: 1200,
                    capacity: 4000,
                    percentage: 30,
                    waitTime: '2-5 minutes',
                    recommendation: 'Best time to visit'
                },
                {
                    id: 'sector4',
                    name: 'West Sector - Accommodation',
                    density: 'medium',
                    count: 2800,
                    capacity: 4500,
                    percentage: 62,
                    waitTime: '5-8 minutes',
                    recommendation: 'Moderate crowd'
                },
                {
                    id: 'sector5',
                    name: 'Northeast Sector - Commercial',
                    density: 'medium',
                    count: 3500,
                    capacity: 5500,
                    percentage: 64,
                    waitTime: '8-12 minutes',
                    recommendation: 'Busy but manageable'
                },
                {
                    id: 'sector6',
                    name: 'Southwest Sector - Services',
                    density: 'low',
                    count: 1800,
                    capacity: 3500,
                    percentage: 51,
                    waitTime: '3-6 minutes',
                    recommendation: 'Good time to visit'
                }
            ]
        };
    }

    renderCrowdData() {
        // Update summary stats
        const totalVisitors = document.getElementById('totalVisitors');
        const currentDensity = document.getElementById('currentDensity');
        const peakTime = document.getElementById('peakTime');

        if (totalVisitors) totalVisitors.textContent = this.crowdData.summary.totalVisitors.toLocaleString();
        if (currentDensity) currentDensity.textContent = this.crowdData.summary.currentDensity;
        if (peakTime) peakTime.textContent = this.crowdData.summary.peakTime;

        // Render sectors list
        const sectorsList = document.getElementById('crowdSectorsList');
        if (!sectorsList) return;

        sectorsList.innerHTML = this.crowdData.sectors.map(sector => `
            <div class="sector-item">
                <div class="sector-info">
                    <div class="sector-name">${sector.name}</div>
                    <div class="sector-details">
                        ${sector.count.toLocaleString()} visitors • ${sector.percentage}% capacity • Wait: ${sector.waitTime}
                        <br><small>${sector.recommendation}</small>
                    </div>
                </div>
                <div class="density-indicator density-${sector.density}">
                    ${sector.density.toUpperCase()}
                </div>
            </div>
        `).join('');
    }

    async refreshCrowdData() {
        this.showLoading(true);
        this.showToast('Refreshing crowd data...', 'info');

        try {
            await this.loadCrowdData();
            this.showToast('Crowd data updated', 'success');
        } catch (error) {
            this.showToast('Failed to refresh crowd data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Chatbot Methods
    toggleChatbot() {
        this.chatbotOpen = !this.chatbotOpen;
        const chatWindow = document.getElementById('chatbot-window');
        if (chatWindow) {
            chatWindow.classList.toggle('open', this.chatbotOpen);
        }
    }

    sendMessage(message = null) {
        const input = document.getElementById('chatInput');
        const userMessage = message || (input ? input.value.trim() : '');

        if (!userMessage) return;

        // Add user message to chat
        this.addMessageToChat(userMessage, 'user');

        // Clear input
        if (input) input.value = '';

        // Process bot response
        setTimeout(() => {
            const botResponse = this.getBotResponse(userMessage);
            this.addMessageToChat(botResponse, 'bot');
        }, 500);
    }

    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;

        messageDiv.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in history
        this.chatHistory.push({ message, sender, timestamp: new Date() });
    }

    getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();

        // Aarti times
        if (message.includes('aarti') || message.includes('prayer') || message.includes('worship')) {
            return `🕯️ <strong>Aarti Times at Triveni Ghat:</strong><br>
                    • Morning Aarti: 5:30 AM<br>
                    • Sandhya Aarti: 6:30 PM<br>
                    • Special Aarti: 12:00 PM (during Kumbh)<br><br>
                    📿 Best time to visit for peaceful darshan is early morning between 5:00-7:00 AM.`;
        }

        // Important locations
        if (message.includes('location') || message.includes('place') || message.includes('temple') || message.includes('where')) {
            return `📍 <strong>Important Locations:</strong><br>
                    🛕 Mahakaleshwar Temple - 2.5 km from Triveni Ghat<br>
                    🛕 Kal Bhairav Temple - 3 km from Triveni Ghat<br>
                    🛕 Harsiddhi Temple - 4 km from Triveni Ghat<br>
                    🏛️ Vikram University - 5 km<br>
                    🚉 Ujjain Railway Station - 6 km<br><br>
                    Use our 'Nearby Places' feature for detailed directions!`;
        }

        // Safety guidelines
        if (message.includes('safety') || message.includes('security') || message.includes('emergency') || message.includes('help')) {
            return `🛡️ <strong>Safety Guidelines:</strong><br>
                    • Stay hydrated and carry water<br>
                    • Keep emergency contacts handy<br>
                    • Don't venture alone in crowded areas<br>
                    • Follow crowd control instructions<br>
                    • Report emergencies using our Emergency feature<br>
                    • Keep valuables secure<br><br>
                    🚨 Emergency Helpline: 108 | Police: 100`;
        }

        // Transportation
        if (message.includes('transport') || message.includes('bus') || message.includes('shuttle') || message.includes('parking')) {
            return `🚌 <strong>Transportation Options:</strong><br>
                    • Free shuttle service every 15 minutes<br>
                    • Main Circuit: Triveni Ghat ↔ Railway Station<br>
                    • Temple Circuit: Triveni Ghat ↔ Mahakaleshwar<br>
                    • Parking shuttles available 24/7<br>
                    🅿️ Main parking areas in South & West sectors<br><br>
                    Check our 'Shuttle Routes' for live tracking!`;
        }

        // Crowd information
        if (message.includes('crowd') || message.includes('busy') || message.includes('peak') || message.includes('time')) {
            return `👥 <strong>Crowd Information:</strong><br>
                    • Best time: Early morning (5-7 AM)<br>
                    • Peak hours: 8 AM - 12 PM, 5-8 PM<br>
                    • Least crowded: Late evening after 9 PM<br>
                    • Use our heat map for real-time density<br><br>
                    💡 Check 'Crowd Info' for live sector-wise updates!`;
        }

        // Food and facilities
        if (message.includes('food') || message.includes('eat') || message.includes('prasad') || message.includes('facility')) {
            return `🍽️ <strong>Food & Facilities:</strong><br>
                    • Free prasad distribution at main ghat<br>
                    • Food courts in East & Northeast sectors<br>
                    • 24/7 medical facilities available<br>
                    • Clean washrooms in all sectors<br>
                    • Drinking water stations every 100m<br><br>
                    🏥 Medical emergency? Use our Emergency Report feature!`;
        }

        // Weather and clothing
        if (message.includes('weather') || message.includes('clothes') || message.includes('wear') || message.includes('temperature')) {
            return `🌤️ <strong>Weather & Clothing Tips:</strong><br>
                    • Current temperature: 18-25°C<br>
                    • Wear comfortable walking shoes<br>
                    • Light cotton clothes recommended<br>
                    • Carry a light jacket for early morning<br>
                    • Sun protection during day time<br><br>
                    ☔ Check weather updates regularly during monsoon season.`;
        }

        // Accommodation
        if (message.includes('stay') || message.includes('hotel') || message.includes('accommodation') || message.includes('dharamshala')) {
            return `🏨 <strong>Accommodation Options:</strong><br>
                    • Government dharamshalas near Triveni Ghat<br>
                    • Private hotels in city center<br>
                    • Temporary shelters in West sector<br>
                    • Ashrams and guest houses available<br><br>
                    📞 For bookings: Contact local tourism office<br>
                    🏕️ Temporary accommodation info available at help desks.`;
        }

        // General greetings
        if (message.includes('hello') || message.includes('hi') || message.includes('namaste') || message.includes('help')) {
            return `🙏 Namaste! I'm here to help you with:<br>
                    🕯️ Aarti timings and rituals<br>
                    📍 Important locations and directions<br>
                    🛡️ Safety guidelines and emergency info<br>
                    🚌 Transportation and shuttle services<br>
                    👥 Crowd information and best times to visit<br>
                    🍽️ Food, facilities, and accommodation<br><br>
                    What would you like to know about Kumbh Mela?`;
        }

        // Default response
        return `🤔 I understand you're asking about "${userMessage}". Here are some topics I can help with:<br><br>
                🕯️ Ask about "aarti times"<br>
                📍 Ask about "important locations"<br>
                🛡️ Ask about "safety guidelines"<br>
                🚌 Ask about "transportation"<br>
                👥 Ask about "crowd information"<br>
                🍽️ Ask about "food and facilities"<br><br>
                Or try asking something specific about Kumbh Mela!`;
    }

    askBot(topic) {
        this.sendMessage(topic);
    }
}

// Global functions for HTML onclick handlers
function showScreen(screenId) {
    if (window.app) {
        window.app.showScreen(screenId);
    }
}

function showCategory(category, element) {
    if (window.app) {
        window.app.showCategory(category, element);
    }
}

function refreshNearbyPlaces() {
    if (window.app) {
        window.app.loadNearbyPlaces();
    }
}

function showCrowdInfo() {
    if (window.app) {
        window.app.showScreen('map-screen');
        setTimeout(() => {
            if (window.toggleHeatMap) {
                window.toggleHeatMap();
            }
        }, 500);
    }
}

// Shuttle-related global functions
function showShuttleTab(tabName, element) {
    if (window.app) {
        window.app.showShuttleTab(tabName, element);
    }
}

function refreshShuttleData() {
    if (window.app) {
        window.app.refreshShuttleData();
    }
}

function showRouteOnMap(routeId) {
    if (window.app) {
        window.app.showScreen('map-screen');
        // Add route visualization logic here
        window.app.showToast('Route visualization coming soon', 'info');
    }
}

function navigateToStop(lat, lng, name) {
    if (window.app) {
        window.app.navigateToPlace(lat, lng, name);
    }
}

function trackVehicle(vehicleId) {
    if (window.app) {
        window.app.showScreen('map-screen');
        // Add vehicle tracking logic here
        window.app.showToast('Vehicle tracking coming soon', 'info');
    }
}

function toggleShuttleMap() {
    if (window.app) {
        window.app.showScreen('map-screen');
        window.app.showToast('Switching to map view', 'info');
    }
}

// Reports-related global functions
function showReportsTab(tabName, element) {
    if (window.app) {
        window.app.showReportsTab(tabName, element);
    }
}

function refreshReports() {
    if (window.app) {
        window.app.refreshReports();
    }
}

function viewReportDetails(reportId, type) {
    if (window.app) {
        window.app.showToast(`Viewing ${type} report ${reportId}`, 'info');
        // Add detailed view logic here
    }
}

function updateReportStatus(reportId, type) {
    if (window.app) {
        window.app.showToast(`Updating ${type} report ${reportId}`, 'info');
        // Add status update logic here
    }
}

function contactReporter(phone) {
    if (window.app) {
        window.app.showToast(`Calling ${phone}`, 'info');
        // Add contact logic here
        if (phone && phone !== 'undefined') {
            window.open(`tel:${phone}`, '_self');
        }
    }
}

function claimItem(itemId) {
    if (window.app) {
        window.app.showToast(`Claiming item ${itemId}`, 'info');
        // Add claim logic here
    }
}

// Crowd information global functions
function refreshCrowdData() {
    if (window.app) {
        window.app.refreshCrowdData();
    }
}

function showCrowdMap() {
    if (window.app) {
        window.app.showScreen('map-screen');
        setTimeout(() => {
            if (typeof toggleHeatMap !== 'undefined') {
                toggleHeatMap();
            }
        }, 500);
    }
}

function getCrowdAlerts() {
    if (window.app) {
        window.app.showToast('Crowd alerts feature coming soon', 'info');
        // Add crowd alerts logic here
    }
}

// Chatbot global functions
function toggleChatbot() {
    if (window.app) {
        window.app.toggleChatbot();
    }
}

function sendMessage() {
    if (window.app) {
        window.app.sendMessage();
    }
}

function askBot(topic) {
    if (window.app) {
        window.app.askBot(topic);
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Performance optimizations
function optimizeForMobile() {
    // Disable context menu on long press for better mobile experience
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Optimize scroll performance
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.screen')) {
            // Allow scrolling within screens
            return;
        }
        e.preventDefault();
    }, { passive: false });
}

// Service Worker registration for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KumbhMelaApp();
    optimizeForMobile();
    registerServiceWorker();

    // Add loading screen fade out
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 1000);
});
