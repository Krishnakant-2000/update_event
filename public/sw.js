// Service Worker for Progressive Web App capabilities
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'amaPlayer-events-v1.0.0';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const API_CACHE = 'api-cache-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other critical static assets
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/events',
  '/api/leaderboards',
  '/api/achievements',
  '/api/user/profile'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticFile(request.url)) {
      event.respondWith(handleStaticFile(request));
    } else if (isAPIRequest(request.url)) {
      event.respondWith(handleAPIRequest(request));
    } else {
      event.respondWith(handleDynamicRequest(request));
    }
  }
});

// Handle static file requests (cache first strategy)
async function handleStaticFile(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static file fetch failed', error);
    return new Response('Offline - Static file not available', { status: 503 });
  }
}

// Handle API requests (network first, then cache)
async function handleAPIRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add offline indicator to cached response
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'ServiceWorker-Cache');
      return response;
    }

    // Return offline response for critical API endpoints
    if (isCriticalAPI(request.url)) {
      return createOfflineAPIResponse(request.url);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Offline - Data not available',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle dynamic requests (cache then network)
async function handleDynamicRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // No cache, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Dynamic request failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    console.log('Service Worker: Background cache update failed', error);
  }
}

// Check if request is for static file
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.includes(file)) ||
         url.includes('/static/') ||
         url.includes('.js') ||
         url.includes('.css') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.svg');
}

// Check if request is for API
function isAPIRequest(url) {
  return url.includes('/api/') || 
         CACHEABLE_APIS.some(api => url.includes(api));
}

// Check if API is critical (needs offline fallback)
function isCriticalAPI(url) {
  const criticalAPIs = [
    '/api/user/profile',
    '/api/events',
    '/api/achievements'
  ];
  return criticalAPIs.some(api => url.includes(api));
}

// Create offline response for critical APIs
function createOfflineAPIResponse(url) {
  let offlineData = {};

  if (url.includes('/api/user/profile')) {
    offlineData = {
      id: 'offline-user',
      name: 'Offline User',
      avatar: '/default-avatar.png',
      offline: true
    };
  } else if (url.includes('/api/events')) {
    offlineData = {
      events: [],
      message: 'Events will be available when you\'re back online',
      offline: true
    };
  } else if (url.includes('/api/achievements')) {
    offlineData = {
      achievements: [],
      message: 'Achievements will sync when you\'re back online',
      offline: true
    };
  }

  return new Response(
    JSON.stringify(offlineData),
    {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Served-By': 'ServiceWorker-Offline'
      }
    }
  );
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Perform background sync operations
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    
    // Sync pending data when connection is restored
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      try {
        await syncDataToServer(data);
        await removePendingData(data.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync data', error);
      }
    }
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Get pending data from IndexedDB
async function getPendingData() {
  // This would typically use IndexedDB to store pending sync data
  // For now, return empty array
  return [];
}

// Sync data to server
async function syncDataToServer(data) {
  const response = await fetch(data.endpoint, {
    method: data.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.payload)
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  
  return response.json();
}

// Remove synced data
async function removePendingData(id) {
  // Remove from IndexedDB
  console.log('Service Worker: Removing synced data', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new activity in AmaPlayer Events!',
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
        title: 'View Events',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  if (event.data) {
    const pushData = event.data.json();
    options.body = pushData.body || options.body;
    options.data = { ...options.data, ...pushData.data };
  }

  event.waitUntil(
    self.registration.showNotification('AmaPlayer Events', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/events')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.urls)
    );
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return cache.addAll(urls);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// Sync content periodically
async function syncContent() {
  try {
    console.log('Service Worker: Periodic content sync');
    
    // Update critical content in background
    const criticalUrls = [
      '/api/events/featured',
      '/api/leaderboards/top',
      '/api/user/notifications'
    ];
    
    const cache = await caches.open(API_CACHE);
    
    for (const url of criticalUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          cache.put(url, response);
        }
      } catch (error) {
        console.log('Service Worker: Failed to sync', url, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Periodic sync failed', error);
  }
}