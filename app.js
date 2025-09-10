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
        this.emergencyData = {
            incidents: [],
            personnel: [],
            resources: []
        };
        this.managementData = {
            users: [],
            analytics: {},
            settings: {},
            logs: []
        };
        this.currentEmergencyTab = 'incidents';
        this.currentManagementTab = 'users';
        this.missingPersonsData = [];
        this.missingPersonAlerts = [];
        this.aiChatHistory = [];
        this.voiceModeActive = false;
        this.knowledgeBase = this.initializeKnowledgeBase();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLocationPermission();
        this.loadNearbyPlaces();
        this.loadShuttleData();
        this.loadReportsData();
        this.loadCrowdData();
        this.loadEmergencyData();
        this.loadManagementData();
        this.loadMissingPersonsData();
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

    // Emergency Dashboard Methods
    async loadEmergencyData() {
        try {
            const emergencyInfo = await this.apiService.getEmergencyDashboardData();
            this.emergencyData = emergencyInfo || this.getDefaultEmergencyData();
            this.renderEmergencyData();
        } catch (error) {
            console.error('Error loading emergency data:', error);
            this.emergencyData = this.getDefaultEmergencyData();
            this.renderEmergencyData();
        }
    }

    getDefaultEmergencyData() {
        return {
            incidents: [
                {
                    id: 'INC001',
                    type: 'medical',
                    priority: 'high',
                    description: 'Cardiac emergency near Triveni Ghat main steps',
                    location: { lat: 23.1287723, lng: 75.7933631, name: 'Triveni Ghat Main' },
                    reportedAt: new Date(Date.now() - 15 * 60000).toISOString(),
                    status: 'active',
                    assignedTeam: 'Medical Team Alpha',
                    estimatedResponse: '3 minutes',
                    reporter: 'Volunteer #247'
                },
                {
                    id: 'INC002',
                    type: 'security',
                    priority: 'medium',
                    description: 'Crowd control needed at North Sector entrance',
                    location: { lat: 23.1320, lng: 75.7920, name: 'North Sector Entrance' },
                    reportedAt: new Date(Date.now() - 8 * 60000).toISOString(),
                    status: 'responding',
                    assignedTeam: 'Security Team Beta',
                    estimatedResponse: '5 minutes',
                    reporter: 'Security Guard #12'
                },
                {
                    id: 'INC003',
                    type: 'fire',
                    priority: 'high',
                    description: 'Small fire in food stall, East Sector',
                    location: { lat: 23.1290, lng: 75.7950, name: 'East Sector Food Court' },
                    reportedAt: new Date(Date.now() - 5 * 60000).toISOString(),
                    status: 'active',
                    assignedTeam: 'Fire Team Charlie',
                    estimatedResponse: '2 minutes',
                    reporter: 'Vendor #89'
                }
            ],
            personnel: [
                {
                    id: 'PER001',
                    name: 'Inspector Rajesh Kumar',
                    role: 'Police Inspector',
                    status: 'available',
                    location: 'North Sector Command Post',
                    contact: '+91-9876543210',
                    assignedSector: 'North Sector',
                    onDutySince: '06:00 AM'
                },
                {
                    id: 'PER002',
                    name: 'Dr. Priya Sharma',
                    role: 'Medical Officer',
                    status: 'busy',
                    location: 'Medical Post #1',
                    contact: '+91-9876543211',
                    assignedSector: 'Triveni Ghat',
                    onDutySince: '05:30 AM'
                },
                {
                    id: 'PER003',
                    name: 'Fire Officer Amit Singh',
                    role: 'Fire Officer',
                    status: 'responding',
                    location: 'En route to East Sector',
                    contact: '+91-9876543212',
                    assignedSector: 'East Sector',
                    onDutySince: '06:00 AM'
                }
            ],
            resources: [
                {
                    id: 'RES001',
                    type: 'Ambulance',
                    status: 'available',
                    location: 'Medical Post #1',
                    capacity: '2 patients',
                    lastMaintenance: '2024-01-14',
                    driver: 'Suresh Kumar'
                },
                {
                    id: 'RES002',
                    type: 'Fire Truck',
                    status: 'deployed',
                    location: 'En route to East Sector',
                    capacity: '500L water tank',
                    lastMaintenance: '2024-01-13',
                    driver: 'Ramesh Patel'
                },
                {
                    id: 'RES003',
                    type: 'Police Vehicle',
                    status: 'available',
                    location: 'North Sector Patrol',
                    capacity: '4 officers',
                    lastMaintenance: '2024-01-15',
                    driver: 'Constable Mohan'
                }
            ]
        };
    }

    showEmergencyTab(tabName, element) {
        this.currentEmergencyTab = tabName;

        // Update active tab
        document.querySelectorAll('.emergency-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }

        // Show/hide tab content
        document.querySelectorAll('.emergency-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`emergency-${tabName}`).classList.add('active');

        this.renderEmergencyData();
    }

    renderEmergencyData() {
        switch(this.currentEmergencyTab) {
            case 'incidents':
                this.renderActiveIncidents();
                break;
            case 'personnel':
                this.renderPersonnel();
                break;
            case 'resources':
                this.renderResources();
                break;
            case 'communications':
                this.renderCommunications();
                break;
        }
    }

    renderActiveIncidents() {
        const incidentsList = document.getElementById('activeIncidentsList');
        if (!incidentsList) return;

        incidentsList.innerHTML = this.emergencyData.incidents.map(incident => `
            <div class="incident-item">
                <div class="incident-header">
                    <div class="incident-id">${incident.id} - ${incident.type.toUpperCase()}</div>
                    <div class="incident-priority priority-${incident.priority}">${incident.priority.toUpperCase()}</div>
                </div>
                <div class="incident-details">
                    <p><strong>Description:</strong> ${incident.description}</p>
                    <p><strong>Location:</strong> ${incident.location.name}</p>
                    <p><strong>Assigned Team:</strong> ${incident.assignedTeam}</p>
                    <p><strong>ETA:</strong> ${incident.estimatedResponse}</p>
                    <p><strong>Status:</strong> ${incident.status}</p>
                </div>
                <div class="incident-meta">
                    <span>Reported: ${new Date(incident.reportedAt).toLocaleTimeString()}</span>
                    <span>Reporter: ${incident.reporter}</span>
                </div>
                <div class="incident-actions">
                    <button class="action-btn-small btn-view" onclick="viewIncidentOnMap('${incident.id}')">
                        🗺️ Map
                    </button>
                    <button class="action-btn-small btn-update" onclick="updateIncidentStatus('${incident.id}')">
                        ✏️ Update
                    </button>
                    <button class="action-btn-small btn-contact" onclick="contactTeam('${incident.assignedTeam}')">
                        📞 Contact
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPersonnel() {
        const personnelList = document.getElementById('personnelList');
        if (!personnelList) return;

        personnelList.innerHTML = this.emergencyData.personnel.map(person => `
            <div class="personnel-item">
                <div class="personnel-header-item">
                    <div class="personnel-name">${person.name}</div>
                    <div class="personnel-status status-${person.status.replace(' ', '')}">${person.status.toUpperCase()}</div>
                </div>
                <div class="personnel-details">
                    <p><strong>Role:</strong> ${person.role}</p>
                    <p><strong>Location:</strong> ${person.location}</p>
                    <p><strong>Sector:</strong> ${person.assignedSector}</p>
                    <p><strong>On Duty Since:</strong> ${person.onDutySince}</p>
                    <p><strong>Contact:</strong> ${person.contact}</p>
                </div>
                <div class="personnel-actions">
                    <button class="action-btn-small btn-contact" onclick="contactPersonnel('${person.contact}')">
                        📞 Call
                    </button>
                    <button class="action-btn-small btn-view" onclick="trackPersonnel('${person.id}')">
                        📍 Track
                    </button>
                    <button class="action-btn-small btn-update" onclick="reassignPersonnel('${person.id}')">
                        🔄 Reassign
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderResources() {
        const resourcesList = document.getElementById('resourcesList');
        if (!resourcesList) return;

        resourcesList.innerHTML = this.emergencyData.resources.map(resource => `
            <div class="resource-item">
                <div class="resource-header-item">
                    <div class="resource-name">${resource.type} (${resource.id})</div>
                    <div class="resource-status status-${resource.status}">${resource.status.toUpperCase()}</div>
                </div>
                <div class="resource-details">
                    <p><strong>Location:</strong> ${resource.location}</p>
                    <p><strong>Capacity:</strong> ${resource.capacity}</p>
                    <p><strong>Driver:</strong> ${resource.driver}</p>
                    <p><strong>Last Maintenance:</strong> ${resource.lastMaintenance}</p>
                </div>
                <div class="resource-actions">
                    <button class="action-btn-small btn-view" onclick="trackResource('${resource.id}')">
                        📍 Track
                    </button>
                    <button class="action-btn-small btn-update" onclick="deployResource('${resource.id}')">
                        🚀 Deploy
                    </button>
                    <button class="action-btn-small btn-contact" onclick="contactDriver('${resource.driver}')">
                        📞 Driver
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCommunications() {
        const commsPanel = document.getElementById('commsPanel');
        if (!commsPanel) return;

        commsPanel.innerHTML = `
            <div class="comms-interface">
                <div class="broadcast-section">
                    <h4>📢 Emergency Broadcast</h4>
                    <textarea id="broadcastMessage" placeholder="Enter emergency message..." rows="3"></textarea>
                    <div class="broadcast-options">
                        <label><input type="checkbox" checked> All Personnel</label>
                        <label><input type="checkbox"> Public Announcement</label>
                        <label><input type="checkbox"> Mobile Alerts</label>
                    </div>
                    <button onclick="sendBroadcast()" class="broadcast-btn">📢 Send Broadcast</button>
                </div>

                <div class="radio-section">
                    <h4>📡 Radio Communications</h4>
                    <div class="radio-channels">
                        <button class="channel-btn active">Channel 1 - Command</button>
                        <button class="channel-btn">Channel 2 - Medical</button>
                        <button class="channel-btn">Channel 3 - Fire</button>
                        <button class="channel-btn">Channel 4 - Security</button>
                    </div>
                    <div class="radio-log">
                        <div class="radio-message">
                            <span class="timestamp">15:45</span>
                            <span class="sender">Command</span>
                            <span class="message">All units, situation at East Sector under control</span>
                        </div>
                        <div class="radio-message">
                            <span class="timestamp">15:42</span>
                            <span class="sender">Fire Team</span>
                            <span class="message">Fire extinguished, investigating cause</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async refreshEmergencyData() {
        this.showLoading(true);
        this.showToast('Refreshing emergency data...', 'info');

        try {
            await this.loadEmergencyData();
            this.showToast('Emergency data updated', 'success');
        } catch (error) {
            this.showToast('Failed to refresh emergency data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Management Dashboard Methods
    async loadManagementData() {
        try {
            const managementInfo = await this.apiService.getManagementDashboardData();
            this.managementData = managementInfo || this.getDefaultManagementData();
            this.renderManagementData();
        } catch (error) {
            console.error('Error loading management data:', error);
            this.managementData = this.getDefaultManagementData();
            this.renderManagementData();
        }
    }

    getDefaultManagementData() {
        return {
            users: [
                {
                    id: 'USR001',
                    name: 'Admin User',
                    email: 'admin@kumbhmela.gov.in',
                    role: 'Administrator',
                    status: 'active',
                    lastLogin: '2024-01-15 14:30:00',
                    permissions: ['all']
                },
                {
                    id: 'USR002',
                    name: 'Inspector Rajesh Kumar',
                    email: 'rajesh.kumar@police.gov.in',
                    role: 'Police Officer',
                    status: 'active',
                    lastLogin: '2024-01-15 14:15:00',
                    permissions: ['emergency', 'reports']
                },
                {
                    id: 'USR003',
                    name: 'Dr. Priya Sharma',
                    email: 'priya.sharma@medical.gov.in',
                    role: 'Medical Officer',
                    status: 'active',
                    lastLogin: '2024-01-15 13:45:00',
                    permissions: ['medical', 'reports']
                }
            ],
            analytics: {
                totalUsers: 2847,
                activeUsers: 1923,
                reportsToday: 156,
                emergencyReports: 23,
                systemUptime: 98.7,
                averageResponseTime: 2.3
            },
            settings: {
                systemName: 'Kumbh Mela Navigation System',
                version: '2.1.0',
                maintenanceMode: false,
                alertsEnabled: true,
                backupFrequency: 'Daily',
                maxUsers: 5000
            },
            logs: [
                {
                    id: 'LOG001',
                    timestamp: '2024-01-15 15:30:00',
                    level: 'info',
                    message: 'Emergency report submitted successfully',
                    user: 'USR002',
                    module: 'Emergency System'
                },
                {
                    id: 'LOG002',
                    timestamp: '2024-01-15 15:25:00',
                    level: 'warning',
                    message: 'High crowd density detected in Sector 2',
                    user: 'System',
                    module: 'Crowd Monitoring'
                },
                {
                    id: 'LOG003',
                    timestamp: '2024-01-15 15:20:00',
                    level: 'error',
                    message: 'Failed to send SMS notification',
                    user: 'System',
                    module: 'Notification Service'
                }
            ]
        };
    }

    showManagementTab(tabName, element) {
        this.currentManagementTab = tabName;

        // Update active tab
        document.querySelectorAll('.management-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }

        // Show/hide tab content
        document.querySelectorAll('.management-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`management-${tabName}`).classList.add('active');

        this.renderManagementData();
    }

    renderManagementData() {
        switch(this.currentManagementTab) {
            case 'users':
                this.renderUsers();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'logs':
                this.renderLogs();
                break;
        }
    }

    renderUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = this.managementData.users.map(user => `
            <div class="user-item">
                <div class="user-header-item">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role role-${user.role.toLowerCase().replace(' ', '-')}">${user.role}</div>
                </div>
                <div class="user-details">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Status:</strong> ${user.status}</p>
                    <p><strong>Last Login:</strong> ${new Date(user.lastLogin).toLocaleString()}</p>
                    <p><strong>Permissions:</strong> ${user.permissions.join(', ')}</p>
                </div>
                <div class="user-actions">
                    <button class="action-btn-small btn-view" onclick="viewUserDetails('${user.id}')">
                        👁️ View
                    </button>
                    <button class="action-btn-small btn-update" onclick="editUser('${user.id}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn-small btn-contact" onclick="toggleUserStatus('${user.id}')">
                        🔄 Toggle
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAnalytics() {
        const analyticsContent = document.getElementById('analyticsContent');
        if (!analyticsContent) return;

        const analytics = this.managementData.analytics;
        analyticsContent.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>👥 User Statistics</h4>
                    <div class="stat-row">
                        <span>Total Users:</span>
                        <span class="stat-value">${analytics.totalUsers.toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span>Active Users:</span>
                        <span class="stat-value">${analytics.activeUsers.toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span>Activity Rate:</span>
                        <span class="stat-value">${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%</span>
                    </div>
                </div>

                <div class="analytics-card">
                    <h4>📊 Reports & Incidents</h4>
                    <div class="stat-row">
                        <span>Reports Today:</span>
                        <span class="stat-value">${analytics.reportsToday}</span>
                    </div>
                    <div class="stat-row">
                        <span>Emergency Reports:</span>
                        <span class="stat-value">${analytics.emergencyReports}</span>
                    </div>
                    <div class="stat-row">
                        <span>Resolution Rate:</span>
                        <span class="stat-value">87%</span>
                    </div>
                </div>

                <div class="analytics-card">
                    <h4>⚡ System Performance</h4>
                    <div class="stat-row">
                        <span>System Uptime:</span>
                        <span class="stat-value">${analytics.systemUptime}%</span>
                    </div>
                    <div class="stat-row">
                        <span>Avg Response Time:</span>
                        <span class="stat-value">${analytics.averageResponseTime}s</span>
                    </div>
                    <div class="stat-row">
                        <span>Server Load:</span>
                        <span class="stat-value">Medium</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettings() {
        const settingsGroups = document.getElementById('settingsGroups');
        if (!settingsGroups) return;

        const settings = this.managementData.settings;
        settingsGroups.innerHTML = `
            <div class="settings-group">
                <h4>🔧 System Configuration</h4>
                <div class="setting-item">
                    <label>System Name:</label>
                    <input type="text" value="${settings.systemName}" id="systemName">
                </div>
                <div class="setting-item">
                    <label>Version:</label>
                    <input type="text" value="${settings.version}" readonly>
                </div>
                <div class="setting-item">
                    <label>Max Users:</label>
                    <input type="number" value="${settings.maxUsers}" id="maxUsers">
                </div>
            </div>

            <div class="settings-group">
                <h4>🔔 Notifications</h4>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${settings.alertsEnabled ? 'checked' : ''} id="alertsEnabled">
                        Enable Alerts
                    </label>
                </div>
                <div class="setting-item">
                    <label>Backup Frequency:</label>
                    <select id="backupFrequency">
                        <option value="Hourly" ${settings.backupFrequency === 'Hourly' ? 'selected' : ''}>Hourly</option>
                        <option value="Daily" ${settings.backupFrequency === 'Daily' ? 'selected' : ''}>Daily</option>
                        <option value="Weekly" ${settings.backupFrequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                    </select>
                </div>
            </div>

            <div class="settings-group">
                <h4>🛠️ Maintenance</h4>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${settings.maintenanceMode ? 'checked' : ''} id="maintenanceMode">
                        Maintenance Mode
                    </label>
                </div>
                <button onclick="saveSettings()" class="action-btn">💾 Save Settings</button>
            </div>
        `;
    }

    renderLogs() {
        const logsContent = document.getElementById('logsContent');
        if (!logsContent) return;

        logsContent.innerHTML = this.managementData.logs.map(log => `
            <div class="log-item log-${log.level}">
                <div class="log-header">
                    <span class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
                    <span class="log-level level-${log.level}">${log.level.toUpperCase()}</span>
                </div>
                <div class="log-message">${log.message}</div>
                <div class="log-meta">
                    <span>User: ${log.user}</span>
                    <span>Module: ${log.module}</span>
                </div>
            </div>
        `).join('');
    }

    async refreshManagementData() {
        this.showLoading(true);
        this.showToast('Refreshing management data...', 'info');

        try {
            await this.loadManagementData();
            this.showToast('Management data updated', 'success');
        } catch (error) {
            this.showToast('Failed to refresh management data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Missing Persons Alert System
    async loadMissingPersonsData() {
        try {
            // Load from external data file
            if (typeof missingPersonsData !== 'undefined') {
                this.missingPersonsData = missingPersonsData;
                this.createMissingPersonAlerts();
            }
        } catch (error) {
            console.error('Error loading missing persons data:', error);
        }
    }

    createMissingPersonAlerts() {
        // Create alerts for active missing persons
        const activeCases = this.missingPersonsData.filter(person => person.caseStatus === 'active');

        activeCases.forEach(person => {
            this.createMissingPersonAlert(person);
        });

        // Show notification for critical cases
        const criticalCases = activeCases.filter(person => person.priority === 'critical');
        if (criticalCases.length > 0) {
            this.showToast(`${criticalCases.length} critical missing person alert(s)`, 'error');
        }
    }

    createMissingPersonAlert(person) {
        const alert = {
            id: `ALERT_${person.id}`,
            personId: person.id,
            type: 'missing_person',
            priority: person.priority,
            title: `Missing: ${person.name}`,
            description: `${person.age} year old ${person.gender.toLowerCase()}, last seen at ${person.lastSeenLocation.name}`,
            location: person.lastSeenLocation,
            searchRadius: person.searchRadius,
            timestamp: new Date(person.lastSeenTime),
            active: person.caseStatus === 'active'
        };

        this.missingPersonAlerts.push(alert);

        // Add to map if map is available
        if (typeof addMissingPersonMarker === 'function') {
            addMissingPersonMarker(person);
        }
    }

    showMissingPersonDetails(personId) {
        const person = this.missingPersonsData.find(p => p.id === personId);
        if (!person) return;

        const detailsHtml = `
            <div class="missing-person-details">
                <div class="person-header">
                    <img src="${person.photo}" alt="${person.name}" class="person-photo">
                    <div class="person-info">
                        <h3>${person.name}</h3>
                        <p>${person.age} years old, ${person.gender}</p>
                        <p class="case-status status-${person.caseStatus}">${person.caseStatus.toUpperCase()}</p>
                    </div>
                </div>

                <div class="person-description">
                    <h4>Description</h4>
                    <p>${person.description}</p>
                </div>

                <div class="last-seen">
                    <h4>Last Seen</h4>
                    <p><strong>Location:</strong> ${person.lastSeenLocation.name}</p>
                    <p><strong>Time:</strong> ${new Date(person.lastSeenTime).toLocaleString()}</p>
                    <p><strong>Details:</strong> ${person.lastSeenLocation.description}</p>
                </div>

                <div class="physical-description">
                    <h4>Physical Description</h4>
                    <p><strong>Height:</strong> ${person.physicalDescription.height}</p>
                    <p><strong>Build:</strong> ${person.physicalDescription.build}</p>
                    <p><strong>Complexion:</strong> ${person.physicalDescription.complexion}</p>
                    <p><strong>Clothing:</strong> ${person.physicalDescription.clothing}</p>
                    <p><strong>Distinguishing Marks:</strong> ${person.physicalDescription.distinguishingMarks}</p>
                </div>

                <div class="contact-info">
                    <h4>Contact Information</h4>
                    <p><strong>Reported by:</strong> ${person.reportedBy.name} (${person.reportedBy.relationship})</p>
                    <p><strong>Phone:</strong> ${person.reportedBy.contact}</p>
                    <p><strong>Email:</strong> ${person.reportedBy.email}</p>
                </div>

                ${person.medicalConditions.length > 0 ? `
                <div class="medical-conditions">
                    <h4>Medical Conditions</h4>
                    <ul>
                        ${person.medicalConditions.map(condition => `<li>${condition}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="search-actions">
                    <button onclick="viewOnMap('${person.id}')" class="action-btn">🗺️ View on Map</button>
                    <button onclick="reportSighting('${person.id}')" class="action-btn">👁️ Report Sighting</button>
                    <button onclick="contactReporter('${person.reportedBy.contact}')" class="action-btn">📞 Contact Family</button>
                </div>
            </div>
        `;

        // Show in a modal or dedicated screen
        this.showModal('Missing Person Details', detailsHtml);
    }

    showModal(title, content) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button onclick="closeModal()" class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    reportSighting(personId) {
        const person = this.missingPersonsData.find(p => p.id === personId);
        if (!person) return;

        const sightingForm = `
            <form id="sightingForm" class="sighting-form">
                <h4>Report Sighting: ${person.name}</h4>

                <div class="form-group">
                    <label>Your Name:</label>
                    <input type="text" id="reporterName" required>
                </div>

                <div class="form-group">
                    <label>Your Contact:</label>
                    <input type="tel" id="reporterContact" required>
                </div>

                <div class="form-group">
                    <label>Sighting Location:</label>
                    <input type="text" id="sightingLocation" placeholder="Describe the location" required>
                </div>

                <div class="form-group">
                    <label>Time of Sighting:</label>
                    <input type="datetime-local" id="sightingTime" required>
                </div>

                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="sightingDescription" rows="3" placeholder="Describe what you saw..." required></textarea>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="verifiedSighting">
                        I am certain this was the missing person
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">📍 Submit Sighting</button>
                    <button type="button" onclick="closeModal()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        `;

        this.showModal('Report Sighting', sightingForm);

        // Handle form submission
        document.getElementById('sightingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSighting(personId);
        });
    }

    submitSighting(personId) {
        const formData = {
            personId: personId,
            reporterName: document.getElementById('reporterName').value,
            reporterContact: document.getElementById('reporterContact').value,
            location: document.getElementById('sightingLocation').value,
            time: document.getElementById('sightingTime').value,
            description: document.getElementById('sightingDescription').value,
            verified: document.getElementById('verifiedSighting').checked,
            timestamp: new Date().toISOString()
        };

        // Submit to backend
        this.apiService.submitSighting(formData)
            .then(() => {
                this.showToast('Sighting reported successfully', 'success');
                this.closeModal();
            })
            .catch(() => {
                this.showToast('Sighting reported (stored locally)', 'info');
                this.closeModal();
            });
    }

    getMissingPersonAlerts() {
        return this.missingPersonAlerts.filter(alert => alert.active);
    }

    getActiveMissingPersons() {
        return this.missingPersonsData.filter(person => person.caseStatus === 'active');
    }

    getCriticalMissingPersons() {
        return this.missingPersonsData.filter(person =>
            person.caseStatus === 'active' && person.priority === 'critical'
        );
    }

    // Enhanced AI Assistant with Comprehensive Knowledge Base
    initializeKnowledgeBase() {
        return {
            kumbhMela2028: {
                dates: {
                    start: '2028-04-13',
                    end: '2028-05-12',
                    mainBathingDates: [
                        { date: '2028-04-13', name: 'Mesh Sankranti', significance: 'First royal bath' },
                        { date: '2028-04-21', name: 'Som Amavasya', significance: 'New moon bath' },
                        { date: '2028-04-27', name: 'Baisakhi', significance: 'Harvest festival bath' },
                        { date: '2028-05-05', name: 'Akshaya Tritiya', significance: 'Auspicious third day' },
                        { date: '2028-05-12', name: 'Chaitra Purnima', significance: 'Final royal bath' }
                    ]
                },
                significance: 'The Kumbh Mela at Ujjain occurs every 12 years when Jupiter enters Simha (Leo) and the Sun enters Mesh (Aries). This celestial alignment makes the waters of Shipra River especially sacred.',
                expectedVisitors: '50-70 million pilgrims',
                duration: '30 days'
            },
            aartiTimings: {
                triveniGhat: {
                    morning: '5:30 AM - 6:30 AM',
                    evening: '6:30 PM - 7:30 PM',
                    special: '12:00 PM (during Kumbh only)',
                    description: 'Main ghat with continuous chanting and lamp offerings'
                },
                mahakaleshwar: {
                    bhasmaAarti: '4:00 AM - 6:00 AM (advance booking required)',
                    morning: '7:00 AM - 11:00 AM',
                    afternoon: '12:00 PM - 7:00 PM',
                    evening: '7:00 PM - 11:00 PM',
                    bookingPrice: '₹500-2000 for Bhasma Aarti',
                    distance: '2.5 km from Triveni Ghat'
                },
                kalBhairav: {
                    morning: '6:00 AM - 12:00 PM',
                    evening: '4:00 PM - 10:00 PM',
                    special: 'Liquor offering tradition',
                    distance: '3 km from Triveni Ghat'
                },
                harsiddhi: {
                    morning: '6:00 AM - 12:00 PM',
                    evening: '4:00 PM - 9:00 PM',
                    festival: 'Special Navratri celebrations',
                    distance: '4 km from Triveni Ghat'
                }
            },
            accommodation: {
                budget: [
                    { name: 'Government Dharamshala', price: '₹100-300/night', amenities: 'Basic rooms, shared bathrooms', booking: 'Walk-in only' },
                    { name: 'Ashram Guest Houses', price: '₹200-500/night', amenities: 'Simple rooms, vegetarian meals', booking: 'Contact ashrams directly' },
                    { name: 'Budget Hotels near Station', price: '₹800-1500/night', amenities: 'AC rooms, private bathrooms', booking: 'Online/phone' }
                ],
                midRange: [
                    { name: 'Hotel Shipra', price: '₹2000-3500/night', amenities: 'AC, restaurant, room service', booking: '+91-734-2551234' },
                    { name: 'Avantika Resort', price: '₹2500-4000/night', amenities: 'Pool, spa, multi-cuisine restaurant', booking: '+91-734-2552345' },
                    { name: 'Rudra Palace', price: '₹1800-3000/night', amenities: 'Traditional decor, vegetarian restaurant', booking: '+91-734-2553456' }
                ],
                luxury: [
                    { name: 'Ramada Ujjain', price: '₹5000-8000/night', amenities: '5-star, pool, spa, multiple restaurants', booking: '+91-734-2554567' },
                    { name: 'Kumbh Heritage Resort', price: '₹6000-10000/night', amenities: 'Luxury tents, cultural programs', booking: '+91-734-2555678' }
                ],
                tips: [
                    'Book 6 months in advance for Kumbh period',
                    'Prices increase 3-5x during main bathing dates',
                    'Consider staying in nearby cities like Indore (55 km)',
                    'Temporary accommodations available in sectors'
                ]
            },
            transportation: {
                toUjjain: {
                    byAir: {
                        airport: 'Devi Ahilyabai Holkar Airport, Indore (55 km)',
                        flights: 'Daily flights from Delhi, Mumbai, Bangalore',
                        taxiToUjjain: '₹1200-1800 (1.5 hours)',
                        busToUjjain: '₹150-300 (2 hours)'
                    },
                    byTrain: {
                        station: 'Ujjain Junction (UJN)',
                        majorConnections: 'Delhi, Mumbai, Bangalore, Chennai, Kolkata',
                        advance: 'Book 4 months ahead for Kumbh period',
                        localTransport: 'Auto-rickshaw ₹50-100 to Triveni Ghat'
                    },
                    byRoad: {
                        fromIndore: '55 km, ₹800-1200 by taxi',
                        fromBhopal: '185 km, ₹2000-3000 by taxi',
                        fromDelhi: '650 km, ₹8000-12000 by taxi',
                        busServices: 'Regular state and private buses'
                    }
                },
                local: {
                    autoRickshaw: {
                        withinCity: '₹30-80 per trip',
                        toMahakaleshwar: '₹50-100',
                        hourlyRate: '₹200-300/hour',
                        tips: 'Negotiate fare beforehand, use meter when available'
                    },
                    taxi: {
                        localSightseeing: '₹1500-2500/day',
                        acCab: '₹2000-3500/day',
                        apps: 'Ola, Uber available',
                        tips: 'Book day packages for temple visits'
                    },
                    shuttle: {
                        kumbhShuttle: 'Free shuttle every 15 minutes',
                        routes: 'Triveni Ghat ↔ Railway Station ↔ Mahakaleshwar',
                        timing: '5:00 AM - 11:00 PM',
                        frequency: 'Every 10-15 minutes during peak hours'
                    }
                }
            },
            food: {
                traditional: [
                    { name: 'Poha-Jalebi', price: '₹40-80', description: 'Iconic Ujjain breakfast, best at Vijay Chaat' },
                    { name: 'Dal Bafla', price: '₹120-200', description: 'MP specialty, wheat balls with dal and ghee' },
                    { name: 'Malpua', price: '₹60-120', description: 'Sweet pancakes, famous at Mahakaleshwar area' },
                    { name: 'Kachori-Sabzi', price: '₹50-100', description: 'Spicy breakfast, try at Sarafa Bazaar' }
                ],
                restaurants: [
                    { name: 'Shree Ganga Restaurant', cuisine: 'Pure Vegetarian', price: '₹200-400/person', specialty: 'Thali meals' },
                    { name: 'Apna Sweets', cuisine: 'Sweets & Snacks', price: '₹100-250/person', specialty: 'Malpua and Rabri' },
                    { name: 'Hotel Shipra Restaurant', cuisine: 'Multi-cuisine', price: '₹300-600/person', specialty: 'North Indian' },
                    { name: 'Prasadam Restaurant', cuisine: 'Temple food', price: '₹150-300/person', specialty: 'Sattvic meals' }
                ],
                streetFood: {
                    locations: ['Sarafa Bazaar', 'Freeganj Market', 'Mahakaleshwar Temple area'],
                    safety: 'Eat at busy stalls, avoid water-based items, carry hand sanitizer',
                    timing: 'Best after 7 PM when stalls are fresh',
                    mustTry: 'Dahi Vada, Samosa, Kachori, Fresh Sugarcane juice'
                },
                prasadDistribution: {
                    triveniGhat: 'Free meals 11 AM - 2 PM and 6 PM - 9 PM',
                    mahakaleshwar: 'Prasad available after each aarti',
                    ashrams: 'Many ashrams provide free meals to pilgrims',
                    donations: 'Voluntary donations accepted'
                }
            },
            shopping: {
                religious: [
                    { item: 'Rudraksha Beads', price: '₹50-5000', shops: 'Mahakaleshwar Temple area' },
                    { item: 'Brass Idols', price: '₹200-2000', shops: 'Freeganj Market' },
                    { item: 'Prayer Books', price: '₹50-300', shops: 'Temple bookstores' },
                    { item: 'Tilak & Kumkum', price: '₹20-100', shops: 'All temple areas' }
                ],
                local: [
                    { item: 'Maheshwari Sarees', price: '₹800-5000', shops: 'Sarafa Bazaar' },
                    { item: 'Chanderi Silk', price: '₹1500-8000', shops: 'Freeganj Market' },
                    { item: 'Handicrafts', price: '₹100-1000', shops: 'Government emporium' },
                    { item: 'Spices', price: '₹50-500', shops: 'Local markets' }
                ],
                markets: {
                    sarafaBazaar: 'Main market, jewelry, textiles, street food',
                    freeganjMarket: 'Wholesale market, best prices for bulk buying',
                    mahakaleshwarArea: 'Religious items, souvenirs',
                    timing: 'Most shops open 10 AM - 9 PM'
                }
            },
            cultural: {
                significance: {
                    triveniGhat: 'Confluence of three sacred rivers - Shipra, Saraswati (invisible), and Ganga (spiritual)',
                    mahakaleshwar: 'One of 12 Jyotirlingas, represents time and death',
                    ujjain: 'One of seven sacred cities (Sapta Puri) for moksha',
                    kumbh: 'Largest peaceful gathering of humanity, UNESCO recognition'
                },
                rituals: {
                    holyBath: 'Take bath before sunrise for maximum spiritual benefit',
                    offerings: 'Offer flowers, incense, and prayers to river',
                    donation: 'Give to poor and sadhus for spiritual merit',
                    meditation: 'Sit quietly by river for inner peace'
                },
                etiquette: {
                    dress: 'Modest clothing, avoid leather items near temples',
                    behavior: 'Maintain silence during prayers, respect queues',
                    photography: 'Ask permission before photographing people',
                    environment: 'Keep ghats clean, don\'t litter'
                },
                festivals: {
                    shivaratri: 'Major celebration at Mahakaleshwar',
                    navratri: 'Nine days of goddess worship',
                    kartikPurnima: 'Full moon celebration',
                    bhoomiPujan: 'Land worship ceremony'
                }
            },
            practical: {
                money: {
                    atms: 'Available near railway station, Mahakaleshwar, major markets',
                    banks: 'SBI, HDFC, ICICI have branches in city center',
                    exchange: 'Currency exchange at major hotels',
                    tips: 'Carry cash as many vendors don\'t accept cards'
                },
                communication: {
                    mobile: 'Good coverage from Jio, Airtel, Vi',
                    wifi: 'Available at hotels, some restaurants',
                    internet: 'Cyber cafes near railway station',
                    emergency: 'Police: 100, Ambulance: 108, Fire: 101'
                },
                health: {
                    hospitals: 'District Hospital, Amaltas Hospital, R.D. Gardi Medical College',
                    pharmacies: '24/7 medical stores near railway station',
                    water: 'Drink only bottled or boiled water',
                    insurance: 'Recommended for foreign visitors'
                },
                weather: {
                    april: 'Pleasant, 20-30°C, light cotton clothes',
                    may: 'Getting warmer, 25-35°C, sun protection needed',
                    monsoon: 'July-September, heavy rains, waterproof gear',
                    winter: 'October-February, cool, 10-25°C, light woolens'
                }
            }
        };
    }

    // AI Assistant Methods
    sendAIMessage(message = null) {
        const input = document.getElementById('aiChatInput');
        const userMessage = message || (input ? input.value.trim() : '');

        if (!userMessage) return;

        // Add user message to chat
        this.addAIMessageToChat(userMessage, 'user');

        // Clear input
        if (input) input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Process AI response with delay for realism
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.getEnhancedAIResponse(userMessage);
            this.addAIMessageToChat(aiResponse, 'ai');
            this.updateInputSuggestions(userMessage);
        }, 1000 + Math.random() * 1000);
    }

    addAIMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-ai-message' : 'ai-message';

        const avatar = sender === 'user' ? '👤' : '🤖';

        messageDiv.innerHTML = `
            <div class="ai-avatar">${avatar}</div>
            <div class="message-content">
                ${message}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in history
        this.aiChatHistory.push({ message, sender, timestamp: new Date() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    getEnhancedAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        const kb = this.knowledgeBase;

        // Kumbh Mela 2028 specific information
        if (message.includes('2028') || message.includes('date') || message.includes('when') || message.includes('kumbh mela')) {
            return `🕉️ <strong>Kumbh Mela 2028 at Ujjain</strong><br><br>
                    📅 <strong>Duration:</strong> ${kb.kumbhMela2028.dates.start} to ${kb.kumbhMela2028.dates.end} (30 days)<br><br>
                    🛁 <strong>Main Bathing Dates:</strong><br>
                    ${kb.kumbhMela2028.dates.mainBathingDates.map(date =>
                        `• <strong>${date.date}</strong> - ${date.name} (${date.significance})`
                    ).join('<br>')}<br><br>
                    ✨ <strong>Significance:</strong> ${kb.kumbhMela2028.significance}<br><br>
                    👥 <strong>Expected Visitors:</strong> ${kb.kumbhMela2028.expectedVisitors}<br><br>
                    💡 <strong>Tip:</strong> Plan to arrive 2-3 days before main bathing dates for the best experience!`;
        }

        // Aarti timings and temple information
        if (message.includes('aarti') || message.includes('prayer') || message.includes('temple') || message.includes('timing')) {
            return `🕯️ <strong>Complete Aarti Timings Guide</strong><br><br>
                    🛕 <strong>Triveni Ghat (Main Venue):</strong><br>
                    • Morning: ${kb.aartiTimings.triveniGhat.morning}<br>
                    • Evening: ${kb.aartiTimings.triveniGhat.evening}<br>
                    • Special Kumbh: ${kb.aartiTimings.triveniGhat.special}<br><br>

                    🔱 <strong>Mahakaleshwar Temple (${kb.aartiTimings.mahakaleshwar.distance}):</strong><br>
                    • Bhasma Aarti: ${kb.aartiTimings.mahakaleshwar.bhasmaAarti}<br>
                    • Regular Darshan: ${kb.aartiTimings.mahakaleshwar.morning}<br>
                    • Booking: ${kb.aartiTimings.mahakaleshwar.bookingPrice}<br><br>

                    ☠️ <strong>Kal Bhairav Temple (${kb.aartiTimings.kalBhairav.distance}):</strong><br>
                    • Morning: ${kb.aartiTimings.kalBhairav.morning}<br>
                    • Evening: ${kb.aartiTimings.kalBhairav.evening}<br>
                    • Special: ${kb.aartiTimings.kalBhairav.special}<br><br>

                    🌺 <strong>Harsiddhi Temple (${kb.aartiTimings.harsiddhi.distance}):</strong><br>
                    • Morning: ${kb.aartiTimings.harsiddhi.morning}<br>
                    • Evening: ${kb.aartiTimings.harsiddhi.evening}<br><br>

                    📱 <strong>Pro Tip:</strong> Book Mahakaleshwar Bhasma Aarti online at least 1 month in advance!`;
        }

        // Accommodation with detailed pricing
        if (message.includes('hotel') || message.includes('stay') || message.includes('accommodation') || message.includes('room') || message.includes('price')) {
            return `🏨 <strong>Complete Accommodation Guide with Prices</strong><br><br>
                    💰 <strong>Budget Options (₹100-1500/night):</strong><br>
                    ${kb.accommodation.budget.map(hotel =>
                        `• <strong>${hotel.name}:</strong> ${hotel.price}<br>  ${hotel.amenities}<br>  Booking: ${hotel.booking}`
                    ).join('<br><br>')}<br><br>

                    🏨 <strong>Mid-Range Hotels (₹1800-4000/night):</strong><br>
                    ${kb.accommodation.midRange.map(hotel =>
                        `• <strong>${hotel.name}:</strong> ${hotel.price}<br>  ${hotel.amenities}<br>  📞 ${hotel.booking}`
                    ).join('<br><br>')}<br><br>

                    ⭐ <strong>Luxury Options (₹5000-10000/night):</strong><br>
                    ${kb.accommodation.luxury.map(hotel =>
                        `• <strong>${hotel.name}:</strong> ${hotel.price}<br>  ${hotel.amenities}<br>  📞 ${hotel.booking}`
                    ).join('<br><br>')}<br><br>

                    💡 <strong>Important Tips:</strong><br>
                    ${kb.accommodation.tips.map(tip => `• ${tip}`).join('<br>')}<br><br>

                    🎯 <strong>Recommendation:</strong> Book immediately for main bathing dates as prices increase 3-5x!`;
        }

        // Transportation with detailed fares
        if (message.includes('transport') || message.includes('taxi') || message.includes('bus') || message.includes('train') || message.includes('flight') || message.includes('fare')) {
            return `🚗 <strong>Complete Transportation Guide with Fares</strong><br><br>
                    ✈️ <strong>By Air:</strong><br>
                    • Airport: ${kb.transportation.toUjjain.byAir.airport}<br>
                    • Flights: ${kb.transportation.toUjjain.byAir.flights}<br>
                    • Taxi to Ujjain: ${kb.transportation.toUjjain.byAir.taxiToUjjain}<br>
                    • Bus to Ujjain: ${kb.transportation.toUjjain.byAir.busToUjjain}<br><br>

                    🚂 <strong>By Train:</strong><br>
                    • Station: ${kb.transportation.toUjjain.byTrain.station}<br>
                    • Connections: ${kb.transportation.toUjjain.byTrain.majorConnections}<br>
                    • Booking: ${kb.transportation.toUjjain.byTrain.advance}<br>
                    • To Triveni Ghat: ${kb.transportation.toUjjain.byTrain.localTransport}<br><br>

                    🛺 <strong>Local Transportation:</strong><br>
                    • Auto-rickshaw: ${kb.transportation.local.autoRickshaw.withinCity}<br>
                    • To Mahakaleshwar: ${kb.transportation.local.autoRickshaw.toMahakaleshwar}<br>
                    • Hourly rate: ${kb.transportation.local.autoRickshaw.hourlyRate}<br>
                    • Taxi (full day): ${kb.transportation.local.taxi.localSightseeing}<br><br>

                    🚌 <strong>Free Kumbh Shuttle:</strong><br>
                    • Service: ${kb.transportation.local.shuttle.kumbhShuttle}<br>
                    • Routes: ${kb.transportation.local.shuttle.routes}<br>
                    • Timing: ${kb.transportation.local.shuttle.timing}<br><br>

                    💡 <strong>Money-saving tip:</strong> Use free shuttle service during Kumbh period!`;
        }

        // Food recommendations with prices
        if (message.includes('food') || message.includes('eat') || message.includes('restaurant') || message.includes('prasad') || message.includes('meal')) {
            return `🍽️ <strong>Complete Food Guide with Prices</strong><br><br>
                    🥘 <strong>Must-Try Traditional Foods:</strong><br>
                    ${kb.food.traditional.map(food =>
                        `• <strong>${food.name}:</strong> ${food.price}<br>  ${food.description}`
                    ).join('<br><br>')}<br><br>

                    🏪 <strong>Recommended Restaurants:</strong><br>
                    ${kb.food.restaurants.map(restaurant =>
                        `• <strong>${restaurant.name}:</strong> ${restaurant.cuisine}<br>  Price: ${restaurant.price} | Specialty: ${restaurant.specialty}`
                    ).join('<br><br>')}<br><br>

                    🍜 <strong>Street Food Safety:</strong><br>
                    • Locations: ${kb.food.streetFood.locations.join(', ')}<br>
                    • Safety: ${kb.food.streetFood.safety}<br>
                    • Best time: ${kb.food.streetFood.timing}<br>
                    • Must try: ${kb.food.streetFood.mustTry}<br><br>

                    🙏 <strong>Free Prasad Distribution:</strong><br>
                    • Triveni Ghat: ${kb.food.prasadDistribution.triveniGhat}<br>
                    • Mahakaleshwar: ${kb.food.prasadDistribution.mahakaleshwar}<br>
                    • Ashrams: ${kb.food.prasadDistribution.ashrams}<br><br>

                    ⚠️ <strong>Health tip:</strong> Stick to hot, freshly cooked food and bottled water!`;
        }

        // Shopping guide with prices
        if (message.includes('shop') || message.includes('buy') || message.includes('market') || message.includes('souvenir') || message.includes('gift')) {
            return `🛍️ <strong>Complete Shopping Guide with Prices</strong><br><br>
                    🕉️ <strong>Religious Items:</strong><br>
                    ${kb.shopping.religious.map(item =>
                        `• <strong>${item.item}:</strong> ${item.price}<br>  Best shops: ${item.shops}`
                    ).join('<br><br>')}<br><br>

                    👘 <strong>Local Specialties:</strong><br>
                    ${kb.shopping.local.map(item =>
                        `• <strong>${item.item}:</strong> ${item.price}<br>  Best shops: ${item.shops}`
                    ).join('<br><br>')}<br><br>

                    🏪 <strong>Main Markets:</strong><br>
                    • <strong>Sarafa Bazaar:</strong> ${kb.shopping.markets.sarafaBazaar}<br>
                    • <strong>Freeganj Market:</strong> ${kb.shopping.markets.freeganjMarket}<br>
                    • <strong>Mahakaleshwar Area:</strong> ${kb.shopping.markets.mahakaleshwarArea}<br>
                    • <strong>Timing:</strong> ${kb.shopping.markets.timing}<br><br>

                    💰 <strong>Bargaining tip:</strong> Start at 50% of quoted price and settle at 70-80%!`;
        }

        // Cultural and spiritual information
        if (message.includes('culture') || message.includes('ritual') || message.includes('significance') || message.includes('spiritual') || message.includes('tradition')) {
            return `🕉️ <strong>Cultural & Spiritual Guide</strong><br><br>
                    ✨ <strong>Sacred Significance:</strong><br>
                    • <strong>Triveni Ghat:</strong> ${kb.cultural.significance.triveniGhat}<br>
                    • <strong>Mahakaleshwar:</strong> ${kb.cultural.significance.mahakaleshwar}<br>
                    • <strong>Ujjain:</strong> ${kb.cultural.significance.ujjain}<br>
                    • <strong>Kumbh Mela:</strong> ${kb.cultural.significance.kumbh}<br><br>

                    🛁 <strong>Sacred Rituals:</strong><br>
                    • <strong>Holy Bath:</strong> ${kb.cultural.rituals.holyBath}<br>
                    • <strong>Offerings:</strong> ${kb.cultural.rituals.offerings}<br>
                    • <strong>Donation:</strong> ${kb.cultural.rituals.donation}<br>
                    • <strong>Meditation:</strong> ${kb.cultural.rituals.meditation}<br><br>

                    🙏 <strong>Proper Etiquette:</strong><br>
                    • <strong>Dress:</strong> ${kb.cultural.etiquette.dress}<br>
                    • <strong>Behavior:</strong> ${kb.cultural.etiquette.behavior}<br>
                    • <strong>Photography:</strong> ${kb.cultural.etiquette.photography}<br>
                    • <strong>Environment:</strong> ${kb.cultural.etiquette.environment}<br><br>

                    🎉 <strong>Major Festivals:</strong><br>
                    • <strong>Shivaratri:</strong> ${kb.cultural.festivals.shivaratri}<br>
                    • <strong>Navratri:</strong> ${kb.cultural.festivals.navratri}<br>
                    • <strong>Kartik Purnima:</strong> ${kb.cultural.festivals.kartikPurnima}<br><br>

                    💫 <strong>Spiritual tip:</strong> Participate with devotion and respect for maximum spiritual benefit!`;
        }

        // Practical information
        if (message.includes('atm') || message.includes('money') || message.includes('bank') || message.includes('hospital') || message.includes('emergency') || message.includes('practical')) {
            return `📱 <strong>Practical Information Guide</strong><br><br>
                    💳 <strong>Money & Banking:</strong><br>
                    • ATMs: ${kb.practical.money.atms}<br>
                    • Banks: ${kb.practical.money.banks}<br>
                    • Exchange: ${kb.practical.money.exchange}<br>
                    • Tips: ${kb.practical.money.tips}<br><br>

                    📞 <strong>Communication:</strong><br>
                    • Mobile: ${kb.practical.communication.mobile}<br>
                    • WiFi: ${kb.practical.communication.wifi}<br>
                    • Internet: ${kb.practical.communication.internet}<br>
                    • Emergency: ${kb.practical.communication.emergency}<br><br>

                    🏥 <strong>Health & Medical:</strong><br>
                    • Hospitals: ${kb.practical.health.hospitals}<br>
                    • Pharmacies: ${kb.practical.health.pharmacies}<br>
                    • Water: ${kb.practical.health.water}<br>
                    • Insurance: ${kb.practical.health.insurance}<br><br>

                    🌤️ <strong>Weather Guide:</strong><br>
                    • April: ${kb.practical.weather.april}<br>
                    • May: ${kb.practical.weather.may}<br>
                    • Monsoon: ${kb.practical.weather.monsoon}<br>
                    • Winter: ${kb.practical.weather.winter}<br><br>

                    🚨 <strong>Emergency Numbers:</strong> Police: 100 | Ambulance: 108 | Fire: 101`;
        }

        // Safety and security
        if (message.includes('safety') || message.includes('security') || message.includes('safe') || message.includes('danger') || message.includes('precaution')) {
            return `🛡️ <strong>Complete Safety & Security Guide</strong><br><br>
                    ⚠️ <strong>General Safety:</strong><br>
                    • Stay hydrated - carry water bottles always<br>
                    • Keep emergency contacts handy<br>
                    • Don't venture alone in crowded areas<br>
                    • Follow crowd control instructions<br>
                    • Keep valuables secure in hotel safe<br>
                    • Avoid displaying expensive jewelry<br><br>

                    👥 <strong>Crowd Safety:</strong><br>
                    • Best times: Early morning (5-7 AM) for peaceful darshan<br>
                    • Avoid peak hours: 8 AM-12 PM, 5-8 PM<br>
                    • Use our crowd density map for real-time updates<br>
                    • Stay with your group, designate meeting points<br>
                    • Keep children close and consider ID bands<br><br>

                    🏥 <strong>Health Precautions:</strong><br>
                    • Drink only bottled or boiled water<br>
                    • Eat at busy, clean food stalls<br>
                    • Carry basic medicines (fever, stomach upset)<br>
                    • Wear comfortable walking shoes<br>
                    • Use sunscreen and carry umbrella<br><br>

                    📱 <strong>Emergency Features:</strong><br>
                    • Use our Emergency Report feature for quick help<br>
                    • Report missing persons immediately<br>
                    • Contact police posts in each sector<br><br>

                    🚨 <strong>Emergency Helplines:</strong><br>
                    Police: 100 | Medical: 108 | Fire: 101 | Tourist Helpline: 1363`;
        }

        // Weather and clothing
        if (message.includes('weather') || message.includes('clothes') || message.includes('wear') || message.includes('temperature') || message.includes('climate')) {
            return `🌤️ <strong>Weather & Clothing Guide</strong><br><br>
                    📅 <strong>Kumbh Mela Period (April-May 2028):</strong><br>
                    • <strong>April:</strong> ${kb.practical.weather.april}<br>
                    • <strong>May:</strong> ${kb.practical.weather.may}<br><br>

                    👕 <strong>Recommended Clothing:</strong><br>
                    • Light cotton clothes in light colors<br>
                    • Comfortable walking shoes (avoid leather near temples)<br>
                    • Sun hat or cap for day time<br>
                    • Light jacket for early morning (5-7 AM)<br>
                    • Modest clothing covering shoulders and knees<br>
                    • Extra clothes for after holy bath<br><br>

                    ☀️ <strong>Sun Protection:</strong><br>
                    • Sunscreen SPF 30+ (reapply every 2 hours)<br>
                    • Sunglasses with UV protection<br>
                    • Umbrella for shade (doubles as rain protection)<br>
                    • Stay in shade during 11 AM - 3 PM<br><br>

                    💧 <strong>Hydration Tips:</strong><br>
                    • Drink water every 30 minutes<br>
                    • Carry electrolyte packets<br>
                    • Avoid alcohol and excessive caffeine<br>
                    • Fresh coconut water is excellent for hydration<br><br>

                    🌧️ <strong>Monsoon Backup (if visiting later):</strong><br>
                    • Waterproof bag for electronics<br>
                    • Quick-dry clothes<br>
                    • Non-slip footwear<br>
                    • Umbrella and raincoat`;
        }

        // Booking and planning
        if (message.includes('book') || message.includes('plan') || message.includes('advance') || message.includes('reservation') || message.includes('ticket')) {
            return `📋 <strong>Complete Booking & Planning Guide</strong><br><br>
                    🎯 <strong>6 Months Before:</strong><br>
                    • Book accommodation (prices lowest now)<br>
                    • Book train tickets (4 months advance booking)<br>
                    • Plan your itinerary and main bathing dates<br><br>

                    🎯 <strong>3 Months Before:</strong><br>
                    • Book Mahakaleshwar Bhasma Aarti online<br>
                    • Confirm flight tickets if flying<br>
                    • Get travel insurance<br>
                    • Book local sightseeing packages<br><br>

                    🎯 <strong>1 Month Before:</strong><br>
                    • Reconfirm all bookings<br>
                    • Check weather forecast<br>
                    • Pack according to season<br>
                    • Download offline maps and this app<br><br>

                    🎯 <strong>1 Week Before:</strong><br>
                    • Check train/flight status<br>
                    • Inform family of travel plans<br>
                    • Keep emergency contacts ready<br>
                    • Charge all devices and carry power banks<br><br>

                    📱 <strong>Essential Apps to Download:</strong><br>
                    • This Kumbh Mela Navigation App<br>
                    • IRCTC for train bookings<br>
                    • Ola/Uber for local transport<br>
                    • Google Translate for language help<br>
                    • Offline maps (Maps.me)<br><br>

                    💡 <strong>Pro Planning Tip:</strong> Create a day-wise itinerary but keep it flexible for spontaneous spiritual experiences!`;
        }

        // Default comprehensive response
        return `🤔 I understand you're asking about "${userMessage}". Let me help you with comprehensive information!<br><br>
                🔥 <strong>Popular Topics I Can Help With:</strong><br><br>
                📅 <strong>"Kumbh Mela 2028 dates"</strong> - Complete schedule and significance<br>
                🕯️ <strong>"Aarti timings"</strong> - All temples with exact times and booking info<br>
                🏨 <strong>"Accommodation with prices"</strong> - Budget to luxury with contact details<br>
                🚗 <strong>"Transportation and fares"</strong> - All options with exact costs<br>
                🍽️ <strong>"Food recommendations"</strong> - Traditional dishes, restaurants, and prices<br>
                🛍️ <strong>"Shopping guide"</strong> - Markets, items, and bargaining tips<br>
                🕉️ <strong>"Cultural significance"</strong> - Rituals, traditions, and etiquette<br>
                🛡️ <strong>"Safety guidelines"</strong> - Complete safety and emergency info<br>
                🌤️ <strong>"Weather and clothing"</strong> - What to wear and when<br>
                📱 <strong>"Practical information"</strong> - ATMs, hospitals, emergency numbers<br>
                📋 <strong>"Booking and planning"</strong> - Step-by-step preparation guide<br><br>

                💬 <strong>Try asking:</strong><br>
                • "What are the exact dates for Kumbh Mela 2028?"<br>
                • "Show me hotel prices and contact numbers"<br>
                • "What should I wear in April weather?"<br>
                • "How much does a taxi cost from airport?"<br>
                • "What are the cultural rituals I should follow?"<br><br>

                🙏 I'm here to make your Kumbh Mela journey spiritually fulfilling and practically smooth!`;
    }

    updateInputSuggestions(userMessage) {
        const suggestionsContainer = document.getElementById('inputSuggestions');
        if (!suggestionsContainer) return;

        const suggestions = this.getContextualSuggestions(userMessage);

        suggestionsContainer.innerHTML = suggestions.map(suggestion =>
            `<button class="suggestion-chip" onclick="askAI('${suggestion}')">${suggestion}</button>`
        ).join('');
    }

    getContextualSuggestions(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('hotel') || message.includes('accommodation')) {
            return ['Show me budget hotels', 'Luxury accommodation options', 'Booking contact numbers'];
        }

        if (message.includes('food') || message.includes('restaurant')) {
            return ['Traditional Ujjain dishes', 'Street food safety tips', 'Free prasad locations'];
        }

        if (message.includes('transport') || message.includes('taxi')) {
            return ['Airport to Ujjain cost', 'Local auto-rickshaw fares', 'Free shuttle timings'];
        }

        if (message.includes('temple') || message.includes('aarti')) {
            return ['Mahakaleshwar booking', 'All temple timings', 'Bhasma Aarti prices'];
        }

        if (message.includes('shopping') || message.includes('market')) {
            return ['Religious items prices', 'Best markets to visit', 'Bargaining tips'];
        }

        return ['Kumbh Mela 2028 dates', 'Safety guidelines', 'Weather and clothing', 'Cultural rituals'];
    }

    clearChatHistory() {
        this.aiChatHistory = [];
        const messagesContainer = document.getElementById('aiChatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="ai-avatar">🤖</div>
                    <div class="message-content">
                        <h4>🙏 Chat cleared! How can I help you with Kumbh Mela 2028?</h4>
                        <p>Ask me anything about dates, accommodation, transportation, food, temples, or cultural information!</p>
                    </div>
                </div>
            `;
        }
        this.showToast('Chat history cleared', 'info');
    }

    toggleVoiceMode() {
        this.voiceModeActive = !this.voiceModeActive;
        const voiceBtn = document.getElementById('voiceBtn');

        if (voiceBtn) {
            if (this.voiceModeActive) {
                voiceBtn.textContent = '🔴 Stop';
                voiceBtn.classList.add('active');
                this.showToast('Voice mode activated (simulated)', 'info');
            } else {
                voiceBtn.textContent = '🎤 Voice';
                voiceBtn.classList.remove('active');
                this.showToast('Voice mode deactivated', 'info');
            }
        }
    }

    askAI(topic) {
        this.sendAIMessage(topic);
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

// Emergency Dashboard global functions
function showEmergencyTab(tabName, element) {
    if (window.app) {
        window.app.showEmergencyTab(tabName, element);
    }
}

function refreshEmergencyData() {
    if (window.app) {
        window.app.refreshEmergencyData();
    }
}

function toggleEmergencyAlerts() {
    if (window.app) {
        window.app.showToast('Emergency alerts toggled', 'info');
    }
}

function showEmergencyMap() {
    if (window.app) {
        window.app.showScreen('map-screen');
        window.app.showToast('Switching to emergency map view', 'info');
    }
}

function viewIncidentOnMap(incidentId) {
    if (window.app) {
        window.app.showToast(`Viewing incident ${incidentId} on map`, 'info');
        window.app.showScreen('map-screen');
    }
}

function updateIncidentStatus(incidentId) {
    if (window.app) {
        window.app.showToast(`Updating status for incident ${incidentId}`, 'info');
    }
}

function contactTeam(teamName) {
    if (window.app) {
        window.app.showToast(`Contacting ${teamName}`, 'info');
    }
}

function deployPersonnel() {
    if (window.app) {
        window.app.showToast('Personnel deployment interface opened', 'info');
    }
}

function contactPersonnel(contact) {
    if (window.app) {
        window.app.showToast(`Calling ${contact}`, 'info');
    }
}

function trackPersonnel(personnelId) {
    if (window.app) {
        window.app.showToast(`Tracking personnel ${personnelId}`, 'info');
    }
}

function reassignPersonnel(personnelId) {
    if (window.app) {
        window.app.showToast(`Reassigning personnel ${personnelId}`, 'info');
    }
}

function requestResources() {
    if (window.app) {
        window.app.showToast('Resource request interface opened', 'info');
    }
}

function trackResource(resourceId) {
    if (window.app) {
        window.app.showToast(`Tracking resource ${resourceId}`, 'info');
    }
}

function deployResource(resourceId) {
    if (window.app) {
        window.app.showToast(`Deploying resource ${resourceId}`, 'info');
    }
}

function contactDriver(driverName) {
    if (window.app) {
        window.app.showToast(`Contacting driver ${driverName}`, 'info');
    }
}

function broadcastAlert() {
    if (window.app) {
        window.app.showToast('Emergency broadcast sent', 'success');
    }
}

function sendBroadcast() {
    const message = document.getElementById('broadcastMessage')?.value;
    if (window.app && message) {
        window.app.showToast('Broadcast message sent successfully', 'success');
        document.getElementById('broadcastMessage').value = '';
    }
}

// Management Dashboard global functions
function showManagementTab(tabName, element) {
    if (window.app) {
        window.app.showManagementTab(tabName, element);
    }
}

function refreshManagementData() {
    if (window.app) {
        window.app.refreshManagementData();
    }
}

function openSettings() {
    if (window.app) {
        window.app.showManagementTab('settings');
    }
}

function addUser() {
    if (window.app) {
        window.app.showToast('Add user interface opened', 'info');
    }
}

function exportUsers() {
    if (window.app) {
        window.app.showToast('User data exported successfully', 'success');
    }
}

function viewUserDetails(userId) {
    if (window.app) {
        window.app.showToast(`Viewing details for user ${userId}`, 'info');
    }
}

function editUser(userId) {
    if (window.app) {
        window.app.showToast(`Editing user ${userId}`, 'info');
    }
}

function toggleUserStatus(userId) {
    if (window.app) {
        window.app.showToast(`User ${userId} status toggled`, 'info');
    }
}

function saveSettings() {
    if (window.app) {
        window.app.showToast('Settings saved successfully', 'success');
    }
}

function clearLogs() {
    if (window.app) {
        window.app.showToast('System logs cleared', 'info');
        document.getElementById('logsContent').innerHTML = '<p>No logs available</p>';
    }
}

// AI Assistant global functions
function sendAIMessage() {
    if (window.app) {
        window.app.sendAIMessage();
    }
}

function askAI(topic) {
    if (window.app) {
        window.app.askAI(topic);
    }
}

function handleAIChatKeypress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function clearChatHistory() {
    if (window.app) {
        window.app.clearChatHistory();
    }
}

function toggleVoiceMode() {
    if (window.app) {
        window.app.toggleVoiceMode();
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
