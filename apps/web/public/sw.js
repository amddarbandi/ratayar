// ============================================
// Ratayar Service Worker
// Version: 1.0.0
// ============================================

const VERSION = 'v1.1.0';
const OFFLINE_HTML = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>آفلاین — راتایار</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:50px 20px;background:linear-gradient(135deg,#0a0a0f 0%,#1a0a2e 100%);color:#fff;min-height:100vh;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center}h1{font-size:2rem;margin:0 0 1rem}p{color:#a0a0b0;margin:0 0 2rem}button{padding:12px 32px;font-size:1rem;background:#10ffb3;color:#0a0a0f;border:none;border-radius:8px;cursor:pointer;font-weight:700}</style></head><body><h1>&#128225; اتصال قطع است</h1><p>لطفاً اتصال اینترنت خود را بررسی کنید.</p><button onclick="location.reload()">تلاش دوباره</button></body></html>`;
const CACHE_STATIC = `ratayar-static-${VERSION}`;
const CACHE_DYNAMIC = `ratayar-dynamic-${VERSION}`;
const CACHE_IMAGES = `ratayar-images-${VERSION}`;
const CACHE_API = `ratayar-api-${VERSION}`;

const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ============================================
// Install - Precache static assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.error('[SW] Precache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// ============================================
// Activate - Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...', VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.endsWith(VERSION))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ============================================
// Fetch - Smart caching strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;

  // Skip cross-origin
  if (url.origin !== self.location.origin) return;

  // ============================================
  // Strategy: Cache First (static assets)
  // ============================================
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached && request.destination !== 'document') return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // ============================================
  // Strategy: Stale While Revalidate (images)
  // ============================================
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_IMAGES).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // ============================================
  // Strategy: Network First (API calls)
  // ============================================
  if (url.pathname.startsWith('/api/')) {
    // فقط برای endpointهای امن (GET)
    event.respondWith(
      fetch(request)
        .then((response) => {
          // فقط پاسخ‌های موفق و GET را cache کن
          if (response.ok && request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_API).then((cache) => {
              // فقط ۵ دقیقه cache کن
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // اگر آفلاین بود، از cache بخوان
          return caches.match(request).then((cached) => {
            if (cached && request.destination !== 'document') return cached;
            // اگر هیچی نبود، یک پاسخ خطا برگردان
            return new Response(
              JSON.stringify({
                error: 'آفلاین هستید',
                offline: true,
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // ============================================
  // Strategy: Network First with Offline Fallback (pages)
  // ============================================
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_DYNAMIC).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached && request.destination !== 'document') return cached;
          // صفحه offline
          if (request.destination === 'document') {
            return new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ============================================
// Message handler (skipWaiting)
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// Push Notifications (future)
// ============================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    dir: 'rtl',
    lang: 'fa',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'راتایار', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
