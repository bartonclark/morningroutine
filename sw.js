// Service Worker for Morning Routine Tracker
// Enables offline functionality and caching

const CACHE_NAME = 'morning-routine-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS.map(url => {
                    // Handle both absolute and relative URLs
                    return url.startsWith('/') ? url : `/${url}`;
                }));
            })
            .then(() => {
                console.log('Service Worker: Static assets cached successfully');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache successful responses for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Network fetch failed', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return offline placeholder for other requests
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Handle background sync for data persistence
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'routine-data-sync') {
        event.waitUntil(syncRoutineData());
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Time for your morning routine!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'start-routine',
                title: 'Start Routine',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Morning Routine Tracker', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'start-routine') {
        // Open app and start routine
        event.waitUntil(
            clients.openWindow('/?action=start-routine')
        );
    } else if (event.action !== 'dismiss') {
        // Open app normally
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle message from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Sync routine data in background
async function syncRoutineData() {
    try {
        console.log('Service Worker: Syncing routine data...');
        
        // In a real app, this would sync with a backend server
        // For now, we'll just ensure local data is intact
        
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        
        console.log('Service Worker: Data sync completed', keys.length, 'items cached');
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Data sync failed', error);
        return Promise.reject(error);
    }
}

// Periodic background fetch for weather data
self.addEventListener('periodicsync', event => {
    if (event.tag === 'weather-update') {
        event.waitUntil(updateWeatherData());
    }
});

async function updateWeatherData() {
    try {
        console.log('Service Worker: Updating weather data...');
        
        // In a real app, this would fetch fresh weather data
        // and update the cache for offline use
        
        const cache = await caches.open(CACHE_NAME);
        
        // Simulate weather data update
        const weatherData = {
            timestamp: Date.now(),
            condition: 'updated',
            temperature: Math.round(Math.random() * 30 + 50), // 50-80°F
            recommendation: 'Light exposure optimized for current conditions'
        };
        
        // Store in cache for offline access
        const response = new Response(JSON.stringify(weatherData), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        await cache.put('/api/weather', response);
        
        console.log('Service Worker: Weather data updated successfully');
    } catch (error) {
        console.error('Service Worker: Weather update failed', error);
    }
}

// Handle app shortcuts
self.addEventListener('shortcut', event => {
    console.log('Service Worker: App shortcut triggered', event.url);
    
    const url = new URL(event.url);
    const shortcut = url.searchParams.get('shortcut');
    
    let targetUrl = '/';
    
    switch (shortcut) {
        case 'routine':
            targetUrl = '/?tab=routine&autostart=true';
            break;
        case 'sleep':
            targetUrl = '/?tab=sleep';
            break;
        case 'analytics':
            targetUrl = '/?tab=analytics';
            break;
        default:
            targetUrl = '/';
    }
    
    event.waitUntil(
        clients.openWindow(targetUrl)
    );
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded successfully');
