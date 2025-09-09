// Initialize map with OpenStreetMap - Triveni Ghat, Ujjain
const TRIVENI_GHAT_COORDS = [23.1287723, 75.7933631];
const map = L.map('map').setView(TRIVENI_GHAT_COORDS, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Define sectors around Triveni Ghat, Ujjain
const sectors = {
  sector1: {
    name: 'North Sector - Main Entrance',
    coords: [23.1295, 75.7930],
    facilities: ['Police Station', 'Medical Post', 'Lost & Found'],
    description: 'Main entrance area with security and medical facilities',
    color: '#FF6B6B'
  },
  sector2: {
    name: 'East Sector - Bathing Ghats',
    coords: [23.1290, 75.7940],
    facilities: ['Sanitation', 'Food Distribution', 'Temporary Shelters'],
    description: 'Primary bathing area with essential amenities',
    color: '#4ECDC4'
  },
  sector3: {
    name: 'South Sector - Parking & Transport',
    coords: [23.1280, 75.7935],
    facilities: ['Fire Station', 'Medical Post', 'Food Distribution'],
    description: 'Vehicle parking and transportation hub',
    color: '#45B7D1'
  },
  sector4: {
    name: 'West Sector - Accommodation',
    coords: [23.1285, 75.7925],
    facilities: ['Temporary Shelters', 'Sanitation', 'Lost & Found'],
    description: 'Temporary accommodation and rest areas',
    color: '#96CEB4'
  },
  sector5: {
    name: 'Northeast Sector - Commercial',
    coords: [23.1295, 75.7940],
    facilities: ['Food Distribution', 'Medical Post', 'Police Station'],
    description: 'Commercial activities and vendor areas',
    color: '#FFEAA7'
  },
  sector6: {
    name: 'Southwest Sector - Services',
    coords: [23.1275, 75.7925],
    facilities: ['Fire Station', 'Sanitation', 'Lost & Found'],
    description: 'Emergency services and support facilities',
    color: '#DDA0DD'
  },
  triveniGhat: {
    name: 'Triveni Ghat - Sacred Confluence',
    coords: TRIVENI_GHAT_COORDS,
    facilities: ['Main Bathing Area', 'Religious Activities', 'Crowd Management'],
    description: 'Sacred confluence point - main destination',
    color: '#FFD700'
  }
};

// Infrastructure icons for Kumbh Mela facilities
const facilityIcons = {
  'Police Station': '🚔',
  'Medical Post': '🏥',
  'Fire Station': '🚒',
  'Lost & Found': '🔍',
  'Sanitation': '🚻',
  'Food Distribution': '🍽️',
  'Temporary Shelters': '🏕️',
  'Main Bathing Area': '🕉️',
  'Religious Activities': '🙏',
  'Crowd Management': '👥'
};

// Create custom icons for different sector types
function createSectorIcon(color, isMainGhat = false) {
  return L.divIcon({
    className: 'sector-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: ${isMainGhat ? '16px' : '12px'};">${isMainGhat ? '🕉️' : '📍'}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

// Add sector markers with enhanced popups
const sectorMarkers = {};
for (const sectorId in sectors) {
  const sector = sectors[sectorId];
  const isMainGhat = sectorId === 'triveniGhat';

  const marker = L.marker(sector.coords, {
    icon: createSectorIcon(sector.color, isMainGhat)
  }).addTo(map);

  // Create detailed popup content
  const facilitiesHtml = sector.facilities.map(facility =>
    `<div style="margin: 2px 0;"><span style="margin-right: 5px;">${facilityIcons[facility] || '📍'}</span>${facility}</div>`
  ).join('');

  const popupContent = `
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 10px 0; color: ${sector.color};">${sector.name}</h3>
      <p style="margin: 5px 0; font-style: italic;">${sector.description}</p>
      <div style="margin-top: 10px;">
        <strong>Available Facilities:</strong>
        ${facilitiesHtml}
      </div>
      ${!isMainGhat ? `<button onclick="navigateToSector('${sectorId}')" style="margin-top: 10px; padding: 5px 10px; background: ${sector.color}; color: white; border: none; border-radius: 3px; cursor: pointer;">Navigate Here</button>` : ''}
    </div>
  `;

  marker.bindPopup(popupContent);
  sectorMarkers[sectorId] = marker;

  // Enhanced hover and click effects
  marker.on('mouseover', function() {
    this.openPopup();
    // Add visual feedback
    if (this.getIcon().options.html) {
      const iconHtml = this.getIcon().options.html;
      const newHtml = iconHtml.replace('box-shadow: 0 2px 6px rgba(0,0,0,0.3)', 'box-shadow: 0 4px 12px rgba(0,0,0,0.5); transform: scale(1.1)');
      this.setIcon(L.divIcon({
        ...this.getIcon().options,
        html: newHtml
      }));
    }
  });

  marker.on('mouseout', function() {
    // Reset visual feedback
    if (this.getIcon().options.html) {
      const iconHtml = this.getIcon().options.html;
      const newHtml = iconHtml.replace('box-shadow: 0 4px 12px rgba(0,0,0,0.5); transform: scale(1.1)', 'box-shadow: 0 2px 6px rgba(0,0,0,0.3)');
      this.setIcon(L.divIcon({
        ...this.getIcon().options,
        html: newHtml
      }));
    }
  });

  marker.on('click', function() {
    if (!isMainGhat) {
      // Calculate distance and time to this sector
      if (userLocation) {
        const distance = calculateDistance(userLocation, sector.coords);
        const timeToSector = Math.round(distance * 12); // Rough estimate: 5 km/h walking speed
        const timeToGhat = calculateTimeToGhat(sector.coords);

        const enhancedPopup = `
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: ${sector.color};">${sector.name}</h3>
            <p style="margin: 5px 0; font-style: italic;">${sector.description}</p>

            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong>📍 Distance from you:</strong> ${distance.toFixed(2)} km<br>
              <strong>⏱️ Walking time:</strong> ~${timeToSector} minutes<br>
              <strong>🕉️ Time to Triveni Ghat:</strong> ~${timeToGhat} minutes
            </div>

            <div style="margin-top: 10px;">
              <strong>Available Facilities:</strong>
              ${facilitiesHtml}
            </div>

            <div style="margin-top: 15px;">
              <button onclick="navigateToSector('${sectorId}')" style="padding: 8px 15px; background: ${sector.color}; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">🧭 Navigate Here</button>
              <button onclick="showNearbyFacilities('${sectorId}')" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">🏢 Nearby Facilities</button>
            </div>
          </div>
        `;

        this.setPopupContent(enhancedPopup);
        this.openPopup();
      }
    }
  });
}

let userMarker = null;
let currentRoute = null;
let userLocation = null;
let heatMapLayer = null;
let isHeatMapVisible = false;
let crowdData = [];
let nearbyMarkersLayer = null;
let areNearbyMarkersVisible = false;

// Dashboard functionality
function toggleDashboard() {
  const dashboard = document.getElementById('dashboard');
  const toggle = document.getElementById('dashboardToggle');

  dashboard.classList.toggle('expanded');
  toggle.textContent = dashboard.classList.contains('expanded') ? '▲' : '▼';
}

function showForm(formType, element) {
  // Hide all forms
  document.querySelectorAll('.form-content').forEach(form => {
    form.classList.remove('active');
  });

  // Remove active class from all tabs
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected form and activate tab
  document.getElementById(`${formType}-form`).classList.add('active');
  if (element) {
    element.classList.add('active');
  }
}

// Form submission functions
function submitEmergencyReport() {
  const formData = {
    type: 'emergency',
    image: document.getElementById('emergency-image').files[0],
    reason: document.getElementById('emergency-reason').value,
    remarks: document.getElementById('emergency-remarks').value,
    assignTo: document.getElementById('emergency-assign').value,
    location: userLocation,
    timestamp: new Date().toISOString()
  };

  console.log('Emergency Report Submitted:', formData);
  alert('Emergency report submitted successfully! Authorities have been notified.');
  clearForm('emergency');
}

function submitMissingReport() {
  const formData = {
    type: 'missing',
    name: document.getElementById('missing-name').value,
    image: document.getElementById('missing-image').files[0],
    lastSeenLocation: document.getElementById('missing-location').value,
    remarks: document.getElementById('missing-remarks').value,
    contact: document.getElementById('missing-contact').value,
    reportLocation: userLocation,
    timestamp: new Date().toISOString()
  };

  console.log('Missing Report Submitted:', formData);
  alert('Missing person/item report submitted successfully! We will help spread the word.');
  clearForm('missing');
}

function submitFoundReport() {
  const formData = {
    type: 'found',
    area: document.getElementById('found-area').value,
    itemName: document.getElementById('found-item').value,
    description: document.getElementById('found-description').value,
    contact: document.getElementById('found-contact').value,
    location: userLocation,
    timestamp: new Date().toISOString()
  };

  console.log('Found Item Report Submitted:', formData);
  alert('Found item report submitted successfully! The owner will be notified.');
  clearForm('found');
}

function clearForm(formType) {
  const form = document.getElementById(`${formType}-form`);
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.type === 'file') {
      input.value = '';
    } else {
      input.value = '';
    }
  });
}

// Navigation function for sector buttons
function navigateToSector(sectorId) {
  document.getElementById('toSector').value = sectorId;
  document.getElementById('navigateBtn').click();
}

// Utility functions for distance and time calculations
function calculateDistance(point1, point2) {
  const lat1 = point1.lat || point1[0];
  const lng1 = point1.lng || point1[1];
  const lat2 = point2[0];
  const lng2 = point2[1];

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateTimeToGhat(sectorCoords) {
  const distance = calculateDistance(sectorCoords, TRIVENI_GHAT_COORDS);
  return Math.round(distance * 12); // 5 km/h walking speed
}

function showNearbyFacilities(sectorId) {
  const sector = sectors[sectorId];
  if (!sector) return;

  // Create a detailed facilities popup
  const facilitiesInfo = sector.facilities.map(facility => {
    const icon = facilityIcons[facility] || '📍';
    const description = getFacilityDescription(facility);
    return `
      <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${sector.color};">
        <strong>${icon} ${facility}</strong>
        <div style="font-size: 12px; color: #666; margin-top: 3px;">${description}</div>
      </div>
    `;
  }).join('');

  const popup = L.popup({
    maxWidth: 300,
    className: 'facilities-popup'
  })
  .setLatLng(sector.coords)
  .setContent(`
    <div>
      <h4 style="margin: 0 0 15px 0; color: ${sector.color};">🏢 Facilities in ${sector.name}</h4>
      ${facilitiesInfo}
      <div style="margin-top: 15px; text-align: center;">
        <button onclick="map.closePopup()" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    </div>
  `)
  .openOn(map);
}

function getFacilityDescription(facility) {
  const descriptions = {
    'Police Station': 'Security, crowd control, emergency response',
    'Medical Post': 'First aid, basic medical care, emergency treatment',
    'Fire Station': 'Fire safety, emergency rescue services',
    'Lost & Found': 'Report and claim lost items and missing persons',
    'Sanitation': 'Clean restrooms, washing facilities',
    'Food Distribution': 'Free meals, drinking water, snacks',
    'Temporary Shelters': 'Rest areas, temporary accommodation',
    'Main Bathing Area': 'Sacred bathing, religious ceremonies',
    'Religious Activities': 'Prayers, rituals, spiritual guidance',
    'Crowd Management': 'Queue management, safety coordination'
  };

  return descriptions[facility] || 'General services available';
}

// Enhanced user tracking with better accuracy and error handling
function trackUser() {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.watchPosition(position => {
      const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      if (!userMarker) {
        // Create custom user marker
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(map);
        userMarker.bindPopup('📍 Your Current Location');

        // Only center on first location
        map.setView(userLatLng, 16);
      } else {
        userMarker.setLatLng(userLatLng);
      }

      // Update accuracy circle
      updateAccuracyCircle(userLatLng, position.coords.accuracy);

    }, error => {
      console.error('Geolocation error:', error);
      handleLocationError(error);
    }, options);

    // Show loading state
    if (window.app) {
      window.app.showLoading(true);
      window.app.showToast('Getting your location...', 'info');
    }
  } else {
    const message = "Geolocation is not supported by this browser.";
    if (window.app) {
      window.app.showToast(message, 'error');
    } else {
      alert(message);
    }
  }
}

function handleLocationError(error) {
  // Hide loading
  if (window.app) {
    window.app.showLoading(false);
  }

  let errorMessage = "Unable to get your location. ";
  switch(error.code) {
    case error.PERMISSION_DENIED:
      errorMessage += "Please enable location permissions in your browser settings.";
      break;
    case error.POSITION_UNAVAILABLE:
      errorMessage += "Location information is unavailable. Please try again.";
      break;
    case error.TIMEOUT:
      errorMessage += "Location request timed out. Please try again.";
      break;
    default:
      errorMessage += "An unknown error occurred.";
      break;
  }

  if (window.app) {
    window.app.showToast(errorMessage, 'error');
  } else {
    alert(errorMessage);
  }
}

let accuracyCircle = null;

function updateAccuracyCircle(center, accuracy) {
  if (accuracyCircle) {
    map.removeLayer(accuracyCircle);
  }

  if (accuracy < 100) { // Only show circle if accuracy is reasonable
    accuracyCircle = L.circle(center, {
      radius: accuracy,
      color: '#4285F4',
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      weight: 1
    }).addTo(map);
  }
}

function handleLocationError(error) {
  let message = 'Unable to get your location. ';
  switch(error.code) {
    case error.PERMISSION_DENIED:
      message += 'Please allow location access to use navigation features.';
      break;
    case error.POSITION_UNAVAILABLE:
      message += 'Location information is unavailable.';
      break;
    case error.TIMEOUT:
      message += 'Location request timed out.';
      break;
    default:
      message += 'An unknown error occurred.';
      break;
  }
  console.warn(message);
}

// Manual location finder
function findUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
      map.setView(userLatLng, 16);

      if (userMarker) {
        userMarker.setLatLng(userLatLng);
      }
    }, handleLocationError, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  }
}

