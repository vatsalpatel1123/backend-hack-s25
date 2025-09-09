// Main App Controller for Kumbh Mela Mobile Application
class KumbhMelaApp {
    constructor() {
        this.currentScreen = 'dashboard-screen';
        this.userLocation = null;
        this.nearbyPlaces = [];
        this.currentCategory = 'all';
        this.heatMapLayer = null;
        this.isHeatMapVisible = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLocationPermission();
        this.loadNearbyPlaces();
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
        
        // Add marker for the place and start navigation
        setTimeout(() => {
            if (window.navigateToCoordinates) {
                window.navigateToCoordinates(parseFloat(lat), parseFloat(lng), name);
            }
        }, 500);
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
