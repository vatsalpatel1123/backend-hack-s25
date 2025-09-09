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
  } else {
    alert("Geolocation is not supported by this browser.");
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

// Enhanced navigation with detailed route information
function startNavigation() {
  const sectorId = document.getElementById('toSector').value;
  const destination = sectors[sectorId];

  if (!destination) {
    alert("Please select a valid destination.");
    return;
  }

  if (!userMarker || !userLocation) {
    alert("Please wait for your location to be detected, or click 'Find My Location'.");
    return;
  }

  // Remove previous route if exists
  if (currentRoute) {
    map.removeControl(currentRoute);
  }

  // Show route info panel
  const routeInfo = document.getElementById('routeInfo');
  routeInfo.classList.add('visible');

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
    }
  }).addTo(map);

  currentRoute.on('routesfound', function(event) {
    const route = event.routes[0];
    displayRouteInformation(route, destination);
  });

  currentRoute.on('routingerror', function(e) {
    console.error('Routing error:', e);
    alert('Unable to calculate route. Please try again.');
  });
}

function displayRouteInformation(route, destination) {
  const distance = (route.summary.totalDistance / 1000).toFixed(2); // Convert to km
  const time = Math.round(route.summary.totalTime / 60); // Convert to minutes
  const crowdDensity = getCrowdDensity(destination.name);

  const routeDetails = document.getElementById('routeDetails');
  routeDetails.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>🎯 Destination:</strong> ${destination.name}
    </div>
    <div style="margin-bottom: 10px;">
      <strong>📏 Distance:</strong> ${distance} km
    </div>
    <div style="margin-bottom: 10px;">
      <strong>⏱️ Estimated Time:</strong> ${time} minutes
    </div>
    <div style="margin-bottom: 10px;">
      <strong>👥 Crowd Density:</strong> <span style="color: ${crowdDensity.color};">${crowdDensity.level}</span>
    </div>
    <div style="margin-bottom: 10px;">
      <strong>🧭 Instructions:</strong>
      <div style="max-height: 150px; overflow-y: auto; margin-top: 5px; font-size: 12px;">
        ${getRouteInstructions(route)}
      </div>
    </div>
    <button onclick="clearRoute()" style="width: 100%; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 4px; margin-top: 10px;">Clear Route</button>
  `;
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

function getRouteInstructions(route) {
  if (!route.instructions || route.instructions.length === 0) {
    return '<div>Follow the highlighted route on the map</div>';
  }

  return route.instructions.map((instruction, index) => {
    const direction = instruction.text || instruction.instruction || 'Continue';
    const distance = instruction.distance ? `(${(instruction.distance / 1000).toFixed(1)} km)` : '';
    return `<div style="margin: 3px 0;">${index + 1}. ${direction} ${distance}</div>`;
  }).join('');
}

function clearRoute() {
  if (currentRoute) {
    map.removeControl(currentRoute);
    currentRoute = null;
  }

  const routeInfo = document.getElementById('routeInfo');
  routeInfo.classList.remove('visible');
}

// Event listeners
document.getElementById('navigateBtn').addEventListener('click', startNavigation);
document.getElementById('findLocationBtn').addEventListener('click', findUserLocation);

// Start tracking the user's location
trackUser();