// Service Worker Simple para Notificaciones Push
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 CONFIGURACIÓN DE FIREBASE (debe coincidir con index-simple.html)
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Notificación recibida en segundo plano:', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva actualización',
        icon: payload.notification?.icon || '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        data: {
            url: payload.data?.url || '/'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Click en notificación');
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