// Enhanced navigation with detailed route information and crowd awareness
function startNavigation() {
  const sectorId = document.getElementById('toSector').value;
  const destination = sectors[sectorId];

  if (!destination) {
    if (window.app) {
      window.app.showToast("Please select a valid destination.", 'warning');
    }
    return;
  }

  if (!userMarker || !userLocation) {
    if (window.app) {
      window.app.showToast("Please wait for your location to be detected, or click 'Find My Location'.", 'warning');
    }
    return;
  }

  // Check crowd density before navigation
  const hasCrowdWarning = checkCrowdDensityForRoute(destination);

  if (hasCrowdWarning) {
    // Warning will be shown by checkCrowdDensityForRoute function
    return;
  }

  // Remove previous route if exists
  if (currentRoute) {
    map.removeControl(currentRoute);
  }

  // Show route info panel
  const routeInfo = document.getElementById('routeInfo');
  if (routeInfo) {
    routeInfo.classList.add('visible');
  }

  // Show loading state
  if (window.app) {
    window.app.showLoading(true);
  }

  // Calculate route using Leaflet Routing Machine with OSM
  currentRoute = L.Routing.control({
    waypoints: [
      L.latLng(userMarker.getLatLng()),
      L.latLng(destination.coords)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    createMarker: function() { return null; }, // Don't create default markers
    lineOptions: {
      styles: [{ color: '#FF6B35', weight: 6, opacity: 0.8 }]
    },
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot' // Walking directions
    })
  }).addTo(map);

  currentRoute.on('routesfound', function(event) {
    const route = event.routes[0];
    displayRouteInformation(route, destination);

    if (window.app) {
      window.app.showLoading(false);
      window.app.showToast(`Route calculated to ${destination.name}`, 'success');
    }
  });

  currentRoute.on('routingerror', function(e) {
    console.error('Routing error:', e);
    if (window.app) {
      window.app.showLoading(false);
      window.app.showToast('Unable to calculate route. Please try again.', 'error');
    }
  });
}

