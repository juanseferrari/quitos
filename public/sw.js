const CACHE_NAME = 'rey-del-truco-v3-api-fix';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/throne-icon-180.png',
  '/throne-icon-192.png',
  '/throne-icon-512.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing new service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 SW: Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never cache OAuth/auth routes AND Supabase API - they need fresh data
  const skipCacheRoutes = [
    '/auth/callback',
    '/oauth/callback',
    'supabase.co/auth',
    'supabase.co/rest',     // Supabase REST API
    'supabase.co/storage',  // Supabase Storage API
    'supabase.co/realtime', // Supabase Realtime
    'accounts.google.com',
    'appleid.apple.com'
  ];

  const shouldSkipCache = skipCacheRoutes.some(route =>
    url.pathname.includes(route) || url.href.includes(route)
  );

  if (shouldSkipCache) {
    // Network-only for auth routes
    console.log('🔓 SW: Bypassing cache for auth route:', url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }

  // Normal cache-first strategy for other routes
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});