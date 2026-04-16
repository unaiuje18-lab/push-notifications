// Importar configuración de Firebase
import { firebaseConfig, VAPID_KEY, API_URL, validateFirebaseConfig } from './firebase-config.js';
// Importar configuración de OneSignal
import { ONESIGNAL_CONFIG, initializeOneSignal, subscribeOneSignal } from './onesignal-config.js';

// Estado de la aplicación
let messaging = null;
let currentToken = null;

// Elementos del DOM
const elements = {
    enableBtn: document.getElementById('enableNotifications'),
    disableBtn: document.getElementById('disableNotifications'),
    testBtn: document.getElementById('testNotification'),
    statusIcon: document.getElementById('statusIcon'),
    statusTitle: document.getElementById('statusTitle'),
    statusMessage: document.getElementById('statusMessage'),
    statusCard: document.querySelector('.status-card'),
    adminPanel: document.getElementById('adminPanel'),
    debugSection: document.getElementById('debugSection'),
    debugLog: document.getElementById('debugLog')
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    log('Aplicación iniciada');
    
    // Validar configuración de Firebase
    if (!validateFirebaseConfig()) {
        updateStatus('unsupported', '❌', 'Configuración pendiente', 'Necesitas configurar tus credenciales de Firebase en firebase-config.js');
        return;
    }
    
    // Verificar soporte de notificaciones
    if (!('Notification' in window)) {
        log('ERROR: Este navegador no soporta notificaciones', 'error');
        updateStatus('unsupported', '❌', 'No soportado', 'Tu navegador no soporta notificaciones push');
        return;
    }

    // Verificar soporte de Service Worker
    if (!('serviceWorker' in navigator)) {
        log('ERROR: Este navegador no soporta Service Workers', 'error');
        updateStatus('unsupported', '❌', 'No soportado', 'Tu navegador no soporta Service Workers');
        return;
    }

    // Registrar Service Worker
    await registerServiceWorker();

    // Cargar Firebase SDK dinámicamente
    // await loadFirebaseSDK();

    // Inicializar Firebase
    // initializeFirebase();
    log('Firebase desactivado temporalmente - usando solo OneSignal');
    
    // Inicializar OneSignal
    await initializeOneSignal();
    log('OneSignal inicializado');

    // Verificar estado actual
    checkNotificationPermission();

    // Event listeners
    elements.enableBtn.addEventListener('click', requestNotificationPermission);
    elements.disableBtn.addEventListener('click', disableNotifications);
    elements.testBtn.addEventListener('click', sendTestNotification);

    // Admin panel (mostrar solo en desarrollo o con parámetro ?admin=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || window.location.hostname === 'localhost') {
        elements.adminPanel.style.display = 'block';
        setupAdminPanel();
    }

    // Debug mode
    if (urlParams.get('debug') === 'true') {
        elements.debugSection.style.display = 'block';
    }
});

/**
 * Registrar Service Worker
 */
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        log(`Service Worker registrado: ${registration.scope}`);
        
        // Esperar a que esté activo
        await navigator.serviceWorker.ready;
        log('Service Worker activo');
        
        return registration;
    } catch (error) {
        log(`Error al registrar Service Worker: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Cargar Firebase SDK dinámicamente
 */
async function loadFirebaseSDK() {
    try {
        // Importar Firebase desde CDN
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');
        
        window.firebaseApp = initializeApp;
        window.firebaseMessaging = { getMessaging, getToken, onMessage };
        
        log('Firebase SDK cargado correctamente');
    } catch (error) {
        log(`Error al cargar Firebase SDK: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Inicializar Firebase
 */
function initializeFirebase() {
    try {
        const app = window.firebaseApp(firebaseConfig);
        messaging = window.firebaseMessaging.getMessaging(app);
        
        // Escuchar mensajes en primer plano
        window.firebaseMessaging.onMessage(messaging, (payload) => {
            log('Mensaje recibido en primer plano:', payload);
            showNotification(payload);
        });
        
        log('Firebase inicializado correctamente');
    } catch (error) {
        log(`Error al inicializar Firebase: ${error.message}`, 'error');
    }
}

/**
 * Verificar estado de permisos
 */
function checkNotificationPermission() {
    const permission = Notification.permission;
    log(`Estado de permisos: ${permission}`);

    switch (permission) {
        case 'granted':
            updateStatus('active', '✅', 'Notificaciones activadas', 'Recibirás notificaciones desde OneSignal');
            elements.enableBtn.style.display = 'none';
            elements.disableBtn.style.display = 'inline-flex';
            elements.testBtn.style.display = 'none'; // Ocultar botón de prueba ya que no usamos Firebase
            break;

        case 'denied':
            updateStatus('denied', '🚫', 'Notificaciones bloqueadas', 'Has bloqueado las notificaciones. Cámbialas en la configuración del navegador.');
            elements.enableBtn.style.display = 'none';
            break;

        default: // 'default'
            updateStatus('inactive', '🔕', 'Notificaciones desactivadas', 'Activa las notificaciones para estar al día');
            elements.enableBtn.style.display = 'inline-flex';
            break;
    }
}

/**
 * Solicitar permisos de notificación
 */
async function requestNotificationPermission() {
    try {
        elements.enableBtn.classList.add('loading');
        log('Solicitando permisos...');

        const permission = await Notification.requestPermission();
        log(`Permiso otorgado: ${permission}`);

        if (permission === 'granted') {
            // Suscribir solo a OneSignal
            const oneSignalResult = await subscribeOneSignal();
            if (oneSignalResult && oneSignalResult.success) {
                log('✅ Suscrito a OneSignal exitosamente!');
                log('Player ID: ' + oneSignalResult.playerId);
                updateStatus('active', '✅', 'Notificaciones activadas', 'Recibirás notificaciones desde OneSignal');
            } else {
                log('❌ Error al suscribir a OneSignal');
                updateStatus('denied', '🚫', 'Error', 'No se pudo completar la suscripción');
            }
            
            checkNotificationPermission();
        } else {
            checkNotificationPermission();
        }
    } catch (error) {
        log(`Error al solicitar permisos: ${error.message}`, 'error');
    } finally {
        elements.enableBtn.classList.remove('loading');
    }
}

/**
 * Obtener token de Firebase
 */
async function getFirebaseToken() {
    try {
        const swRegistration = await navigator.serviceWorker.ready;
        
        const token = await window.firebaseMessaging.getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });

        if (token) {
            currentToken = token;
            log(`Token obtenido: ${token.substring(0, 20)}...`);
            
            // Enviar token al servidor
            await saveTokenToServer(token);
        } else {
            log('No se pudo obtener el token', 'error');
        }
    } catch (error) {
        log(`Error al obtener token: ${error.message}`, 'error');
    }
}

