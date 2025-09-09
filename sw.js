// Service Worker for Kumbh Mela Navigation App
const CACHE_NAME = 'kumbh-mela-nav-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/sectors.js',
  '/api-service.js',
  '/nearby-places-data.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css',
  'https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js',
  'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page or cached content
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-report') {
    event.waitUntil(syncEmergencyReports());
  } else if (event.tag === 'missing-person') {
    event.waitUntil(syncMissingPersonReports());
  }
});

// Sync emergency reports when back online
async function syncEmergencyReports() {
  try {
    const reports = await getStoredReports('emergency');
    for (const report of reports) {
      try {
        const response = await fetch('/emergency/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report.data)
        });
        
        if (response.ok) {
          await removeStoredReport('emergency', report.id);
        }
      } catch (error) {
        console.log('Failed to sync emergency report:', error);
      }
    }
  } catch (error) {
    console.log('Error syncing emergency reports:', error);
  }
}

// Sync missing person reports when back online
async function syncMissingPersonReports() {
  try {
    const reports = await getStoredReports('missing');
    for (const report of reports) {
      try {
        const response = await fetch('/missing/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report.data)
        });
        
        if (response.ok) {
          await removeStoredReport('missing', report.id);
        }
      } catch (error) {
        console.log('Failed to sync missing person report:', error);
      }
    }
  } catch (error) {
    console.log('Error syncing missing person reports:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredReports(type) {
  return new Promise((resolve) => {
    const request = indexedDB.open('KumbhMelaDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => {
        const reports = getRequest.result.filter(report => report.type === type);
        resolve(reports);
      };
    };
    
    request.onerror = () => resolve([]);
  });
}

async function removeStoredReport(type, id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('KumbhMelaDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
    };
    
    request.onerror = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Kumbh Mela',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Kumbh Mela Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