function displayRouteInformation(route, destination) {
  const distance = (route.summary.totalDistance / 1000).toFixed(2); // Convert to km
  const time = Math.round(route.summary.totalTime / 60); // Convert to minutes
  const crowdDensity = getCrowdDensity(destination.name);

  // Calculate estimated arrival time
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + (time * 60000));
  const arrivalTimeStr = arrivalTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Get weather-based walking conditions
  const walkingConditions = getWalkingConditions();

  const routeDetails = document.getElementById('routeDetails');
  if (routeDetails) {
    routeDetails.innerHTML = `
      <div class="route-header">
        <h4 style="margin: 0 0 15px 0; color: #FF6B35;">🎯 ${destination.name}</h4>
      </div>

      <div class="route-stats">
        <div class="stat-item">
          <span class="stat-icon">📏</span>
          <div class="stat-info">
            <strong>${distance} km</strong>
            <small>Distance</small>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏱️</span>
          <div class="stat-info">
            <strong>${time} min</strong>
            <small>Walking time</small>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🕐</span>
          <div class="stat-info">
            <strong>${arrivalTimeStr}</strong>
            <small>Arrival time</small>
          </div>
        </div>
      </div>

      <div class="route-conditions">
        <div class="condition-item">
          <strong>👥 Crowd Level:</strong>
          <span style="color: ${crowdDensity.color}; font-weight: bold;">${crowdDensity.level}</span>
        </div>
        <div class="condition-item">
          <strong>🌤️ Conditions:</strong>
          <span style="color: ${walkingConditions.color};">${walkingConditions.description}</span>
        </div>
      </div>

      <div class="route-instructions">
        <strong>🧭 Turn-by-turn Directions:</strong>
        <div class="instructions-list">
          ${getEnhancedRouteInstructions(route)}
        </div>
      </div>

      <div class="route-actions">
        <button onclick="shareRoute('${destination.name}', '${distance}', '${time}')" class="action-btn share-btn">📤 Share Route</button>
        <button onclick="clearRoute()" class="action-btn clear-btn">❌ Clear Route</button>
      </div>
    `;
  }
}

