#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're in production (GitHub Pages) or development
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/Focus-Hub' : '';

const serviceWorkerContent = `const CACHE_NAME = 'memphis-focus-hub-v3';
const BASE_PATH = '${basePath}';
const urlsToCache = [
  \`\${BASE_PATH}/\`,
  \`\${BASE_PATH}/index.html\`,
  \`\${BASE_PATH}/manifest.json\`,
  \`\${BASE_PATH}/app-icon.svg\`,
  \`\${BASE_PATH}/dashboard.jpeg\`,
  \`\${BASE_PATH}/to%20do%20page.jpeg\`,
  \`\${BASE_PATH}/focus-screen.jpeg\`,
  // External CDN resources for offline use
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-router-dom@^7.6.3',
  'https://esm.sh/recharts@^3.1.0',
  'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js',
  'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js',
  // Add built assets (will be dynamically cached)
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        // Cache core app files first
        const coreFiles = urlsToCache.filter(url => !url.startsWith('https://'));
        return cache.addAll(coreFiles)
          .then(() => {
            console.log('Core files cached successfully');
            // Try to cache external resources, but don't fail if they're not available
            const externalFiles = urlsToCache.filter(url => url.startsWith('https://'));
            return Promise.allSettled(
              externalFiles.map(url =>
                fetch(url).then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                }).catch(err => console.log('Failed to cache:', url, err))
              )
            );
          });
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache when offline with enhanced caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with different strategies
  if (event.request.destination === 'document') {
    // For HTML documents: Network first, then cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache or fallback
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to main page for SPA routing
              return caches.match(\`\${BASE_PATH}/index.html\`);
            });
        })
    );
  } else if (event.request.url.includes('esm.sh') ||
             event.request.url.includes('unpkg.com') ||
             event.request.url.includes('ionicons')) {
    // For external CDN resources: Cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache, fetch and cache
          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // Return a basic offline response for scripts
              if (event.request.url.includes('.js')) {
                return new Response('// Offline fallback', {
                  headers: { 'Content-Type': 'application/javascript' }
                });
              }
            });
        })
    );
  } else if (event.request.url.includes(BASE_PATH) || event.request.url.includes('localhost')) {
    // For app resources: Cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
        .catch(() => {
          // Fallback for app resources
          if (event.request.destination === 'document') {
            return caches.match(\`\${BASE_PATH}/index.html\`);
          }
        })
    );
  }
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Background sync for offline task management
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
});

function doBackgroundSync() {
  console.log('Background sync triggered - syncing all data');
  return Promise.all([
    syncTasks(),
    syncSessions(),
    syncGoals()
  ]).catch(err => {
    console.log('Background sync failed:', err);
  });
}

function syncTasks() {
  // Sync tasks data when back online
  console.log('Syncing tasks...');
  return new Promise((resolve) => {
    // In a real app, you'd sync with a server here
    // For now, just ensure localStorage data is consistent
    try {
      const tasks = localStorage.getItem('memphis_tasks');
      if (tasks) {
        console.log('Tasks data available:', JSON.parse(tasks).length, 'tasks');
      }
      resolve();
    } catch (err) {
      console.log('Task sync error:', err);
      resolve();
    }
  });
}

function syncSessions() {
  // Sync focus sessions when back online
  console.log('Syncing focus sessions...');
  return new Promise((resolve) => {
    try {
      const sessions = localStorage.getItem('memphis_sessions');
      if (sessions) {
        console.log('Sessions data available:', JSON.parse(sessions).length, 'sessions');
      }
      resolve();
    } catch (err) {
      console.log('Session sync error:', err);
      resolve();
    }
  });
}

function syncGoals() {
  // Sync goals when back online
  console.log('Syncing goals...');
  return new Promise((resolve) => {
    try {
      const goals = localStorage.getItem('memphis_goals');
      if (goals) {
        console.log('Goals data available');
      }
      resolve();
    } catch (err) {
      console.log('Goals sync error:', err);
      resolve();
    }
  });
}

// Push notifications (optional for future features)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Focus session reminder!',
    icon: \`\${BASE_PATH}/app-icon.svg\`,
    badge: \`\${BASE_PATH}/app-icon.svg\`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Focus Hub',
        icon: \`\${BASE_PATH}/app-icon.svg\`
      },
      {
        action: 'close',
        title: 'Close',
        icon: \`\${BASE_PATH}/app-icon.svg\`
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Memphis Focus Hub', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(\`\${BASE_PATH}/\`)
    );
  }
});
`;

// Write service worker to public directory
const publicDir = path.join(__dirname, '..', 'public');
const swPath = path.join(publicDir, 'sw.js');

fs.writeFileSync(swPath, serviceWorkerContent);
console.log(`✅ Generated sw.js for ${isProduction ? 'production' : 'development'}`);
console.log(`   Base path: ${basePath || '/'}`);
