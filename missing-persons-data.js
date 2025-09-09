// Missing Persons Data for Kumbh Mela Navigation System
// Sample realistic missing person cases with photos and detailed information

const missingPersonsData = [
    {
        id: 'MP001',
        name: 'Ramesh Kumar Sharma',
        age: 67,
        gender: 'Male',
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yNSA4NUMzMCA2NSA0MCA2MCA1MCA2MEM2MCA2MCA3MCA2NSA3NSA4NUgyNVoiIGZpbGw9IiM2NjYiLz4KPHN2Zz4K',
        description: 'Elderly man with white beard, wearing white kurta and orange gamcha. Has difficulty walking due to arthritis.',
        lastSeenLocation: {
            lat: 23.1287723,
            lng: 75.7933631,
            name: 'Triveni Ghat Main Bathing Area',
            description: 'Near the main steps, close to the prasad distribution center'
        },
        lastSeenTime: '2024-01-15T06:30:00Z',
        reportedBy: {
            name: 'Sunita Sharma',
            relationship: 'Daughter',
            contact: '+91-9876543210',
            email: 'sunita.sharma@email.com'
        },
        physicalDescription: {
            height: '5\'4"',
            build: 'Thin',
            complexion: 'Fair',
            distinguishingMarks: 'Scar on left hand, wears thick glasses',
            clothing: 'White cotton kurta, brown sandals, orange gamcha around neck'
        },
        medicalConditions: [
            'Diabetes',
            'High blood pressure',
            'Mild dementia',
            'Arthritis in knees'
        ],
        languages: ['Hindi', 'Gujarati'],
        hometown: 'Ahmedabad, Gujarat',
        caseStatus: 'active',
        priority: 'high',
        searchRadius: 2000, // meters
        alertsSent: 15,
        tips: [
            {
                id: 'TIP001',
                timestamp: '2024-01-15T08:15:00Z',
                location: 'East Sector Food Court',
                description: 'Elderly man matching description seen asking for directions',
                reporter: 'Volunteer #45',
                verified: false
            },
            {
                id: 'TIP002',
                timestamp: '2024-01-15T09:30:00Z',
                location: 'North Sector Medical Post',
                description: 'Man with white beard sought medical help for knee pain',
                reporter: 'Dr. Priya Sharma',
                verified: true
            }
        ],
        timeline: [
            {
                time: '2024-01-15T06:00:00Z',
                event: 'Arrived at Triveni Ghat with family',
                location: 'Triveni Ghat Entrance'
            },
            {
                time: '2024-01-15T06:30:00Z',
                event: 'Last seen near main bathing steps',
                location: 'Triveni Ghat Main'
            },
            {
                time: '2024-01-15T07:00:00Z',
                event: 'Family noticed he was missing',
                location: 'Triveni Ghat Main'
            },
            {
                time: '2024-01-15T07:15:00Z',
                event: 'Missing person report filed',
                location: 'Police Post #1'
            }
        ]
    },
    {
        id: 'MP002',
        name: 'Kavya Patel',
        age: 8,
        gender: 'Female',
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZlNGU0Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjEyIiBmaWxsPSIjZmY2YjZiIi8+CjxwYXRoIGQ9Ik0zMCA4MEM0MCA3MCA0NSA2NSA1MCA2NUM1NSA2NSA2MCA3MCA3MCA4MEgzMFoiIGZpbGw9IiNmZjZiNmIiLz4KPHN2Zz4K',
        description: 'Young girl with long black hair in braids, wearing pink dress with floral pattern. Very shy and may not respond to strangers.',
        lastSeenLocation: {
            lat: 23.1295,
            lng: 75.7940,
            name: 'East Sector Children\'s Play Area',
            description: 'Near the temporary playground set up for children'
        },
        lastSeenTime: '2024-01-15T10:45:00Z',
        reportedBy: {
            name: 'Rajesh Patel',
            relationship: 'Father',
            contact: '+91-9876543211',
            email: 'rajesh.patel@email.com'
        },
        physicalDescription: {
            height: '3\'8"',
            build: 'Small',
            complexion: 'Wheatish',
            distinguishingMarks: 'Small mole on right cheek, pierced ears with gold earrings',
            clothing: 'Pink dress with white flowers, white sandals, red hair ribbons'
        },
        medicalConditions: [],
        languages: ['Hindi', 'Gujarati'],
        hometown: 'Surat, Gujarat',
        caseStatus: 'active',
        priority: 'critical',
        searchRadius: 1000,
        alertsSent: 25,
        tips: [
            {
                id: 'TIP003',
                timestamp: '2024-01-15T11:30:00Z',
                location: 'West Sector Shelter Area',
                description: 'Small girl in pink dress seen crying near shelter #5',
                reporter: 'Security Guard #8',
                verified: false
            }
        ],
        timeline: [
            {
                time: '2024-01-15T10:00:00Z',
                event: 'Playing in children\'s area with siblings',
                location: 'East Sector Play Area'
            },
            {
                time: '2024-01-15T10:45:00Z',
                event: 'Last seen playing near swings',
                location: 'East Sector Play Area'
            },
            {
                time: '2024-01-15T11:00:00Z',
                event: 'Parents noticed she was missing',
                location: 'East Sector Play Area'
            },
            {
                time: '2024-01-15T11:15:00Z',
                event: 'Emergency alert issued',
                location: 'Police Post #2'
            }
        ]
    },
    {
        id: 'MP003',
        name: 'Mohan Das',
        age: 45,
        gender: 'Male',
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZTZmM2ZmIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE0IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yOCA4MkMzNSA2OCA0MiA2MyA1MCA2M0M1OCA2MyA2NSA2OCA3MiA4MkgyOFoiIGZpbGw9IiM2NjYiLz4KPHN2Zz4K',
        description: 'Middle-aged man with mustache, wearing saffron robes. Known to have mental health issues and may appear confused.',
        lastSeenLocation: {
            lat: 23.1275,
            lng: 75.7920,
            name: 'South Sector Parking Area',
            description: 'Near the main parking entrance, close to shuttle stop #3'
        },
        lastSeenTime: '2024-01-15T14:20:00Z',
        reportedBy: {
            name: 'Ashram Volunteer',
            relationship: 'Caregiver',
            contact: '+91-9876543212',
            email: 'volunteer@ashram.org'
        },
        physicalDescription: {
            height: '5\'7"',
            build: 'Medium',
            complexion: 'Dark',
            distinguishingMarks: 'Tilaka on forehead, prayer beads around neck',
            clothing: 'Saffron colored robes, brown sandals, cloth bag'
        },
        medicalConditions: [
            'Bipolar disorder',
            'Takes medication for anxiety'
        ],
        languages: ['Hindi', 'Sanskrit'],
        hometown: 'Haridwar, Uttarakhand',
        caseStatus: 'active',
        priority: 'high',
        searchRadius: 3000,
        alertsSent: 12,
        tips: [
            {
                id: 'TIP004',
                timestamp: '2024-01-15T15:00:00Z',
                location: 'Southwest Sector Temple Area',
                description: 'Man in saffron robes seen sitting alone, appeared distressed',
                reporter: 'Temple Priest',
                verified: false
            }
        ],
        timeline: [
            {
                time: '2024-01-15T13:30:00Z',
                event: 'Arrived with ashram group',
                location: 'South Sector Parking'
            },
            {
                time: '2024-01-15T14:20:00Z',
                event: 'Last seen walking towards shuttle area',
                location: 'South Sector Parking'
            },
            {
                time: '2024-01-15T15:30:00Z',
                event: 'Group noticed he was missing',
                location: 'Triveni Ghat Main'
            },
            {
                time: '2024-01-15T15:45:00Z',
                event: 'Search initiated by ashram volunteers',
                location: 'Multiple sectors'
            }
        ]
    },
    {
        id: 'MP004',
        name: 'Lakshmi Devi',
        age: 72,
        gender: 'Female',
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmNGU2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjEzIiBmaWxsPSIjZmY5OGE4Ii8+CjxwYXRoIGQ9Ik0zMCA4MkMzOCA3MCA0NCA2NSA1MCA2NUM1NiA2NSA2MiA3MCA3MCA4MkgzMFoiIGZpbGw9IiNmZjk4YTgiLz4KPHN2Zz4K',
        description: 'Elderly woman with grey hair, wearing traditional white saree. Uses walking stick and moves slowly.',
        lastSeenLocation: {
            lat: 23.1300,
            lng: 75.7925,
            name: 'Northeast Sector Food Distribution',
            description: 'Near the free meal service area, close to medical post #3'
        },
        lastSeenTime: '2024-01-15T12:15:00Z',
        reportedBy: {
            name: 'Ravi Kumar',
            relationship: 'Son',
            contact: '+91-9876543213',
            email: 'ravi.kumar@email.com'
        },
        physicalDescription: {
            height: '5\'1"',
            build: 'Frail',
            complexion: 'Fair',
            distinguishingMarks: 'Uses wooden walking stick, wears thick glasses, gold bangles',
            clothing: 'White cotton saree with blue border, white blouse, black sandals'
        },
        medicalConditions: [
            'Osteoporosis',
            'Poor eyesight',
            'Heart condition',
            'Takes blood pressure medication'
        ],
        languages: ['Hindi', 'Bengali'],
        hometown: 'Kolkata, West Bengal',
        caseStatus: 'resolved',
        priority: 'high',
        searchRadius: 1500,
        alertsSent: 8,
        foundLocation: {
            lat: 23.1285,
            lng: 75.7935,
            name: 'West Sector Rest Area',
            description: 'Found resting in shelter, was tired and confused about location'
        },
        foundTime: '2024-01-15T16:30:00Z',
        tips: [
            {
                id: 'TIP005',
                timestamp: '2024-01-15T16:15:00Z',
                location: 'West Sector Rest Area',
                description: 'Elderly woman in white saree resting in shelter #12',
                reporter: 'Volunteer #67',
                verified: true
            }
        ],
        timeline: [
            {
                time: '2024-01-15T11:30:00Z',
                event: 'Arrived for free meal service',
                location: 'Northeast Sector Food Distribution'
            },
            {
                time: '2024-01-15T12:15:00Z',
                event: 'Last seen leaving food area',
                location: 'Northeast Sector Food Distribution'
            },
            {
                time: '2024-01-15T13:30:00Z',
                event: 'Son noticed she was missing',
                location: 'Northeast Sector'
            },
            {
                time: '2024-01-15T16:30:00Z',
                event: 'Found safe in rest area',
                location: 'West Sector Rest Area'
            }
        ]
    }
];

// Helper functions for missing persons data
function getMissingPersonById(id) {
    return missingPersonsData.find(person => person.id === id);
}

function getActiveMissingPersons() {
    return missingPersonsData.filter(person => person.caseStatus === 'active');
}

function getResolvedMissingPersons() {
    return missingPersonsData.filter(person => person.caseStatus === 'resolved');
}

function getCriticalMissingPersons() {
    return missingPersonsData.filter(person => person.priority === 'critical' && person.caseStatus === 'active');
}

function getMissingPersonsByLocation(lat, lng, radiusKm = 1) {
    return missingPersonsData.filter(person => {
        const distance = calculateDistance(lat, lng, person.lastSeenLocation.lat, person.lastSeenLocation.lng);
        return distance <= radiusKm;
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        missingPersonsData,
        getMissingPersonById,
        getActiveMissingPersons,
        getResolvedMissingPersons,
        getCriticalMissingPersons,
        getMissingPersonsByLocation,
        calculateDistance
    };
}
