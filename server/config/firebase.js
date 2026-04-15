/**
 * Configuración de Firebase Admin SDK
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let messaging = null;

/**
 * Inicializar Firebase Admin SDK
 */
async function initializeFirebase() {
    try {
        // Verificar si ya está inicializado
        if (admin.apps.length > 0) {
            console.log('Firebase ya está inicializado');
            messaging = admin.messaging();
            return messaging;
        }

        // Opción 1: Usar archivo de credenciales
        const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
        
        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(path.resolve(serviceAccountPath));
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            
            console.log('Firebase inicializado con archivo de credenciales');
        } 
        // Opción 2: Usar variables de entorno individuales
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            
            console.log('Firebase inicializado con variables de entorno');
        }
        // Opción 3: Application Default Credentials (para producción en Google Cloud)
        else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
            
            console.log('Firebase inicializado con credenciales por defecto');
        }

        messaging = admin.messaging();
        return messaging;
        
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        throw error;
    }
}

/**
 * Obtener instancia de Firebase Messaging
 */
function getMessaging() {
    if (!messaging) {
        throw new Error('Firebase no está inicializado. Llama a initializeFirebase() primero.');
    }
    return messaging;
}

/**
 * Enviar notificación a un token específico
 */
async function sendToToken(token, notification, data = {}) {
    try {
        const message = {
            token,
            notification: {
                title: notification.title,
                body: notification.body,
                ...(notification.icon && { imageUrl: notification.icon })
            },
            data: {
                ...data,
                click_action: notification.url || '/',
                timestamp: Date.now().toString()
            },
            webpush: {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon || '/icon.png',
                    badge: notification.badge || '/badge.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: notification.requireInteraction || false,
                    tag: notification.tag || 'notification-' + Date.now()
                },
                fcmOptions: {
                    link: notification.url || '/'
                }
            }
        };

        const response = await getMessaging().send(message);
        console.log('Notificación enviada correctamente:', response);
        return { success: true, messageId: response };
        
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        
        // Manejar errores específicos
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
            return { success: false, error: 'Token inválido o expirado', shouldDelete: true };
        }
        
        return { success: false, error: error.message };
    }
}

/**
 * Enviar notificación a múltiples tokens
 */
async function sendToMultipleTokens(tokens, notification, data = {}) {
    try {
        if (!tokens || tokens.length === 0) {
            return { success: false, error: 'No hay tokens para enviar' };
        }

        // Firebase limita a 500 tokens por mensaje multicast
        const batchSize = 500;
        const results = {
            successCount: 0,
            failureCount: 0,
            invalidTokens: []
        };

        // Procesar en lotes
        for (let i = 0; i < tokens.length; i += batchSize) {
            const batch = tokens.slice(i, i + batchSize);
            
            const message = {
                tokens: batch,
                notification: {
                    title: notification.title,
                    body: notification.body
                },
                data: {
                    ...data,
                    click_action: notification.url || '/',
                    timestamp: Date.now().toString()
                },
                webpush: {
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon || '/icon.png',
                        badge: notification.badge || '/badge.png',
                        vibrate: [200, 100, 200]
                    },
                    fcmOptions: {
                        link: notification.url || '/'
                    }
                }
            };

            const response = await getMessaging().sendEachForMulticast(message);
            
            results.successCount += response.successCount;
            results.failureCount += response.failureCount;

            // Recolectar tokens inválidos
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error.code === 'messaging/invalid-registration-token' || 
                        error.code === 'messaging/registration-token-not-registered') {
                        results.invalidTokens.push(batch[idx]);
                    }
                }
            });
        }

        console.log(`Notificaciones enviadas - Éxito: ${results.successCount}, Fallos: ${results.failureCount}`);
        
        return {
            success: true,
            ...results
        };
        
    } catch (error) {
        console.error('Error al enviar notificaciones múltiples:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar notificación a un topic
 */
async function sendToTopic(topic, notification, data = {}) {
    try {
        const message = {
            topic,
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: {
                ...data,
                click_action: notification.url || '/',
                timestamp: Date.now().toString()
            },
            webpush: {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon || '/icon.png',
                    badge: notification.badge || '/badge.png'
                },
                fcmOptions: {
                    link: notification.url || '/'
                }
            }
        };

        const response = await getMessaging().send(message);
        console.log('Notificación enviada al topic:', topic, response);
        return { success: true, messageId: response };
        
    } catch (error) {
        console.error('Error al enviar notificación al topic:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Suscribir tokens a un topic
 */
async function subscribeToTopic(tokens, topic) {
    try {
        const response = await getMessaging().subscribeToTopic(tokens, topic);
        console.log(`${response.successCount} tokens suscritos al topic ${topic}`);
        return { success: true, ...response };
    } catch (error) {
        console.error('Error al suscribir al topic:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Desuscribir tokens de un topic
 */
async function unsubscribeFromTopic(tokens, topic) {
    try {
        const response = await getMessaging().unsubscribeFromTopic(tokens, topic);
        console.log(`${response.successCount} tokens desuscritos del topic ${topic}`);
        return { success: true, ...response };
    } catch (error) {
        console.error('Error al desuscribir del topic:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    initializeFirebase,
    getMessaging,
    sendToToken,
    sendToMultipleTokens,
    sendToTopic,
    subscribeToTopic,
    unsubscribeFromTopic
};