function getCrowdDensity(sectorName) {
  // Simulate crowd density based on sector type
  const densities = {
    'Triveni Ghat - Sacred Confluence': { level: 'Very High', color: '#dc3545' },
    'East Sector - Bathing Ghats': { level: 'High', color: '#fd7e14' },
    'North Sector - Main Entrance': { level: 'High', color: '#fd7e14' },
    'Northeast Sector - Commercial': { level: 'Medium', color: '#ffc107' },
    'South Sector - Parking & Transport': { level: 'Medium', color: '#ffc107' },
    'West Sector - Accommodation': { level: 'Low', color: '#28a745' },
    'Southwest Sector - Services': { level: 'Low', color: '#28a745' }
  };

  return densities[sectorName] || { level: 'Unknown', color: '#6c757d' };
}

function getEnhancedRouteInstructions(route) {
  if (!route.instructions || route.instructions.length === 0) {
    return `
      <div class="instruction-item">
        <span class="instruction-icon">🚶</span>
        <div class="instruction-text">
          <strong>Follow the highlighted route on the map</strong>
          <small>Stay on the marked path for the safest route</small>
        </div>
      </div>
    `;
  }

  return route.instructions.map((instruction, index) => {
    const direction = instruction.text || instruction.instruction || 'Continue';
    const distance = instruction.distance ? `${(instruction.distance / 1000).toFixed(1)} km` : '';
    const icon = getInstructionIcon(direction);

    return `
      <div class="instruction-item">
        <span class="instruction-icon">${icon}</span>
        <div class="instruction-text">
          <strong>${direction}</strong>
          ${distance ? `<small>${distance}</small>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function getInstructionIcon(instruction) {
  const text = instruction.toLowerCase();
  if (text.includes('left')) return '↰';
  if (text.includes('right')) return '↱';
  if (text.includes('straight') || text.includes('continue')) return '↑';
  if (text.includes('arrive') || text.includes('destination')) return '🎯';
  if (text.includes('start')) return '🚶';
  return '➡️';
}

function getWalkingConditions() {
  // Simulate walking conditions based on time of day and crowd
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 8) {
    return { description: 'Good - Morning hours, less crowded', color: '#28a745' };
  } else if (hour >= 9 && hour <= 11) {
    return { description: 'Moderate - Peak bathing time', color: '#ffc107' };
  } else if (hour >= 12 && hour <= 16) {
    return { description: 'Hot - Afternoon sun, stay hydrated', color: '#fd7e14' };
  } else if (hour >= 17 && hour <= 20) {
    return { description: 'Good - Evening hours, pleasant', color: '#28a745' };
  } else {
    return { description: 'Excellent - Night hours, cool', color: '#17a2b8' };
  }
}

function shareRoute(destinationName, distance, time) {
  if (navigator.share) {
    navigator.share({
      title: `Route to ${destinationName}`,
      text: `I'm heading to ${destinationName} at Kumbh Mela. Distance: ${distance} km, Time: ${time} minutes.`,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback for browsers that don't support Web Share API
    const shareText = `I'm heading to ${destinationName} at Kumbh Mela. Distance: ${distance} km, Time: ${time} minutes. ${window.location.href}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        if (window.app) {
          window.app.showToast('Route details copied to clipboard!', 'success');
        }
      });
    } else {
      // Final fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      if (window.app) {
        window.app.showToast('Route details copied to clipboard!', 'success');
      }
    }
  }
}

function clearRoute() {
  if (currentRoute) {
    map.removeControl(currentRoute);
    currentRoute = null;
  }

  const routeInfo = document.getElementById('routeInfo');
  routeInfo.classList.remove('visible');
}

// Heat Map Implementation
async function loadCrowdData() {
  try {
    const response = await apiService.getCrowdDensity();
    if (response.success) {
      crowdData = response.data;
    } else {
      // Fallback to simulated crowd data
      generateSimulatedCrowdData();
    }
  } catch (error) {
    console.error('Error loading crowd data:', error);
    generateSimulatedCrowdData();
  }
}

function generateSimulatedCrowdData() {
  // Generate simulated crowd density data for demonstration
  crowdData = [
    // High density at main ghat
    { lat: 23.1287723, lng: 75.7933631, intensity: 0.9 },
    { lat: 23.1288, lng: 75.7934, intensity: 0.8 },
    { lat: 23.1287, lng: 75.7933, intensity: 0.85 },

    // Medium density at bathing areas
    { lat: 23.1290, lng: 75.7940, intensity: 0.6 },
    { lat: 23.1289, lng: 75.7939, intensity: 0.55 },

    // Lower density at parking areas
    { lat: 23.1280, lng: 75.7935, intensity: 0.3 },
    { lat: 23.1285, lng: 75.7925, intensity: 0.25 },

    // Variable density at other sectors
    { lat: 23.1295, lng: 75.7930, intensity: 0.4 },
    { lat: 23.1295, lng: 75.7940, intensity: 0.5 },
    { lat: 23.1275, lng: 75.7925, intensity: 0.2 }
  ];
}

function createHeatMap() {
  if (!crowdData.length) return null;

  const heatData = crowdData.map(point => [point.lat, point.lng, point.intensity]);

  return L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 18,
    gradient: {
      0.0: 'green',
      0.3: 'yellow',
      0.6: 'orange',
      0.8: 'red',
      1.0: 'darkred'
    }
  });
}

function toggleHeatMap() {
  const toggleBtn = document.getElementById('heatToggle');

  if (!isHeatMapVisible) {
    if (!heatMapLayer) {
      heatMapLayer = createHeatMap();
    }

    if (heatMapLayer) {
      map.addLayer(heatMapLayer);
      isHeatMapVisible = true;
      if (toggleBtn) toggleBtn.textContent = '❄️ Hide Heat';

      // Show heat map legend
      showHeatMapLegend();
    }
  } else {
    if (heatMapLayer) {
      map.removeLayer(heatMapLayer);
      isHeatMapVisible = false;
      if (toggleBtn) toggleBtn.textContent = '🔥 Heat Map';

      // Hide heat map legend
      hideHeatMapLegend();
    }
  }
}

function showHeatMapLegend() {
  let legend = document.getElementById('heatMapLegend');
  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'heatMapLegend';
    legend.className = 'heat-map-legend';
    legend.innerHTML = `
      <h4>Crowd Density</h4>
      <div class="legend-item"><span class="legend-color" style="background: green;"></span> Low</div>
      <div class="legend-item"><span class="legend-color" style="background: yellow;"></span> Medium</div>
      <div class="legend-item"><span class="legend-color" style="background: orange;"></span> High</div>
      <div class="legend-item"><span class="legend-color" style="background: red;"></span> Very High</div>
      <div class="legend-item"><span class="legend-color" style="background: darkred;"></span> Critical</div>
    `;
    document.body.appendChild(legend);
  }
  legend.style.display = 'block';
}

function hideHeatMapLegend() {
  const legend = document.getElementById('heatMapLegend');
  if (legend) {
    legend.style.display = 'none';
  }
}

// Enhanced navigation with crowd awareness
function checkCrowdDensityForRoute(destination) {
  const destCoords = destination.coords;
  const nearbyDensity = crowdData.filter(point => {
    const distance = calculateDistance(destCoords, [point.lat, point.lng]);
    return distance < 0.1; // Within 100 meters
  });

  const avgDensity = nearbyDensity.length > 0
    ? nearbyDensity.reduce((sum, point) => sum + point.intensity, 0) / nearbyDensity.length
    : 0;

  if (avgDensity > 0.7) {
    showCrowdWarning(destination.name, avgDensity);
    return true;
  }

  return false;
}

function showCrowdWarning(destinationName, density) {
  const warningLevel = density > 0.8 ? 'Critical' : 'High';
  const color = density > 0.8 ? '#dc3545' : '#fd7e14';

  const warning = document.createElement('div');
  warning.className = 'crowd-warning';
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 300px;
    text-align: center;
    border-left: 5px solid ${color};
  `;

  warning.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: ${color};">⚠️ Crowd Alert</h3>
    <p><strong>${destinationName}</strong> has <span style="color: ${color};">${warningLevel}</span> crowd density.</p>
    <p>Consider visiting alternative locations or wait for less crowded times.</p>
    <div style="margin-top: 15px;">
      <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; margin-right: 10px;">Continue Anyway</button>
      <button onclick="showAlternatives('${destinationName}'); this.parentElement.parentElement.remove();" style="padding: 8px 16px; background: ${color}; color: white; border: none; border-radius: 6px;">Show Alternatives</button>
    </div>
  `;

  document.body.appendChild(warning);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (warning.parentElement) {
      warning.remove();
    }
  }, 10000);
}

function showAlternatives(originalDestination) {
  const alternatives = Object.values(sectors).filter(sector =>
    sector.name !== originalDestination &&
    !checkCrowdDensityForRoute(sector)
  ).slice(0, 3);

  if (alternatives.length === 0) {
    if (window.app) {
      window.app.showToast('No less crowded alternatives available at the moment.', 'warning');
    }
    return;
  }

  const altDiv = document.createElement('div');
  altDiv.className = 'alternatives-popup';
  altDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 350px;
  `;

  altDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #28a745;">🌟 Alternative Destinations</h3>
    ${alternatives.map(alt => `
      <div style="padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 8px; cursor: pointer;" onclick="navigateToSector('${Object.keys(sectors).find(key => sectors[key] === alt)}'); this.parentElement.remove();">
        <strong>${alt.name}</strong>
        <div style="font-size: 12px; color: #666;">${alt.description}</div>
      </div>
    `).join('')}
    <button onclick="this.parentElement.remove()" style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; margin-top: 10px;">Close</button>
  `;

  document.body.appendChild(altDiv);
}

// Global function for navigation to coordinates
function navigateToCoordinates(lat, lng, name) {
  if (userMarker) {
    // Remove previous route if exists
    if (currentRoute) {
      map.removeControl(currentRoute);
    }

    // Create temporary destination marker
    const destMarker = L.marker([lat, lng]).addTo(map);
    destMarker.bindPopup(name).openPopup();

    // Calculate route
    currentRoute = L.Routing.control({
      waypoints: [
        L.latLng(userMarker.getLatLng()),
        L.latLng(lat, lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: function() { return null; },
      lineOptions: {
        styles: [{ color: '#FF6B35', weight: 6, opacity: 0.8 }]
      }
    }).addTo(map);

    currentRoute.on('routesfound', function(event) {
      const route = event.routes[0];
      const distance = (route.summary.totalDistance / 1000).toFixed(2);
      const time = Math.round(route.summary.totalTime / 60);

      if (window.app) {
        window.app.showToast(`Route to ${name}: ${distance} km, ~${time} minutes`, 'success');
      }
    });
  } else {
    if (window.app) {
      window.app.showToast('Please wait for your location to be detected.', 'warning');
    }
  }
}

// Event listeners
document.getElementById('navigateBtn')?.addEventListener('click', startNavigation);
document.getElementById('findLocationBtn')?.addEventListener('click', findUserLocation);

// Nearby Places Markers Management
function createNearbyMarkersLayer() {
  if (nearbyMarkersLayer) {
    map.removeLayer(nearbyMarkersLayer);
  }

  nearbyMarkersLayer = L.layerGroup();

  // Get nearby places data
  let places = [];
  if (typeof getPlacesByCategory !== 'undefined') {
    places = getPlacesByCategory('all');
  } else if (window.app && window.app.nearbyPlaces) {
    places = window.app.nearbyPlaces;
  }

  places.forEach(place => {
    const icon = createNearbyPlaceIcon(place.icon || '📍', place.type);
    const marker = L.marker([place.lat, place.lng], { icon }).addTo(nearbyMarkersLayer);

    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #FF6B35;">${place.icon || '📍'} ${place.name}</h4>
        <p style="margin: 4px 0; color: #666;">${place.description}</p>
        ${place.rating ? `<div style="margin: 4px 0;">Rating: ${'⭐'.repeat(Math.floor(place.rating))}</div>` : ''}
        ${place.openHours ? `<div style="margin: 4px 0; font-size: 12px;">🕒 ${place.openHours}</div>` : ''}
        ${place.facilities ? `<div style="margin: 4px 0; font-size: 12px;">🏢 ${place.facilities.slice(0, 2).join(', ')}</div>` : ''}
        <button onclick="navigateToCoordinates(${place.lat}, ${place.lng}, '${place.name}')"
                style="width: 100%; padding: 8px; background: #FF6B35; color: white; border: none; border-radius: 4px; margin-top: 8px; cursor: pointer;">
          🧭 Navigate Here
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);
  });

  return nearbyMarkersLayer;
}

function createNearbyPlaceIcon(emoji, type) {
  const colors = {
    'washroom': '#17a2b8',
    'medical': '#dc3545',
    'police_station': '#007bff',
    'food': '#28a745',
    'mandir': '#fd7e14',
    'parking': '#6c757d',
    'rest': '#6f42c1',
    'akhada': '#e83e8c',
    'shopping': '#20c997',
    'atm': '#ffc107'
  };

  const color = colors[type] || '#FF6B35';

  return L.divIcon({
    className: 'nearby-place-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function toggleNearbyMarkers() {
  const toggleBtn = document.getElementById('locationsToggle');

  if (!areNearbyMarkersVisible) {
    if (!nearbyMarkersLayer) {
      nearbyMarkersLayer = createNearbyMarkersLayer();
    }

    map.addLayer(nearbyMarkersLayer);
    areNearbyMarkersVisible = true;
    if (toggleBtn) toggleBtn.textContent = '📍 Hide Locations';

    if (window.app) {
      window.app.showToast('Nearby locations shown on map', 'success');
    }
  } else {
    if (nearbyMarkersLayer) {
      map.removeLayer(nearbyMarkersLayer);
    }
    areNearbyMarkersVisible = false;
    if (toggleBtn) toggleBtn.textContent = '📍 Show Locations';

    if (window.app) {
      window.app.showToast('Nearby locations hidden', 'info');
    }
  }
}

// Manual location finding function
function findMyLocation() {
  const btn = document.getElementById('findLocationBtn');
  if (btn) {
    btn.textContent = '⏳ Finding...';
    btn.disabled = true;
  }

  if (navigator.geolocation) {
    // Show loading state
    if (window.app) {
      window.app.showLoading(true);
      window.app.showToast('Getting your location...', 'info');
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Force fresh location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Remove existing user marker
        if (userMarker) {
          map.removeLayer(userMarker);
        }

        // Add new user marker with accuracy indicator
        const accuracyText = userLocation.accuracy < 50 ? 'High accuracy' :
                           userLocation.accuracy < 100 ? 'Medium accuracy' : 'Low accuracy';

        userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);

        userMarker.bindPopup(`
          <div style="text-align: center;">
            <strong>📍 Your Location</strong><br>
            <small>Accuracy: ±${Math.round(userLocation.accuracy)}m</small><br>
            <small>${accuracyText}</small>
          </div>
        `).openPopup();

        map.setView([userLocation.lat, userLocation.lng], 16);

        // Update accuracy circle
        updateAccuracyCircle(L.latLng(userLocation.lat, userLocation.lng), userLocation.accuracy);

        // Hide loading and show success
        if (window.app) {
          window.app.showLoading(false);
          window.app.showToast(`Location found with ${accuracyText.toLowerCase()}`, 'success');
        }

        // Reset button
        if (btn) {
          btn.textContent = '📍 My Location';
          btn.disabled = false;
        }

        // Update nearby places distances if app is available
        if (window.app && window.app.renderNearbyPlaces) {
          window.app.renderNearbyPlaces();
        }
      },
      (error) => {
        handleLocationError(error);

        // Reset button
        if (btn) {
          btn.textContent = '📍 My Location';
          btn.disabled = false;
        }
      },
      options
    );
  } else {
    const message = "Geolocation is not supported by this browser.";
    if (window.app) {
      window.app.showToast(message, 'error');
    } else {
      alert(message);
    }

    // Reset button
    if (btn) {
      btn.textContent = '📍 My Location';
      btn.disabled = false;
    }
  }
}

// Initialize
loadCrowdData();
trackUser();

// Load nearby markers after a delay to ensure data is available
setTimeout(() => {
  if (!nearbyMarkersLayer) {
    createNearbyMarkersLayer();
  }
}, 2000);