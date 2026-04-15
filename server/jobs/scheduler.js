/**
 * Sistema de trabajos programados (Cron Jobs)
 */

const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const { sendToMultipleTokens } = require('../config/firebase');
const NotificationHistory = require('../models/NotificationHistory');

/**
 * Iniciar todos los trabajos programados
 */
function startScheduledJobs() {
    console.log('📅 Configurando trabajos programados...');

    // Limpiar suscripciones inactivas (cada día a las 3:00 AM)
    cron.schedule('0 3 * * *', async () => {
        console.log('🧹 Ejecutando limpieza de suscripciones inactivas...');
        try {
            const deleted = await Subscription.deleteInactive(30);
            console.log(`✅ Limpieza completada: ${deleted} suscripciones eliminadas`);
        } catch (error) {
            console.error('❌ Error en limpieza de suscripciones:', error);
        }
    });

    // Ejemplo: Notificación diaria (descomentay ajusta según necesites)
    /*
    cron.schedule('0 9 * * *', async () => {
        console.log('📨 Enviando notificación diaria...');
        try {
            const tokens = await Subscription.getAllActiveTokens();
            
            if (tokens.length > 0) {
                const notification = {
                    title: '¡Buenos días! ☀️',
                    body: 'Tienes nuevas actualizaciones esperándote',
                    url: '/',
                    icon: '/icon.png'
                };

                const result = await sendToMultipleTokens(tokens, notification);
                
                await NotificationHistory.create({
                    ...notification,
                    type: 'scheduled-daily'
                }, {
                    recipientsCount: tokens.length,
                    successCount: result.successCount,
                    failureCount: result.failureCount
                });

                console.log(`✅ Notificación diaria enviada a ${result.successCount} usuarios`);
            }
        } catch (error) {
            console.error('❌ Error al enviar notificación diaria:', error);
        }
    });
    */

    // Ejemplo: Notificación semanal (cada lunes a las 10:00 AM)
    /*
    cron.schedule('0 10 * * 1', async () => {
        console.log('📨 Enviando resumen semanal...');
        try {
            const tokens = await Subscription.getAllActiveTokens();
            
            if (tokens.length > 0) {
                const notification = {
                    title: '📊 Resumen semanal',
                    body: 'Aquí está tu resumen de la semana',
                    url: '/weekly-summary',
                    icon: '/icon.png'
                };

                const result = await sendToMultipleTokens(tokens, notification);
                
                await NotificationHistory.create({
                    ...notification,
                    type: 'scheduled-weekly'
                }, {
                    recipientsCount: tokens.length,
                    successCount: result.successCount,
                    failureCount: result.failureCount
                });

                console.log(`✅ Resumen semanal enviado a ${result.successCount} usuarios`);
            }
        } catch (error) {
            console.error('❌ Error al enviar resumen semanal:', error);
        }
    });
    */

    // Recordatorio de re-suscripción (cada semana)
    cron.schedule('0 12 * * 0', async () => {
        console.log('📊 Generando reporte de suscripciones...');
        try {
            const stats = await Subscription.getStats();
            console.log('Estadísticas de suscripciones:', stats);
        } catch (error) {
            console.error('❌ Error al generar reporte:', error);
        }
    });

    console.log('✅ Trabajos programados configurados correctamente');
}

/**
 * Enviar notificación programada personalizada
 */
async function sendScheduledNotification(notification, cronExpression) {
    return cron.schedule(cronExpression, async () => {
        console.log(`📨 Enviando notificación programada: ${notification.title}`);
        try {
            const tokens = await Subscription.getAllActiveTokens();
            
            if (tokens.length > 0) {
                const result = await sendToMultipleTokens(tokens, notification);
                
                await NotificationHistory.create({
                    ...notification,
                    type: 'scheduled-custom'
                }, {
                    recipientsCount: tokens.length,
                    successCount: result.successCount,
                    failureCount: result.failureCount
                });

                console.log(`✅ Notificación enviada a ${result.successCount} usuarios`);
                return result;
            }
        } catch (error) {
            console.error('❌ Error al enviar notificación programada:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    startScheduledJobs,
    sendScheduledNotification
};
