// Service Worker para notificaciones push
// Versión del Service Worker
const SW_VERSION = '1.0.0';
const CACHE_NAME = `push-notifications-v${SW_VERSION}`;

// Importar Firebase Messaging SDK en el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Importar configuración de Firebase
importScripts('firebase-config-sw.js');

// Inicializar Firebase
firebase.initializeApp(firebaseConfigSW);
const messaging = firebase.messaging();

/**
 * Evento de instalación del Service Worker
 */
self.addEventListener('install', (event) => {
    console.log(`[SW] Instalando Service Worker v${SW_VERSION}`);
    
    // Forzar activación inmediata
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caché abierta');
            // Aquí puedes pre-cachear recursos si es necesario
            return cache.addAll([
                // '/icon.png',
                // '/badge.png'
            ]);
        })
    );
});

/**
 * Evento de activación del Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activando Service Worker v${SW_VERSION}`);
    
    event.waitUntil(
        // Limpiar cachés antiguos
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tomar control inmediato de todas las páginas
            return self.clients.claim();
        })
    );
});

/**
 * Manejo de mensajes push en segundo plano
 * Este evento se dispara cuando llega una notificación y la app está cerrada o en segundo plano
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensaje push recibido en segundo plano:', payload);
    
    // Extraer datos de la notificación
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva notificación';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Tienes una nueva actualización',
        icon: payload.notification?.icon || payload.data?.icon || '/icon.png',
        badge: payload.data?.badge || '/badge.png',
        image: payload.notification?.image || payload.data?.image,
        tag: payload.data?.tag || 'notification-' + Date.now(),
        requireInteraction: payload.data?.requireInteraction === 'true',
        silent: payload.data?.silent === 'true',
        vibrate: payload.data?.vibrate ? JSON.parse(payload.data.vibrate) : [200, 100, 200],
        data: {
            url: payload.notification?.click_action || payload.data?.click_action || payload.fcmOptions?.link || '/',
            timestamp: Date.now(),
            ...payload.data
        },
        actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/icons/open.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icons/close.png'
            }
        ]
    };

    // Mostrar la notificación
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Evento de click en la notificación
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Click en notificación:', event.notification.tag);
    console.log('[SW] Acción:', event.action);
    
    event.notification.close();
    
    // Manejar acciones personalizadas
    if (event.action === 'close') {
        console.log('[SW] Notificación cerrada por el usuario');
        return;
    }
    
    // Obtener URL de destino
    const urlToOpen = event.notification.data?.url || '/';
    
    // Abrir o enfocar la ventana
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Buscar si ya hay una ventana abierta con la URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Si no hay ventana abierta, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }).then(() => {
            // Enviar evento de analytics (opcional)
            return sendAnalyticsEvent('notification_clicked', {
                tag: event.notification.tag,
                action: event.action,
                url: urlToOpen
            });
        })
    );
});

/**
 * Evento de cierre de notificación
 */
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notificación cerrada:', event.notification.tag);
    
    // Enviar evento de analytics (opcional)
    event.waitUntil(
        sendAnalyticsEvent('notification_closed', {
            tag: event.notification.tag
        })
    );
});

/**
 * Manejo de mensajes desde la página principal
 */
self.addEventListener('message', (event) => {
    console.log('[SW] Mensaje recibido desde la página:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: SW_VERSION });
    }
});

/**
 * Manejo de push event (evento de bajo nivel)
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push event recibido');
    
    if (event.data) {
        try {
            const data = event.data.json();
            console.log('[SW] Datos del push:', data);
            
            // Firebase Messaging ya maneja esto automáticamente con onBackgroundMessage
            // Este evento es para casos especiales o debugging
        } catch (e) {
            console.log('[SW] Push event sin datos JSON:', event.data.text());
        }
    }
});

/**
 * Estrategia de caché para recursos estáticos (opcional)
 */
self.addEventListener('fetch', (event) => {
    // Solo cachear recursos GET
    if (event.request.method !== 'GET') return;
    
    // Ignorar requests a APIs externas
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retornar del caché si existe, sino hacer fetch
            return response || fetch(event.request).then((fetchResponse) => {
                // Cachear la nueva respuesta
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch((error) => {
            console.error('[SW] Error en fetch:', error);
            // Aquí podrías retornar una página offline personalizada
        })
    );
});

/**
 * Función auxiliar para enviar eventos de analytics
 */
async function sendAnalyticsEvent(eventName, eventData) {
    try {
        // Aquí puedes integrar con tu sistema de analytics
        // Por ejemplo, enviar a tu backend o a Google Analytics
        
        console.log('[SW] Analytics event:', eventName, eventData);
        
        // Ejemplo: enviar a tu backend
        // await fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: eventName, data: eventData })
        // });
        
        return true;
    } catch (error) {
        console.error('[SW] Error al enviar analytics:', error);
        return false;
    }
}

/**
 * Función auxiliar para obtener todos los clientes (ventanas/tabs)
 */
async function getAllClients() {
    const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    });
    return clientList;
}

/**
 * Función para enviar mensajes a todos los clientes
 */
async function notifyAllClients(message) {
    const clientList = await getAllClients();
    clientList.forEach(client => {
        client.postMessage(message);
    });
}

// Log de inicio
console.log(`[SW] Service Worker v${SW_VERSION} cargado`);
