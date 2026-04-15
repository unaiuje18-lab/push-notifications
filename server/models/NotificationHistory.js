/**
 * Modelo para historial de notificaciones
 */

const { runQuery, getOne, getAll } = require('../config/database');

class NotificationHistory {
    /**
     * Registrar notificación enviada
     */
    static async create(notification, stats = {}) {
        try {
            const result = await runQuery(`
                INSERT INTO notification_history 
                (title, body, url, icon, recipients_count, success_count, failure_count, sent_by, notification_type, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                notification.title,
                notification.body,
                notification.url || null,
                notification.icon || null,
                stats.recipientsCount || 0,
                stats.successCount || 0,
                stats.failureCount || 0,
                notification.sentBy || 'system',
                notification.type || 'manual',
                JSON.stringify(notification.metadata || {})
            ]);

            return result.lastID;
        } catch (error) {
            console.error('Error al crear registro en historial:', error);
            throw error;
        }
    }

    /**
     * Obtener historial reciente
     */
    static async getRecent(limit = 50) {
        try {
            return await getAll(
                'SELECT * FROM notification_history ORDER BY sent_at DESC LIMIT ?',
                [limit]
            );
        } catch (error) {
            console.error('Error al obtener historial reciente:', error);
            throw error;
        }
    }

    /**
     * Obtener por ID
     */
    static async getById(id) {
        try {
            return await getOne(
                'SELECT * FROM notification_history WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error al obtener notificación por ID:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas
     */
    static async getStats(days = 30) {
        try {
            const total = await getOne(`
                SELECT COUNT(*) as count FROM notification_history
                WHERE datetime(sent_at) > datetime('now', '-' || ? || ' days')
            `, [days]);

            const totalSuccess = await getOne(`
                SELECT SUM(success_count) as count FROM notification_history
                WHERE datetime(sent_at) > datetime('now', '-' || ? || ' days')
            `, [days]);

            const totalFailure = await getOne(`
                SELECT SUM(failure_count) as count FROM notification_history
                WHERE datetime(sent_at) > datetime('now', '-' || ? || ' days')
            `, [days]);

            return {
                totalNotifications: total.count,
                totalSuccess: totalSuccess.count || 0,
                totalFailure: totalFailure.count || 0,
                successRate: totalSuccess.count > 0 
                    ? ((totalSuccess.count / (totalSuccess.count + (totalFailure.count || 0))) * 100).toFixed(2) 
                    : 0
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

module.exports = NotificationHistory;
