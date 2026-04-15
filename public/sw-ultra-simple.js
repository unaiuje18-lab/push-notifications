// Service Worker Ultra Simple
self.addEventListener('install', () => {
    console.log('[SW] Instalado');
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    console.log('[SW] Activado');
    self.clients.claim();
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
    console.log('[SW] Push recibido');
    
    let data = { title: 'Nueva notificación', body: 'Tienes una actualización' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '🔔',
            badge: '🔔',
            vibrate: [200, 100, 200],
            data: { url: data.url || '/' }
        })
    );
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Click en notificación');
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
