// Service Worker pour PWA et mode hors ligne
const CACHE_NAME = 'agentimpact-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Stratégie de cache: Network First avec fallback
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Stratégie spéciale pour les API Supabase
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // En cas d'échec réseau, retourner une réponse d'erreur structurée
          return new Response(
            JSON.stringify({
              error: 'Mode hors ligne - Données non disponibles',
              offline: true
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Stratégie Cache First pour les ressources statiques
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' || 
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Stratégie Network First pour les pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache si réseau indisponible
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Fallback vers la page d'accueil pour les routes SPA
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            throw new Error('Ressource non disponible hors ligne');
          });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AgentImpact', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Synchroniser les données en attente
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  // Logique de synchronisation des données hors ligne
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingRequests = await cache.match('pending-requests');
    
    if (pendingRequests) {
      const requests = await pendingRequests.json();
      
      for (const request of requests) {
        try {
          await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
          });
        } catch (error) {
          console.log('Sync failed for request:', request.url);
        }
      }
      
      // Nettoyer les requêtes synchronisées
      await cache.delete('pending-requests');
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}