/**
 * Rutas para la API de notificaciones
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * POST /api/subscribe
 * Suscribir un nuevo token
 */
router.post('/subscribe', notificationController.subscribe);

/**
 * POST /api/unsubscribe
 * Desuscribir un token
 */
router.post('/unsubscribe', notificationController.unsubscribe);

/**
 * POST /api/send-test
 * Enviar notificación de prueba a un token específico
 */
router.post('/send-test', notificationController.sendTest);

/**
 * POST /api/send-to-all
 * Enviar notificación a todos los usuarios suscritos
 */
router.post('/send-to-all', notificationController.sendToAll);

/**
 * POST /api/send-to-user
 * Enviar notificación a un usuario específico
 */
router.post('/send-to-user', notificationController.sendToUser);

/**
 * POST /api/send-to-topic
 * Enviar notificación a un topic específico
 */
router.post('/send-to-topic', notificationController.sendToTopic);

/**
 * GET /api/stats
 * Obtener estadísticas del sistema
 */
router.get('/stats', notificationController.getStats);

/**
 * GET /api/history
 * Obtener historial de notificaciones
 */
router.get('/history', notificationController.getHistory);

/**
 * GET /api/subscriptions
 * Obtener lista de suscripciones activas
 */
router.get('/subscriptions', notificationController.getSubscriptions);

module.exports = router;
