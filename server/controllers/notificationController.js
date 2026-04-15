/**
 * Controlador para gestión de notificaciones push
 */

const { sendToToken, sendToMultipleTokens, sendToTopic: sendToTopicFCM } = require('../config/firebase');
const Subscription = require('../models/Subscription');
const NotificationHistory = require('../models/NotificationHistory');
const validator = require('validator');

/**
 * Suscribir un token
 */
async function subscribe(req, res) {
    try {
        const { token, userId, metadata } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token es requerido'
            });
        }

        const subscription = await Subscription.createOrUpdate(token, userId, metadata);

        res.json({
            success: true,
            message: subscription.isNew ? 'Suscripción creada' : 'Suscripción actualizada',
            subscriptionId: subscription.id
        });

    } catch (error) {
        console.error('Error en subscribe:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la suscripción'
        });
    }
}

/**
 * Desuscribir un token
 */
async function unsubscribe(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token es requerido'
            });
        }

        const deleted = await Subscription.deactivate(token);

        res.json({
            success: true,
            message: deleted ? 'Suscripción desactivada' : 'Suscripción no encontrada'
        });

    } catch (error) {
        console.error('Error en unsubscribe:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la desuscripción'
        });
    }
}

/**
 * Enviar notificación de prueba
 */
async function sendTest(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token es requerido'
            });
        }

        const notification = {
            title: '🧪 Notificación de prueba',
            body: 'Si ves esto, ¡las notificaciones funcionan correctamente!',
            icon: '/icon.png',
            url: '/'
        };

        const result = await sendToToken(token, notification);

        if (result.success) {
            // Registrar en el historial
            await NotificationHistory.create({
                title: notification.title,
                body: notification.body,
                url: notification.url,
                type: 'test'
            }, {
                recipientsCount: 1,
                successCount: 1,
                failureCount: 0
            });
        }

        res.json(result);

    } catch (error) {
        console.error('Error en sendTest:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar notificación de prueba'
        });
    }
}

/**
 * Enviar notificación a todos los usuarios
 */
async function sendToAll(req, res) {
    try {
        const { title, body, url, icon } = req.body;

        // Validar datos
        if (!title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Título y mensaje son requeridos'
            });
        }

        // Sanitizar entrada
        const sanitizedTitle = validator.escape(title);
        const sanitizedBody = validator.escape(body);
        const sanitizedUrl = url && validator.isURL(url) ? url : '/';

        // Obtener todos los tokens activos
        const tokens = await Subscription.getAllActiveTokens();

        if (tokens.length === 0) {
            return res.json({
                success: true,
                message: 'No hay usuarios suscritos',
                count: 0
            });
        }

        const notification = {
            title: sanitizedTitle,
            body: sanitizedBody,
            url: sanitizedUrl,
            icon: icon || '/icon.png'
        };

        // Enviar notificaciones
        const result = await sendToMultipleTokens(tokens, notification);

        // Limpiar tokens inválidos
        if (result.invalidTokens && result.invalidTokens.length > 0) {
            for (const invalidToken of result.invalidTokens) {
                await Subscription.deactivate(invalidToken);
            }
        }

        // Registrar en historial
        await NotificationHistory.create({
            title: notification.title,
            body: notification.body,
            url: notification.url,
            icon: notification.icon,
            type: 'broadcast'
        }, {
            recipientsCount: tokens.length,
            successCount: result.successCount,
            failureCount: result.failureCount
        });

        res.json({
            success: true,
            count: result.successCount,
            failed: result.failureCount,
            message: `Notificación enviada a ${result.successCount} usuarios`
        });

    } catch (error) {
        console.error('Error en sendToAll:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar notificación'
        });
    }
}

/**
 * Enviar notificación a un usuario específico
 */
async function sendToUser(req, res) {
    try {
        const { userId, title, body, url, icon } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                success: false,
                error: 'userId, título y mensaje son requeridos'
            });
        }

        // Obtener suscripciones del usuario
        const subscriptions = await Subscription.getByUserId(userId);

        if (subscriptions.length === 0) {
            return res.json({
                success: false,
                error: 'Usuario no tiene suscripciones activas'
            });
        }

        const tokens = subscriptions.map(sub => sub.token);
        const notification = {
            title: validator.escape(title),
            body: validator.escape(body),
            url: url || '/',
            icon: icon || '/icon.png'
        };

        const result = await sendToMultipleTokens(tokens, notification);

        // Registrar en historial
        await NotificationHistory.create({
            title: notification.title,
            body: notification.body,
            url: notification.url,
            type: 'user-specific',
            metadata: { userId }
        }, {
            recipientsCount: tokens.length,
            successCount: result.successCount,
            failureCount: result.failureCount
        });

        res.json({
            success: true,
            count: result.successCount,
            message: `Notificación enviada al usuario ${userId}`
        });

    } catch (error) {
        console.error('Error en sendToUser:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar notificación al usuario'
        });
    }
}

/**
 * Enviar notificación a un topic
 */
async function sendToTopic(req, res) {
    try {
        const { topic, title, body, url, icon } = req.body;

        if (!topic || !title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Topic, título y mensaje son requeridos'
            });
        }

        const notification = {
            title: validator.escape(title),
            body: validator.escape(body),
            url: url || '/',
            icon: icon || '/icon.png'
        };

        const result = await sendToTopicFCM(topic, notification);

        // Registrar en historial
        await NotificationHistory.create({
            title: notification.title,
            body: notification.body,
            url: notification.url,
            type: 'topic',
            metadata: { topic }
        }, {
            recipientsCount: 1, // No sabemos cuántos exactamente
            successCount: result.success ? 1 : 0,
            failureCount: result.success ? 0 : 1
        });

        res.json(result);

    } catch (error) {
        console.error('Error en sendToTopic:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar notificación al topic'
        });
    }
}

/**
 * Obtener estadísticas
 */
async function getStats(req, res) {
    try {
        const subscriptionStats = await Subscription.getStats();
        const notificationStats = await NotificationHistory.getStats(30);

        res.json({
            success: true,
            data: {
                subscriptions: subscriptionStats,
                notifications: notificationStats
            }
        });

    } catch (error) {
        console.error('Error en getStats:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
}

/**
 * Obtener historial de notificaciones
 */
async function getHistory(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = await NotificationHistory.getRecent(limit);

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error('Error en getHistory:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial'
        });
    }
}

/**
 * Obtener suscripciones activas
 */
async function getSubscriptions(req, res) {
    try {
        const subscriptions = await Subscription.getAllActive();

        res.json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });

    } catch (error) {
        console.error('Error en getSubscriptions:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener suscripciones'
        });
    }
}

module.exports = {
    subscribe,
    unsubscribe,
    sendTest,
    sendToAll,
    sendToUser,
    sendToTopic,
    getStats,
    getHistory,
    getSubscriptions
};
