// Comprehensive Nearby Places Data for Triveni Ghat, Ujjain
const nearbyPlacesData = {
    // Washrooms/Restrooms
    washroom: [
        {
            name: 'Public Washroom - Triveni Ghat',
            description: 'Clean public facilities near main ghat area',
            lat: 23.1285,
            lng: 75.7930,
            icon: '🚻',
            rating: 4.2,
            openHours: '24/7',
            facilities: ['Clean Water', 'Disabled Access']
        },
        {
            name: 'Ram Ghat Public Toilet',
            description: 'Well-maintained facilities at Ram Ghat',
            lat: 23.1815,
            lng: 75.7681,
            icon: '🚻',
            rating: 4.0,
            openHours: '5:00 AM - 11:00 PM',
            facilities: ['Clean Water', 'Soap Available']
        },
        {
            name: 'Kshipra Ghat Washroom',
            description: 'Public restroom facilities near Kshipra river',
            lat: 23.1290,
            lng: 75.7925,
            icon: '🚻',
            rating: 3.8,
            openHours: '24/7',
            facilities: ['Basic Facilities']
        }
    ],

    // Medical Facilities
    medical: [
        {
            name: 'Triveni Medical Post',
            description: 'Emergency medical services and first aid',
            lat: 23.1290,
            lng: 75.7935,
            icon: '🏥',
            rating: 4.5,
            openHours: '24/7',
            facilities: ['Emergency Care', 'First Aid', 'Ambulance']
        },
        {
            name: 'Kumbh Mela Hospital',
            description: 'Temporary hospital setup for pilgrims',
            lat: 23.1295,
            lng: 75.7940,
            icon: '🏥',
            rating: 4.3,
            openHours: '24/7',
            facilities: ['General Medicine', 'Emergency', 'Pharmacy']
        },
        {
            name: 'Red Cross Medical Camp',
            description: 'Free medical checkup and basic treatment',
            lat: 23.1280,
            lng: 75.7928,
            icon: '🏥',
            rating: 4.1,
            openHours: '6:00 AM - 10:00 PM',
            facilities: ['Free Consultation', 'Basic Medicines']
        }
    ],

    // Police Stations
    police_station: [
        {
            name: 'Triveni Ghat Police Outpost',
            description: 'Security and crowd control headquarters',
            lat: 23.1295,
            lng: 75.7928,
            icon: '🚔',
            rating: 4.0,
            openHours: '24/7',
            facilities: ['Emergency Response', 'Lost & Found', 'Crowd Control']
        },
        {
            name: 'Kumbh Mela Police Station',
            description: 'Main police station for event security',
            lat: 23.1275,
            lng: 75.7920,
            icon: '🚔',
            rating: 4.2,
            openHours: '24/7',
            facilities: ['FIR Registration', 'Emergency Response']
        }
    ],

    // Food Courts and Distribution
    food: [
        {
            name: 'Prasad Distribution Center',
            description: 'Free food and water distribution for pilgrims',
            lat: 23.1282,
            lng: 75.7940,
            icon: '🍽️',
            rating: 4.4,
            openHours: '5:00 AM - 10:00 PM',
            facilities: ['Free Meals', 'Drinking Water', 'Prasad']
        },
        {
            name: 'Sarafa Bazaar',
            description: 'Famous night food market with local delicacies',
            lat: 23.1765,
            lng: 75.7885,
            icon: '🍽️',
            rating: 4.6,
            openHours: '8:00 PM - 2:00 AM',
            facilities: ['Street Food', 'Sweets', 'Snacks']
        },
        {
            name: 'Annapurna Bhandara',
            description: 'Community kitchen serving free meals',
            lat: 23.1288,
            lng: 75.7932,
            icon: '🍽️',
            rating: 4.3,
            openHours: '6:00 AM - 9:00 PM',
            facilities: ['Free Meals', 'Vegetarian Food']
        },
        {
            name: 'Kumbh Food Court',
            description: 'Organized food court with multiple vendors',
            lat: 23.1285,
            lng: 75.7945,
            icon: '🍽️',
            rating: 4.1,
            openHours: '6:00 AM - 11:00 PM',
            facilities: ['Multiple Cuisines', 'Hygienic Food']
        }
    ],

    // Temples and Religious Places
    mandir: [
        {
            name: 'Mahakaleshwar Jyotirlinga Temple',
            description: 'One of the 12 Jyotirlingas, most sacred Shiva temple',
            lat: 23.1826,
            lng: 75.7681,
            icon: '🛕',
            rating: 4.8,
            openHours: '4:00 AM - 11:00 PM',
            facilities: ['Darshan', 'Prasad', 'Aarti']
        },
        {
            name: 'Kal Bhairav Temple',
            description: 'Ancient temple dedicated to Kal Bhairav',
            lat: 23.1789,
            lng: 75.7712,
            icon: '🛕',
            rating: 4.5,
            openHours: '5:00 AM - 10:00 PM',
            facilities: ['Darshan', 'Prasad', 'Special Rituals']
        },
        {
            name: 'Harsiddhi Temple',
            description: 'Famous Shakti Peeth temple',
            lat: 23.1698,
            lng: 75.7889,
            icon: '🛕',
            rating: 4.4,
            openHours: '5:00 AM - 10:00 PM',
            facilities: ['Darshan', 'Prasad', 'Religious Ceremonies']
        },
        {
            name: 'Chintaman Ganesh Temple',
            description: 'Ancient Ganesh temple, one of the most revered',
            lat: 23.1756,
            lng: 75.7823,
            icon: '🛕',
            rating: 4.3,
            openHours: '5:00 AM - 10:00 PM',
            facilities: ['Darshan', 'Prasad', 'Special Prayers']
        }
    ],

    // Parking Areas
    parking: [
        {
            name: 'Triveni Ghat Parking',
            description: 'Main parking area near the ghat',
            lat: 23.1280,
            lng: 75.7935,
            icon: '🅿️',
            rating: 3.8,
            openHours: '24/7',
            facilities: ['Car Parking', 'Two Wheeler Parking', 'Security']
        },
        {
            name: 'Nanakheda Bus Stand Parking',
            description: 'Large parking facility near bus stand',
            lat: 23.1760,
            lng: 75.7600,
            icon: '🅿️',
            rating: 4.0,
            openHours: '24/7',
            facilities: ['Bus Parking', 'Car Parking', 'Facilities']
        }
    ],

    // Rest Areas and Accommodation
    rest: [
        {
            name: 'Pilgrim Rest House',
            description: 'Temporary accommodation for pilgrims',
            lat: 23.1285,
            lng: 75.7925,
            icon: '🏕️',
            rating: 3.9,
            openHours: '24/7',
            facilities: ['Dormitory', 'Basic Amenities', 'Security']
        },
        {
            name: 'Dharamshala - Triveni',
            description: 'Free accommodation for pilgrims',
            lat: 23.1275,
            lng: 75.7930,
            icon: '🏕️',
            rating: 3.7,
            openHours: '24/7',
            facilities: ['Free Stay', 'Basic Facilities']
        }
    ],

    // Akhadas (Religious Camps)
    akhada: [
        {
            name: 'Shri Panchayati Akhada Mahanirvani',
            description: 'Traditional religious camp of sadhus',
            lat: 23.1292,
            lng: 75.7938,
            icon: '⛺',
            rating: 4.2,
            openHours: '24/7',
            facilities: ['Religious Discourses', 'Spiritual Guidance']
        },
        {
            name: 'Akhil Bharatiya Akhada Parishad',
            description: 'Central organization of all akhadas',
            lat: 23.1278,
            lng: 75.7942,
            icon: '⛺',
            rating: 4.1,
            openHours: '24/7',
            facilities: ['Religious Activities', 'Cultural Programs']
        }
    ],

    // Shopping and Markets
    shopping: [
        {
            name: 'Freeganj Market',
            description: 'Local market for daily essentials and souvenirs',
            lat: 23.1823,
            lng: 75.7756,
            icon: '🛒',
            rating: 4.0,
            openHours: '9:00 AM - 9:00 PM',
            facilities: ['Clothing', 'Souvenirs', 'Daily Essentials']
        },
        {
            name: 'Tower Chowk Market',
            description: 'Traditional market near clock tower',
            lat: 23.1794,
            lng: 75.7889,
            icon: '🛒',
            rating: 3.9,
            openHours: '10:00 AM - 8:00 PM',
            facilities: ['Traditional Items', 'Religious Articles']
        }
    ],

    // ATMs and Banks
    atm: [
        {
            name: 'SBI ATM - Triveni Ghat',
            description: 'State Bank of India ATM near ghat',
            lat: 23.1290,
            lng: 75.7932,
            icon: '🏧',
            rating: 4.0,
            openHours: '24/7',
            facilities: ['Cash Withdrawal', 'Balance Inquiry']
        },
        {
            name: 'HDFC Bank ATM',
            description: 'HDFC Bank ATM with cash facility',
            lat: 23.1285,
            lng: 75.7928,
            icon: '🏧',
            rating: 3.8,
            openHours: '24/7',
            facilities: ['Cash Withdrawal', 'Mini Statement']
        }
    ]
};

// Function to get places by category
function getPlacesByCategory(category) {
    if (category === 'all') {
        const allPlaces = [];
        Object.keys(nearbyPlacesData).forEach(cat => {
            nearbyPlacesData[cat].forEach(place => {
                allPlaces.push({ ...place, type: cat });
            });
        });
        return allPlaces;
    }
    
    return nearbyPlacesData[category] ? 
        nearbyPlacesData[category].map(place => ({ ...place, type: category })) : 
        [];
}

// Function to get nearby places within radius
function getNearbyPlaces(userLat, userLng, radius = 5, category = 'all') {
    const places = getPlacesByCategory(category);
    
    return places.filter(place => {
        const distance = calculateDistanceKm(userLat, userLng, place.lat, place.lng);
        return distance <= radius;
    }).sort((a, b) => {
        const distA = calculateDistanceKm(userLat, userLng, a.lat, a.lng);
        const distB = calculateDistanceKm(userLat, userLng, b.lat, b.lng);
        return distA - distB;
    });
}

// Helper function to calculate distance
function calculateDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { nearbyPlacesData, getPlacesByCategory, getNearbyPlaces };
}