/**
 * Guardar token en el servidor
 */
async function saveTokenToServer(token) {
    try {
        const response = await fetch(`${API_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                userId: getUserId(), // ID del usuario si está logueado
                metadata: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    timestamp: new Date().toISOString()
                }
            })
        });

        const data = await response.json();
        
        if (data.success) {
            log('Token guardado en el servidor correctamente');
        } else {
            log(`Error al guardar token: ${data.error}`, 'error');
        }
    } catch (error) {
        log(`Error al conectar con el servidor: ${error.message}`, 'error');
    }
}

/**
 * Desactivar notificaciones
 */
async function disableNotifications() {
    try {
        elements.disableBtn.classList.add('loading');
        
        if (currentToken) {
            // Eliminar token del servidor
            await fetch(`${API_URL}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: currentToken })
            });
        }

        currentToken = null;
        updateStatus('inactive', '🔕', 'Notificaciones desactivadas', 'Has desactivado las notificaciones');
        elements.enableBtn.style.display = 'inline-flex';
        elements.disableBtn.style.display = 'none';
        elements.testBtn.style.display = 'none';
        
        log('Notificaciones desactivadas');
    } catch (error) {
        log(`Error al desactivar: ${error.message}`, 'error');
    } finally {
        elements.disableBtn.classList.remove('loading');
    }
}

/**
 * Enviar notificación de prueba
 */
async function sendTestNotification() {
    try {
        elements.testBtn.classList.add('loading');
        
        const response = await fetch(`${API_URL}/send-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: currentToken })
        });

        const data = await response.json();
        
        if (data.success) {
            log('Notificación de prueba enviada');
        }
    } catch (error) {
        log(`Error al enviar notificación de prueba: ${error.message}`, 'error');
    } finally {
        elements.testBtn.classList.remove('loading');
    }
}

/**
 * Configurar panel de administración
 */
function setupAdminPanel() {
    const sendToAllBtn = document.getElementById('sendToAll');
    
    sendToAllBtn.addEventListener('click', async () => {
        const title = document.getElementById('notifTitle').value;
        const body = document.getElementById('notifBody').value;
        const url = document.getElementById('notifUrl').value;

        if (!title || !body) {
            alert('Por favor, completa todos los campos obligatorios');
            return;
        }

        try {
            sendToAllBtn.classList.add('loading');
            
            const response = await fetch(`${API_URL}/send-to-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, body, url })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(`Notificación enviada a ${data.count} usuarios`);
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifBody').value = '';
                document.getElementById('notifUrl').value = '';
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            sendToAllBtn.classList.remove('loading');
        }
    });
}

/**
 * Mostrar notificación (para mensajes en primer plano)
 */
function showNotification(payload) {
    const { title, body, icon, click_action } = payload.notification || payload.data;
    
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: icon || '/icon.png',
            badge: '/badge.png',
            tag: 'notification-' + Date.now(),
            requireInteraction: false
        });

        notification.onclick = () => {
            window.focus();
            if (click_action) {
                window.location.href = click_action;
            }
            notification.close();
        };
    }
}

/**
 * Actualizar estado visual
 */
function updateStatus(state, icon, title, message) {
    elements.statusIcon.textContent = icon;
    elements.statusTitle.textContent = title;
    elements.statusMessage.textContent = message;
    
    elements.statusCard.classList.remove('active', 'inactive', 'denied');
    elements.statusCard.classList.add(state);
}

/**
 * Obtener ID de usuario (simulado - implementar según tu sistema de autenticación)
 */
function getUserId() {
    // Intentar obtener de localStorage o cookie
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
        // Generar ID único para usuarios no logueados
        userId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('userId', userId);
    }
    
    return userId;
}

/**
 * Función de logging
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    
    if (elements.debugLog) {
        const logEntry = document.createElement('p');
        logEntry.textContent = `[${timestamp}] ${message}`;
        logEntry.style.color = type === 'error' ? 'red' : 'black';
        elements.debugLog.appendChild(logEntry);
        elements.debugLog.scrollTop = elements.debugLog.scrollHeight;
    }
}
