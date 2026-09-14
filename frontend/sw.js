/**
 * SlideCraft Service Worker
 * Provides offline caching, fast asset delivery, and PWA installation support.
 */

const CACHE_NAME = 'slidecraft-cache-v1';

// Core static assets to precache
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './js/app.js',
    './js/pwa.js',
    './js/renderer.js',
    './js/navigation.js',
    './js/slide-layouts.js',
    './js/slide-templates.js',
    './icons/outline/device-laptop.svg',
    './icons/hugeicons/presentation-01.svg',
    './icons/hugeicons/ai-brain-01.svg',
    './icons/hugeicons/pdf-01.svg',
    './icons/hugeicons/workflow-square-01.svg',
    './icons/pwa/icon-192.png',
    './icons/pwa/icon-512.png',
    './icons/pwa/icon-maskable-512.png',
    './icons/pwa/apple-touch-icon.png',
    './icons/pwa/icon.svg'
];

// Install Event - Precache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching offline assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((err) => {
                console.warn('[SW] Pre-caching warning:', err);
            })
    );
});

// Activate Event - Clean up outdated caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Handle asset requests and API calls
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Bypass caching for non-GET requests (e.g. POST /api/generate)
    if (request.method !== 'GET') {
        return;
    }

    // Bypass caching for backend API requests, but provide offline response if network fails
    if (url.pathname.includes('/api/') || url.port === '3001') {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: {
                            message: 'You are currently offline. Please connect to the internet to generate new presentations.'
                        }
                    }),
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
        );
        return;
    }

    // Google Fonts & external assets: Stale-While-Revalidate
    if (url.origin.includes('googleapis.com') || url.origin.includes('gstatic.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Stale-While-Revalidate for app assets (HTML, CSS, JS, SVGs, PNGs)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline and request is an HTML page, return index.html from cache
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html') || cachedResponse;
                }
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
